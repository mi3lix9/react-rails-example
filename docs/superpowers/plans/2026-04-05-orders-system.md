# Orders System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an orders system with frontend cart (localStorage), two-step checkout, customer order tracking via token URL, and merchant admin dashboard for order status management.

**Architecture:** Rails backend with Order + OrderItem models, two controllers (customer-facing `OrdersController` and `Admin::OrdersController`). Frontend cart managed entirely in localStorage via a `useCart` React hook. Inertia.js bridges Rails and React as in the existing product pages.

**Tech Stack:** Rails 8.1, Inertia.js, React 19, TypeScript, shadcn/ui, Tailwind CSS 4

---

## File Structure

### New Files — Backend
- `db/migrate/TIMESTAMP_create_orders.rb` — orders table migration
- `db/migrate/TIMESTAMP_create_order_items.rb` — order_items table migration
- `app/models/order.rb` — Order model with validations, status logic, token generation
- `app/models/order_item.rb` — OrderItem model with validations
- `app/controllers/orders_controller.rb` — customer-facing create + show
- `app/controllers/admin/orders_controller.rb` — merchant index, show, update
- `app/controllers/cart_controller.rb` — renders empty Inertia cart page
- `app/controllers/checkout_controller.rb` — renders empty Inertia checkout page

### New Files — Frontend
- `app/frontend/hooks/useCart.ts` — cart hook (localStorage, add/remove/update/clear/totals)
- `app/frontend/pages/Cart/Index.tsx` — cart page
- `app/frontend/pages/Checkout/Index.tsx` — checkout page with customer form
- `app/frontend/pages/Orders/Show.tsx` — order confirmation/status page
- `app/frontend/pages/Admin/Orders/Index.tsx` — merchant order list
- `app/frontend/pages/Admin/Orders/Show.tsx` — merchant order detail + status controls

### Modified Files
- `config/routes.rb` — add cart, checkout, orders, admin/orders routes
- `app/models/product.rb` — add `has_many :order_items`
- `app/frontend/components/Header.tsx` — add cart icon with count badge
- `app/frontend/pages/Products/Index.tsx` — add "Add to Cart" button per row
- `app/frontend/pages/Products/Show.tsx` — add "Add to Cart" button

---

### Task 1: Database Migrations

**Files:**
- Create: `db/migrate/TIMESTAMP_create_orders.rb`
- Create: `db/migrate/TIMESTAMP_create_order_items.rb`

- [ ] **Step 1: Generate orders migration**

Run:
```bash
bin/rails generate migration CreateOrders customer_name:string customer_email:string status:string total:decimal token:string
```

- [ ] **Step 2: Edit the orders migration for constraints**

The generated migration needs precision/scale on `total`, default on `status`, null constraints, and a unique index on `token`:

```ruby
class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders do |t|
      t.string :customer_name, null: false
      t.string :customer_email, null: false
      t.string :status, null: false, default: "pending"
      t.decimal :total, precision: 10, scale: 2, null: false
      t.string :token, null: false

      t.timestamps
    end

    add_index :orders, :token, unique: true
  end
end
```

- [ ] **Step 3: Generate order_items migration**

Run:
```bash
bin/rails generate migration CreateOrderItems order:references product:references quantity:integer unit_price:decimal
```

- [ ] **Step 4: Edit the order_items migration for constraints**

```ruby
class CreateOrderItems < ActiveRecord::Migration[8.1]
  def change
    create_table :order_items do |t|
      t.references :order, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      t.integer :quantity, null: false
      t.decimal :unit_price, precision: 10, scale: 2, null: false

      t.timestamps
    end
  end
end
```

- [ ] **Step 5: Run migrations**

Run:
```bash
bin/rails db:migrate
```

Expected: Both tables created, `db/schema.rb` updated with `orders` and `order_items` tables.

- [ ] **Step 6: Commit**

```bash
git add db/
git commit -m "feat: add orders and order_items migrations"
```

---

### Task 2: Order and OrderItem Models

**Files:**
- Create: `app/models/order.rb`
- Create: `app/models/order_item.rb`
- Modify: `app/models/product.rb`

- [ ] **Step 1: Write the Order model**

```ruby
class Order < ApplicationRecord
  STATUSES = %w[pending confirmed shipped delivered].freeze
  NEXT_STATUS = {
    "pending" => "confirmed",
    "confirmed" => "shipped",
    "shipped" => "delivered"
  }.freeze

  has_many :order_items, dependent: :destroy
  has_many :products, through: :order_items

  validates :customer_name, presence: true
  validates :customer_email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :total, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :token, presence: true, uniqueness: true

  before_validation :generate_token, on: :create

  def next_status
    NEXT_STATUS[status]
  end

  def can_advance?
    next_status.present?
  end

  def advance_status!
    raise "Cannot advance from #{status}" unless can_advance?
    update!(status: next_status)
  end

  private

  def generate_token
    self.token ||= SecureRandom.hex(16)
  end
end
```

- [ ] **Step 2: Write the OrderItem model**

```ruby
class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :product

  validates :quantity, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 1 }
  validates :unit_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
end
```

- [ ] **Step 3: Add association to Product model**

Add `has_many :order_items` to `app/models/product.rb`:

```ruby
class Product < ApplicationRecord
  has_many :order_items

  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
end
```

- [ ] **Step 4: Verify models load**

Run:
```bash
bin/rails runner "puts Order.new.valid?; puts OrderItem.new.valid?; puts Product.reflect_on_association(:order_items).macro"
```

Expected: `false`, `false`, `has_many` (invalid because required fields are missing, which confirms validations work).

- [ ] **Step 5: Commit**

```bash
git add app/models/
git commit -m "feat: add Order and OrderItem models with validations"
```

---

### Task 3: Routes

**Files:**
- Modify: `config/routes.rb`

- [ ] **Step 1: Update routes**

Replace the contents of `config/routes.rb` with:

```ruby
Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  root "products#index"
  resources :products

  get "cart", to: "cart#index"
  get "checkout", to: "checkout#index"
  resources :orders, only: [:create, :show], param: :token

  namespace :admin do
    resources :orders, only: [:index, :show, :update]
  end
end
```

- [ ] **Step 2: Verify routes**

Run:
```bash
bin/rails routes | grep -E "cart|checkout|order|admin"
```

Expected output should show:
- `GET /cart` -> `cart#index`
- `GET /checkout` -> `checkout#index`
- `POST /orders` -> `orders#create`
- `GET /orders/:token` -> `orders#show`
- `GET /admin/orders` -> `admin/orders#index`
- `GET /admin/orders/:id` -> `admin/orders#show`
- `PATCH /admin/orders/:id` -> `admin/orders#update`

- [ ] **Step 3: Commit**

```bash
git add config/routes.rb
git commit -m "feat: add cart, checkout, orders, and admin routes"
```

---

### Task 4: Backend Controllers

**Files:**
- Create: `app/controllers/cart_controller.rb`
- Create: `app/controllers/checkout_controller.rb`
- Create: `app/controllers/orders_controller.rb`
- Create: `app/controllers/admin/orders_controller.rb`

- [ ] **Step 1: Create CartController**

```ruby
class CartController < ApplicationController
  def index
    render inertia: "Cart/Index"
  end
end
```

- [ ] **Step 2: Create CheckoutController**

```ruby
class CheckoutController < ApplicationController
  def index
    render inertia: "Checkout/Index"
  end
end
```

- [ ] **Step 3: Create OrdersController**

```ruby
class OrdersController < ApplicationController
  def create
    items_params = params.require(:items)
    product_ids = items_params.map { |i| i[:product_id] }
    products = Product.where(id: product_ids).index_by(&:id)

    order = Order.new(
      customer_name: params.require(:customer_name),
      customer_email: params.require(:customer_email)
    )

    total = 0
    items_params.each do |item|
      product = products[item[:product_id].to_i]
      next unless product

      quantity = item[:quantity].to_i
      unit_price = product.price

      order.order_items.build(
        product: product,
        quantity: quantity,
        unit_price: unit_price
      )
      total += unit_price * quantity
    end

    order.total = total

    if order.save
      redirect_to order_path(order.token)
    else
      redirect_back fallback_location: checkout_path, inertia: { errors: order.errors.to_hash(true) }
    end
  end

  def show
    order = Order.includes(order_items: :product).find_by!(token: params[:token])
    render inertia: "Orders/Show", props: {
      order: serialize_order(order)
    }
  end

  private

  def serialize_order(order)
    {
      token: order.token,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      status: order.status,
      total: order.total.to_f,
      created_at: order.created_at.iso8601,
      items: order.order_items.map { |item|
        {
          id: item.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.unit_price.to_f
        }
      }
    }
  end
end
```

- [ ] **Step 4: Create admin directory and Admin::OrdersController**

Run `mkdir -p app/controllers/admin` then create `app/controllers/admin/orders_controller.rb`:

```ruby
module Admin
  class OrdersController < ApplicationController
    def index
      orders = Order.order(created_at: :desc).map { |o|
        {
          id: o.id,
          customer_name: o.customer_name,
          customer_email: o.customer_email,
          status: o.status,
          total: o.total.to_f,
          created_at: o.created_at.iso8601
        }
      }
      render inertia: "Admin/Orders/Index", props: { orders: orders }
    end

    def show
      order = Order.includes(order_items: :product).find(params[:id])
      render inertia: "Admin/Orders/Show", props: {
        order: {
          id: order.id,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          status: order.status,
          total: order.total.to_f,
          created_at: order.created_at.iso8601,
          next_status: order.next_status,
          items: order.order_items.map { |item|
            {
              id: item.id,
              product_name: item.product.name,
              quantity: item.quantity,
              unit_price: item.unit_price.to_f
            }
          }
        }
      }
    end

    def update
      order = Order.find(params[:id])
      new_status = params.require(:status)

      if new_status == order.next_status
        order.advance_status!
        redirect_to admin_order_path(order)
      else
        redirect_back fallback_location: admin_order_path(order),
          inertia: { errors: { status: ["Invalid status transition"] } }
      end
    end
  end
end
```

- [ ] **Step 5: Verify controllers load**

Run:
```bash
bin/rails runner "puts CartController; puts CheckoutController; puts OrdersController; puts Admin::OrdersController"
```

Expected: All four class names printed without errors.

- [ ] **Step 6: Commit**

```bash
git add app/controllers/
git commit -m "feat: add cart, checkout, orders, and admin controllers"
```

---

### Task 5: useCart Hook

**Files:**
- Create: `app/frontend/hooks/useCart.ts`

- [ ] **Step 1: Create the hooks directory**

Run:
```bash
mkdir -p app/frontend/hooks
```

- [ ] **Step 2: Write the useCart hook**

```typescript
import { useState, useEffect, useCallback } from "react";

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

const CART_KEY = "store_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = useCallback(
    (product: { id: number; name: string; price: number }) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product.id);
        if (existing) {
          return prev.map((i) =>
            i.productId === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }
        return [
          ...prev,
          { productId: product.id, name: product.name, price: product.price, quantity: 1 },
        ];
      });
    },
    []
  );

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const cartTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, cartTotal, cartCount };
}
```

- [ ] **Step 3: Commit**

```bash
git add app/frontend/hooks/
git commit -m "feat: add useCart hook with localStorage persistence"
```

---

### Task 6: Update Header with Cart Badge

**Files:**
- Modify: `app/frontend/components/Header.tsx`

- [ ] **Step 1: Update Header to show cart count**

Replace the full contents of `app/frontend/components/Header.tsx`:

```tsx
import { Link } from "@inertiajs/react";
import DarkModeSwitch from "@/components/shadcn-studio/switch/switch-11";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";

export default function Header() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });
  const { cartCount } = useCart();

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
    } else if (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDark(true);
    }
  }, []);

  return (
    <header className="border-b">
      <div className="mx-auto max-w-2xl flex items-center justify-between py-3 px-4">
        <Link href="/products" className="text-lg font-bold hover:opacity-80">
          Store
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative hover:opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          <DarkModeSwitch checked={dark} onCheckedChange={setDark} />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify the dev server compiles**

Run:
```bash
bin/vite build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/frontend/components/Header.tsx
git commit -m "feat: add cart icon with count badge to header"
```

---

### Task 7: Add "Add to Cart" to Product Pages

**Files:**
- Modify: `app/frontend/pages/Products/Index.tsx`
- Modify: `app/frontend/pages/Products/Show.tsx`

- [ ] **Step 1: Update Products/Index.tsx**

Add the import at the top with the other imports:

```typescript
import { useCart } from "@/hooks/useCart";
```

Inside the `Index` component function, add after the sort state declarations:

```typescript
const { addItem } = useCart();
```

Add a new column header after the Price header inside `<TableHeader>`:

```tsx
<TableHead className="w-24 text-right">Cart</TableHead>
```

Update `colSpan={3}` in the empty state row to `colSpan={4}`.

Add a new cell after the price cell for each product row, before the Actions cell:

```tsx
<TableCell className="text-right">
  <Button
    variant="outline"
    size="sm"
    onClick={() => addItem(product)}
  >
    Add
  </Button>
</TableCell>
```

- [ ] **Step 2: Update Products/Show.tsx**

Add the import:

```typescript
import { useCart } from "@/hooks/useCart";
```

Inside the `Show` component, add:

```typescript
const { addItem } = useCart();
```

Add an "Add to Cart" button in the `CardFooter`, after the Edit button:

```tsx
<Button variant="outline" onClick={() => addItem(product)}>
  Add to Cart
</Button>
```

- [ ] **Step 3: Verify build**

Run:
```bash
bin/vite build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/frontend/pages/Products/
git commit -m "feat: add 'Add to Cart' buttons to product pages"
```

---

### Task 8: Cart Page

**Files:**
- Create: `app/frontend/pages/Cart/Index.tsx`

- [ ] **Step 1: Create Cart directory**

Run:
```bash
mkdir -p app/frontend/pages/Cart
```

- [ ] **Step 2: Write Cart/Index.tsx**

```tsx
import { Link } from "@inertiajs/react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCart } from "@/hooks/useCart";

export default function Index() {
  const { items, removeItem, updateQuantity, cartTotal } = useCart();

  return (
    <div className="mx-auto max-w-2xl py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Your cart is empty.</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="w-28 text-right">Price</TableHead>
                <TableHead className="w-24 text-center">Qty</TableHead>
                <TableHead className="w-28 text-right">Subtotal</TableHead>
                <TableHead className="w-20 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right">
                    ${item.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.productId, parseInt(e.target.value, 10) || 1)
                      }
                      className="w-16 mx-auto text-center"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.productId)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-lg font-semibold">
              Total: ${cartTotal.toFixed(2)}
            </p>
            <Button asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

Index.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;
```

- [ ] **Step 3: Verify build**

Run:
```bash
bin/vite build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/frontend/pages/Cart/
git commit -m "feat: add cart page with quantity editing and totals"
```

---

### Task 9: Checkout Page

**Files:**
- Create: `app/frontend/pages/Checkout/Index.tsx`

- [ ] **Step 1: Create Checkout directory**

Run:
```bash
mkdir -p app/frontend/pages/Checkout
```

- [ ] **Step 2: Write Checkout/Index.tsx**

```tsx
import { Link, useForm } from "@inertiajs/react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCart } from "@/hooks/useCart";

export default function Index() {
  const { items, cartTotal, clearCart } = useCart();

  const form = useForm({
    customer_name: "",
    customer_email: "",
    items: items.map((i) => ({
      product_id: i.productId,
      quantity: i.quantity,
    })),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.transform((data) => ({
      ...data,
      items: items.map((i) => ({
        product_id: i.productId,
        quantity: i.quantity,
      })),
    }));
    form.post("/orders", {
      onSuccess: () => clearCart(),
    });
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-10 px-4 text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Checkout</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customer_name">Name</Label>
                <Input
                  type="text"
                  id="customer_name"
                  value={form.data.customer_name}
                  onChange={(e) => form.setData("customer_name", e.target.value)}
                  placeholder="Your full name"
                />
                {form.errors.customer_name && (
                  <p className="text-sm text-destructive">{form.errors.customer_name}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer_email">Email</Label>
                <Input
                  type="email"
                  id="customer_email"
                  value={form.data.customer_email}
                  onChange={(e) => form.setData("customer_email", e.target.value)}
                  placeholder="you@example.com"
                />
                {form.errors.customer_email && (
                  <p className="text-sm text-destructive">{form.errors.customer_email}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right w-16">Qty</TableHead>
                    <TableHead className="text-right w-24">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} className="font-semibold">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${cartTotal.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={form.processing}>
              {form.processing ? "Placing Order..." : "Place Order"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/cart">Back to Cart</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

Index.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;
```

- [ ] **Step 3: Verify build**

Run:
```bash
bin/vite build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/frontend/pages/Checkout/
git commit -m "feat: add checkout page with customer form and order summary"
```

---

### Task 10: Order Confirmation Page

**Files:**
- Create: `app/frontend/pages/Orders/Show.tsx`

- [ ] **Step 1: Create Orders directory**

Run:
```bash
mkdir -p app/frontend/pages/Orders
```

- [ ] **Step 2: Write Orders/Show.tsx**

```tsx
import { Link } from "@inertiajs/react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  token: string;
  customer_name: string;
  customer_email: string;
  status: string;
  total: number;
  created_at: string;
  items: OrderItem[];
}

interface Props {
  order: Order;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
};

export default function Show({ order }: Props) {
  return (
    <div className="mx-auto max-w-md py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Order Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-semibold">{STATUS_LABELS[order.status]}</p>
          </div>
          <div className="grid gap-1">
            <p className="text-sm text-muted-foreground">Customer</p>
            <p>{order.customer_name} ({order.customer_email})</p>
          </div>
          <div className="grid gap-1">
            <p className="text-sm text-muted-foreground">Placed</p>
            <p>{new Date(order.created_at).toLocaleDateString()}</p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right w-16">Qty</TableHead>
                <TableHead className="text-right w-24">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    ${(item.unit_price * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} className="font-semibold">Total</TableCell>
                <TableCell className="text-right font-semibold">
                  ${order.total.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            Bookmark this page to check your order status. Your order URL:{" "}
            <code className="text-foreground">/orders/{order.token}</code>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

Show.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;
```

- [ ] **Step 3: Verify build**

Run:
```bash
bin/vite build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/frontend/pages/Orders/
git commit -m "feat: add order confirmation page with status and token URL"
```

---

### Task 11: Admin Orders Index Page

**Files:**
- Create: `app/frontend/pages/Admin/Orders/Index.tsx`

- [ ] **Step 1: Create Admin/Orders directory**

Run:
```bash
mkdir -p app/frontend/pages/Admin/Orders
```

- [ ] **Step 2: Write Admin/Orders/Index.tsx**

```tsx
import { Link } from "@inertiajs/react";
import Layout from "@/components/Layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  status: string;
  total: number;
  created_at: string;
}

interface Props {
  orders: Order[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
};

export default function Index({ orders }: Props) {
  return (
    <div className="mx-auto max-w-3xl py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin - Orders</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="w-28">Status</TableHead>
            <TableHead className="w-24 text-right">Total</TableHead>
            <TableHead className="w-28">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                  #{order.id}
                </Link>
              </TableCell>
              <TableCell>{order.customer_name}</TableCell>
              <TableCell>{order.customer_email}</TableCell>
              <TableCell>{STATUS_LABELS[order.status]}</TableCell>
              <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
              <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                No orders yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

Index.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;
```

- [ ] **Step 3: Commit**

```bash
git add app/frontend/pages/Admin/
git commit -m "feat: add admin orders index page"
```

---

### Task 12: Admin Order Detail Page

**Files:**
- Create: `app/frontend/pages/Admin/Orders/Show.tsx`

- [ ] **Step 1: Write Admin/Orders/Show.tsx**

```tsx
import { Link, router } from "@inertiajs/react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  status: string;
  total: number;
  created_at: string;
  next_status: string | null;
  items: OrderItem[];
}

interface Props {
  order: Order;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
};

export default function Show({ order }: Props) {
  const advanceStatus = () => {
    if (!order.next_status) return;
    router.patch(`/admin/orders/${order.id}`, {
      status: order.next_status,
    });
  };

  return (
    <div className="mx-auto max-w-md py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Order #{order.id}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-semibold">{STATUS_LABELS[order.status]}</p>
            </div>
            <div className="grid gap-1">
              <p className="text-sm text-muted-foreground">Date</p>
              <p>{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div className="grid gap-1">
              <p className="text-sm text-muted-foreground">Customer</p>
              <p>{order.customer_name}</p>
            </div>
            <div className="grid gap-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p>{order.customer_email}</p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right w-16">Qty</TableHead>
                <TableHead className="text-right w-24">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    ${(item.unit_price * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} className="font-semibold">Total</TableCell>
                <TableCell className="text-right font-semibold">
                  ${order.total.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex gap-2">
          {order.next_status && (
            <Button onClick={advanceStatus}>
              Mark as {STATUS_LABELS[order.next_status]}
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/admin/orders">Back to Orders</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

Show.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;
```

- [ ] **Step 2: Verify full build**

Run:
```bash
bin/vite build 2>&1 | tail -5
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add app/frontend/pages/Admin/Orders/Show.tsx
git commit -m "feat: add admin order detail page with status advancement"
```

---

### Task 13: End-to-End Smoke Test

- [ ] **Step 1: Start the dev server**

Run:
```bash
bin/dev
```

- [ ] **Step 2: Manual smoke test**

1. Visit `/products` — verify "Add" button appears in each row
2. Click "Add" on a product — verify cart badge shows `1` in header
3. Click cart icon → `/cart` — verify product appears with quantity and total
4. Click "Proceed to Checkout" → `/checkout` — verify order summary and form
5. Fill in name + email, click "Place Order" — verify redirect to `/orders/:token`
6. Verify order confirmation shows items, total, status "Pending", and token URL
7. Visit `/admin/orders` — verify order appears in the table
8. Click the order → `/admin/orders/:id` — verify details and "Mark as Confirmed" button
9. Click "Mark as Confirmed" — verify status changes to "Confirmed" and button says "Mark as Shipped"
10. Advance through Shipped → Delivered — verify no more advance button at Delivered

- [ ] **Step 3: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: smoke test fixes for orders system"
```
