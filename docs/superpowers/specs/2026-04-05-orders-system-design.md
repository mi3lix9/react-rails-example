# Orders System Design

## Overview

Add an orders system to the store app. Customers browse products, add them to a frontend-only cart (localStorage), proceed through a two-step checkout, and receive a unique token URL to track their order. A merchant admin dashboard at `/admin/orders` allows viewing and advancing order status.

No authentication. Customers provide name + email at checkout. Orders are accessed via unique token URLs.

## Data Models

### Order

| Column           | Type           | Constraints                                          |
|------------------|----------------|------------------------------------------------------|
| `id`             | integer        | PK                                                   |
| `token`          | string         | Unique, indexed, generated via `SecureRandom.hex(16)` |
| `customer_name`  | string         | Required                                             |
| `customer_email` | string         | Required                                             |
| `status`         | string         | Default `"pending"`. Enum: pending, confirmed, shipped, delivered |
| `total`          | decimal(10,2)  | Computed from items on creation                      |
| `created_at`     | datetime       |                                                      |
| `updated_at`     | datetime       |                                                      |

### OrderItem

| Column       | Type          | Constraints                          |
|--------------|---------------|--------------------------------------|
| `id`         | integer       | PK                                   |
| `order_id`   | integer       | FK -> orders, indexed                |
| `product_id` | integer       | FK -> products, indexed              |
| `quantity`    | integer       | Required, >= 1                       |
| `unit_price`  | decimal(10,2) | Snapshot of product price at order time |
| `created_at`  | datetime      |                                      |
| `updated_at`  | datetime      |                                      |

### Associations

- `Order` has_many `:order_items`, has_many `:products` through `:order_items`
- `OrderItem` belongs_to `:order`, belongs_to `:product`
- `Product` has_many `:order_items`

## API Endpoints

### Customer-Facing

| Method | Path             | Controller#Action     | Purpose                              |
|--------|------------------|-----------------------|--------------------------------------|
| `POST` | `/orders`        | `orders#create`       | Place an order (cart + customer info) |
| `GET`  | `/orders/:token` | `orders#show`         | View order confirmation/status       |

### Admin (Merchant)

| Method  | Path               | Controller#Action        | Purpose              |
|---------|--------------------|--------------------------|----------------------|
| `GET`   | `/admin/orders`    | `admin/orders#index`     | List all orders      |
| `GET`   | `/admin/orders/:id`| `admin/orders#show`      | View order details   |
| `PATCH` | `/admin/orders/:id`| `admin/orders#update`    | Advance order status |

### Routes Definition

```ruby
get "cart", to: "cart#index"
get "checkout", to: "checkout#index"
resources :orders, only: [:create, :show], param: :token
namespace :admin do
  resources :orders, only: [:index, :show, :update]
end
```

`CartController#index` and `CheckoutController#index` render empty Inertia pages (no props). All cart data is read from localStorage on the client side.

### Request/Response

**POST /orders** request body:
```json
{
  "customer_name": "Ali",
  "customer_email": "ali@example.com",
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ]
}
```

The controller fetches current product prices, snapshots them into `OrderItem.unit_price`, computes the total, and creates the order in a transaction. On success, redirects to `/orders/:token`.

**PATCH /admin/orders/:id** request body:
```json
{
  "status": "confirmed"
}
```

Status can only advance forward: pending -> confirmed -> shipped -> delivered. The controller validates that the new status is the next valid step.

## Frontend

### Cart System

- **Storage:** localStorage as JSON array `[{ productId, name, price, quantity }]`
- **Hook:** `useCart` encapsulating: `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `cartTotal`, `cartCount`
- Cart cleared after successful order placement

### New Pages

| Page                | Route              | Purpose                                                  |
|---------------------|--------------------|----------------------------------------------------------|
| `Cart/Index`        | `/cart`            | View cart, adjust quantities, proceed to checkout        |
| `Checkout/Index`    | `/checkout`        | Name + email form, order summary, place order button     |
| `Orders/Show`       | `/orders/:token`   | Order confirmation with items, total, status, token URL  |
| `Admin/Orders/Index`| `/admin/orders`    | Table of all orders with status, sortable                |
| `Admin/Orders/Show` | `/admin/orders/:id`| Order detail + status advance button                     |

### Modifications to Existing Pages

- **Products/Index:** Add "Add to Cart" button per product row
- **Products/Show:** Add "Add to Cart" button
- **Header:** Add cart icon with item count badge, link to `/cart`

### Cart and Checkout Pages

`Cart/Index` and `Checkout/Index` are **static Inertia pages** — they receive no props from Rails. All cart data comes from localStorage via the `useCart` hook. The checkout page additionally uses Inertia's `useForm` to POST to `/orders`.

### Customer Flow

1. Browse products, click "Add to Cart"
2. Navigate to `/cart`, review and adjust items
3. Click "Proceed to Checkout" -> `/checkout`
4. Enter name + email, review order summary
5. Click "Place Order" -> `POST /orders`
6. Redirected to `/orders/:token` confirmation page
7. Bookmark the token URL to check status later

### Merchant Flow

1. Visit `/admin/orders` -> see all orders in a table
2. Click an order -> `/admin/orders/:id`
3. See order details (customer info, items, total, current status)
4. Click button to advance status to next step (e.g. "Mark as Confirmed")
5. Status advances one step only: pending -> confirmed -> shipped -> delivered
6. No going backwards

## Order Status Flow

```
pending -> confirmed -> shipped -> delivered
```

Forward-only. No cancellation. No skipping steps. The merchant advances one step at a time.

## Validations

### Order
- `customer_name`: presence
- `customer_email`: presence, format (basic email regex)
- `status`: inclusion in `%w[pending confirmed shipped delivered]`
- `total`: presence, >= 0
- `token`: presence, uniqueness

### OrderItem
- `quantity`: presence, integer, >= 1
- `unit_price`: presence, >= 0
- `order`: presence
- `product`: presence

## UI Components

Uses existing shadcn/ui components (Button, Card, Table, Input, Label, AlertDialog). No new UI components needed beyond what's already installed.
