# Rails API + React SPA Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert from React-in-ERB to a full React SPA with Rails JSON API backend.

**Architecture:** Rails serves JSON from namespaced API controllers. A single `PagesController#index` serves the SPA shell. React Router handles all client-side routing. Components use `fetch()` for data. The layout renders a `<div id="root">` and React mounts there.

**Tech Stack:** Rails 8.1 (API), React 18, React Router, TypeScript, Vite

---

## File Structure

**Create:**
- `app/controllers/pages_controller.rb` — serves SPA shell
- `app/controllers/api/products_controller.rb` — JSON API
- `app/views/pages/index.html.erb` — minimal SPA mount point
- `app/javascript/components/App.tsx` — React Router setup

**Modify:**
- `config/routes.rb` — API namespace + catch-all
- `app/views/layouts/application.html.erb` — simplify for SPA
- `app/javascript/entrypoints/application.tsx` — render `<App />` into `#root`
- `app/javascript/components/ProductIndex.tsx` — fetch from API
- `app/javascript/components/ProductShow.tsx` — fetch from API
- `app/javascript/components/ProductForm.tsx` — fetch-based submit

**Delete:**
- `app/controllers/products_controller.rb` — replaced by API version
- `app/views/products/` — all ERB files (index, show, new, edit)
- `app/javascript/components/mountComponent.tsx` — no longer needed
- `app/helpers/products_helper.rb` — unused

---

### Task 1: Install React Router

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install react-router**

Run:
```bash
npm install react-router
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add react-router"
```

---

### Task 2: Create API products controller

**Files:**
- Create: `app/controllers/api/products_controller.rb`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p app/controllers/api
```

- [ ] **Step 2: Create the API controller**

Create `app/controllers/api/products_controller.rb`:

```ruby
class Api::ProductsController < ApplicationController
  skip_forgery_protection

  def index
    products = Product.all
    render json: products.map { |p| { id: p.id, name: p.name } }
  end

  def show
    product = Product.find(params[:id])
    render json: { id: product.id, name: product.name }
  end

  def create
    product = Product.new(product_params)
    if product.save
      render json: { id: product.id, name: product.name }, status: :created
    else
      render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    product = Product.find(params[:id])
    if product.update(product_params)
      render json: { id: product.id, name: product.name }
    else
      render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    product = Product.find(params[:id])
    product.destroy
    head :no_content
  end

  private

  def product_params
    params.require(:product).permit(:name)
  end
end
```

- [ ] **Step 3: Commit**

```bash
git add app/controllers/api/products_controller.rb
git commit -m "feat: add JSON API products controller"
```

---

### Task 3: Create PagesController and update routes

**Files:**
- Create: `app/controllers/pages_controller.rb`
- Create: `app/views/pages/index.html.erb`
- Modify: `config/routes.rb`

- [ ] **Step 1: Create PagesController**

Create `app/controllers/pages_controller.rb`:

```ruby
class PagesController < ApplicationController
  def index
  end
end
```

- [ ] **Step 2: Create the SPA view**

Create `app/views/pages/index.html.erb`:

```erb
<div id="root"></div>
```

- [ ] **Step 3: Update routes**

Replace `config/routes.rb` with:

```ruby
Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    resources :products, only: [:index, :show, :create, :update, :destroy]
  end

  root "pages#index"
  get "*path", to: "pages#index", via: :all
end
```

The catch-all route at the bottom lets React Router handle all frontend routes.

- [ ] **Step 4: Commit**

```bash
git add app/controllers/pages_controller.rb app/views/pages/index.html.erb config/routes.rb
git commit -m "feat: add SPA shell with catch-all routing"
```

---

### Task 4: Create App component with React Router

**Files:**
- Create: `app/javascript/components/App.tsx`
- Modify: `app/javascript/entrypoints/application.tsx`

- [ ] **Step 1: Create App.tsx**

Create `app/javascript/components/App.tsx`:

```tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import ProductIndex from "./ProductIndex";
import ProductShow from "./ProductShow";
import ProductForm from "./ProductForm";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductIndex />} />
        <Route path="/products" element={<ProductIndex />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id" element={<ProductShow />} />
        <Route path="/products/:id/edit" element={<ProductForm />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 2: Rewrite entrypoint**

Replace `app/javascript/entrypoints/application.tsx` with:

```tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "../components/App";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
```

- [ ] **Step 3: Commit**

```bash
git add app/javascript/components/App.tsx app/javascript/entrypoints/application.tsx
git commit -m "feat: add React Router app with SPA entrypoint"
```

---

### Task 5: Rewrite ProductIndex to fetch from API

**Files:**
- Modify: `app/javascript/components/ProductIndex.tsx`

- [ ] **Step 1: Rewrite ProductIndex**

Replace `app/javascript/components/ProductIndex.tsx` with:

```tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router";

interface Product {
  id: number;
  name: string;
}

export default function ProductIndex() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  return (
    <div>
      <h1>Products</h1>
      <Link to="/products/new">New product</Link>
      <div>
        {products.map((product) => (
          <div key={product.id}>
            <Link to={`/products/${product.id}`}>{product.name}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/javascript/components/ProductIndex.tsx
git commit -m "feat: rewrite ProductIndex to fetch from API"
```

---

### Task 6: Rewrite ProductShow to fetch from API

**Files:**
- Modify: `app/javascript/components/ProductShow.tsx`

- [ ] **Step 1: Rewrite ProductShow**

Replace `app/javascript/components/ProductShow.tsx` with:

```tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";

interface Product {
  id: number;
  name: string;
}

export default function ProductShow() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then(setProduct);
  }, [id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <Link to={`/products/${product.id}/edit`}>Edit</Link>
      {" | "}
      <Link to="/products">Back to products</Link>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/javascript/components/ProductShow.tsx
git commit -m "feat: rewrite ProductShow to fetch from API"
```

---

### Task 7: Rewrite ProductForm to use fetch

**Files:**
- Modify: `app/javascript/components/ProductForm.tsx`

- [ ] **Step 1: Rewrite ProductForm**

Replace `app/javascript/components/ProductForm.tsx` with:

```tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [name, setName] = useState("");

  useEffect(() => {
    if (isEdit) {
      fetch(`/api/products/${id}`)
        .then((res) => res.json())
        .then((product) => setName(product.name));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = isEdit ? `/api/products/${id}` : "/api/products";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: { name } }),
    });

    if (res.ok) {
      const product = await res.json();
      navigate(`/products/${product.id}`);
    }
  };

  return (
    <div>
      <h1>{isEdit ? "Edit product" : "New product"}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="product_name">Name</label>
          <input
            type="text"
            id="product_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <button type="submit">
            {isEdit ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
      <Link to="/products">Cancel</Link>
    </div>
  );
}
```

Note: Import `Link` from `react-router` at the top:

```tsx
import { useParams, useNavigate, Link } from "react-router";
```

The full import line should be:
```tsx
import { useParams, useNavigate } from "react-router";
```

Wait — we need `Link` for Cancel. The correct full import is:
```tsx
import { useParams, useNavigate, Link } from "react-router";
```

Make sure the file uses this import line and includes `<Link to="/products">Cancel</Link>` instead of `<a href="/products">Cancel</a>`.

- [ ] **Step 2: Commit**

```bash
git add app/javascript/components/ProductForm.tsx
git commit -m "feat: rewrite ProductForm to use fetch API"
```

---

### Task 8: Clean up old files and simplify layout

**Files:**
- Delete: `app/controllers/products_controller.rb`
- Delete: `app/views/products/index.html.erb`
- Delete: `app/views/products/show.html.erb`
- Delete: `app/views/products/new.html.erb`
- Delete: `app/views/products/edit.html.erb`
- Delete: `app/javascript/components/mountComponent.tsx`
- Delete: `app/helpers/products_helper.rb`
- Modify: `app/views/layouts/application.html.erb`

- [ ] **Step 1: Delete old files**

```bash
rm app/controllers/products_controller.rb
rm -rf app/views/products
rm app/javascript/components/mountComponent.tsx
rm app/helpers/products_helper.rb
```

- [ ] **Step 2: Simplify layout**

Replace `app/views/layouts/application.html.erb` with:

```erb
<!DOCTYPE html>
<html>
  <head>
    <title><%= content_for(:title) || "Store" %></title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <%= csrf_meta_tags %>
    <%= csp_meta_tag %>

    <link rel="icon" href="/icon.png" type="image/png">
    <link rel="icon" href="/icon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/icon.png">

    <%= stylesheet_link_tag :app, "data-turbo-track": "reload" %>
    <%= vite_client_tag %>
    <% if Rails.env.development? %>
      <script type="module">
        import RefreshRuntime from '/vite-dev/@react-refresh'
        RefreshRuntime.injectIntoGlobalHook(window)
        window.$RefreshReg$ = () => {}
        window.$RefreshSig$ = () => (type) => type
        window.__vite_plugin_react_preamble_installed__ = true
      </script>
    <% end %>
    <%= vite_javascript_tag "application.tsx" %>
  </head>

  <body>
    <%= yield %>
  </body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove old ERB views, mount utility, and products controller"
```
