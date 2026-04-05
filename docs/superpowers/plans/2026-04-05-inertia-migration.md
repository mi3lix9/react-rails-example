# Inertia.js Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the React SPA + JSON API architecture with Inertia.js so Rails controllers pass props directly to React components, with SSR support.

**Architecture:** Rails controllers use `render inertia:` to pass props to React components. Inertia handles client-side navigation (replaces React Router). The `@inertiajs/vite` plugin auto-resolves page components from `app/frontend/pages/`. A Vite SSR build + Puma plugin enables server-side rendering.

**Tech Stack:** inertia_rails gem, @inertiajs/react, @inertiajs/vite, Vite SSR

---

## File Structure

**Create:**
- `app/controllers/products_controller.rb` — Inertia controller (replaces API controller)
- `app/frontend/pages/Products/Index.tsx` — Product listing page
- `app/frontend/pages/Products/Show.tsx` — Product detail page
- `app/frontend/pages/Products/New.tsx` — New product page
- `app/frontend/pages/Products/Edit.tsx` — Edit product page
- `app/frontend/entrypoints/ssr.tsx` — SSR entrypoint
- `config/initializers/inertia_rails.rb` — Inertia configuration

**Modify:**
- `Gemfile` — ensure inertia_rails is present (already added)
- `config/routes.rb` — standard resourceful routes (remove API namespace + catch-all)
- `vite.config.ts` — add @inertiajs/vite plugin
- `app/views/layouts/application.html.erb` — add `inertia_ssr_head` helper
- `app/frontend/entrypoints/application.tsx` — use `createInertiaApp`
- `Procfile.dev` — add SSR process
- `config/puma.rb` — add inertia_ssr plugin (optional, for production)

**Delete:**
- `app/controllers/api/products_controller.rb` — replaced by Inertia controller
- `app/controllers/pages_controller.rb` — no longer needed
- `app/views/pages/index.html.erb` — Inertia renders its own root div
- `app/views/pages/` — directory
- `app/frontend/components/App.tsx` — React Router no longer needed
- `app/frontend/components/ProductIndex.tsx` — moved to pages/
- `app/frontend/components/ProductShow.tsx` — moved to pages/
- `app/frontend/components/ProductForm.tsx` — moved to pages/

**Keep unchanged:**
- `app/frontend/components/ui/*` — shadcn components
- `app/frontend/lib/utils.ts`
- `app/frontend/styles/index.css`
- `app/models/product.rb`
- `tsconfig.json`

---

### Task 1: Install Inertia dependencies

**Files:**
- Modify: `package.json` (via npm)
- Modify: `Gemfile` (inertia_rails already present)

- [ ] **Step 1: Install npm packages**

Run:
```bash
npm install @inertiajs/react @inertiajs/vite
npm uninstall react-router
```

- [ ] **Step 2: Run bundle install** (inertia_rails is already in Gemfile)

Run:
```bash
bundle install
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: add Inertia.js dependencies, remove react-router"
```

---

### Task 2: Configure Vite and Inertia initializer

**Files:**
- Modify: `vite.config.ts`
- Create: `config/initializers/inertia_rails.rb`

- [ ] **Step 1: Update vite.config.ts**

Replace `vite.config.ts` with:

```typescript
import path from "path";
import { defineConfig } from "vite";
import ViteRuby from "vite-plugin-ruby";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import inertia from "@inertiajs/vite";

export default defineConfig({
  plugins: [
    ViteRuby(),
    inertia({
      ssr: {
        enabled: true,
        entrypoint: "app/frontend/entrypoints/ssr.tsx",
      },
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app/frontend"),
    },
  },
});
```

Note: The `inertia()` plugin must come after `ViteRuby()` and before `react()`.

- [ ] **Step 2: Create Inertia initializer**

Create `config/initializers/inertia_rails.rb`:

```ruby
InertiaRails.configure do |config|
  config.ssr_enabled = ViteRuby.config.ssr_build_enabled
end
```

- [ ] **Step 3: Commit**

```bash
git add vite.config.ts config/initializers/inertia_rails.rb
git commit -m "feat: configure Vite Inertia plugin and Rails initializer"
```

---

### Task 3: Update layout and entrypoint for Inertia

**Files:**
- Modify: `app/views/layouts/application.html.erb`
- Modify: `app/frontend/entrypoints/application.tsx`

- [ ] **Step 1: Update layout**

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

    <%= inertia_ssr_head %>
    <%= vite_client_tag %>
    <%= vite_javascript_tag "application.tsx" %>
  </head>

  <body>
    <%= yield %>
  </body>
</html>
```

Key changes: removed the React refresh preamble hack (Inertia + Vite plugin handles HMR), removed Propshaft stylesheet tag, added `inertia_ssr_head`.

- [ ] **Step 2: Rewrite entrypoint for Inertia**

Replace `app/frontend/entrypoints/application.tsx` with:

```tsx
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import "../styles/index.css";

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob("../pages/**/*.tsx", { eager: true });
    return pages[`../pages/${name}.tsx`];
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
});
```

The `resolve` function maps component names (e.g. `"Products/Index"`) to files at `app/frontend/pages/Products/Index.tsx`. The `@inertiajs/vite` plugin handles code-splitting automatically.

- [ ] **Step 3: Commit**

```bash
git add app/views/layouts/application.html.erb app/frontend/entrypoints/application.tsx
git commit -m "feat: update layout and entrypoint for Inertia"
```

---

### Task 4: Create Inertia products controller and routes

**Files:**
- Create: `app/controllers/products_controller.rb`
- Modify: `config/routes.rb`

- [ ] **Step 1: Create Inertia products controller**

Create `app/controllers/products_controller.rb`:

```ruby
class ProductsController < ApplicationController
  def index
    render inertia: "Products/Index", props: {
      products: Product.all.map { |p| { id: p.id, name: p.name } }
    }
  end

  def show
    product = Product.find(params[:id])
    render inertia: "Products/Show", props: {
      product: { id: product.id, name: product.name }
    }
  end

  def new
    render inertia: "Products/New"
  end

  def create
    product = Product.new(product_params)
    if product.save
      redirect_to product_path(product)
    else
      redirect_back fallback_location: new_product_path, inertia: { errors: product.errors.to_hash(true) }
    end
  end

  def edit
    product = Product.find(params[:id])
    render inertia: "Products/Edit", props: {
      product: { id: product.id, name: product.name }
    }
  end

  def update
    product = Product.find(params[:id])
    if product.update(product_params)
      redirect_to product_path(product)
    else
      redirect_back fallback_location: edit_product_path(product), inertia: { errors: product.errors.to_hash(true) }
    end
  end

  def destroy
    product = Product.find(params[:id])
    product.destroy
    redirect_to products_path
  end

  private

  def product_params
    params.require(:product).permit(:name)
  end
end
```

Key differences from the API controller:
- `render inertia:` instead of `render json:`
- Standard Rails redirects instead of JSON responses
- Validation errors passed via `redirect_back` with `inertia: { errors: ... }`

- [ ] **Step 2: Update routes**

Replace `config/routes.rb` with:

```ruby
Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  root "products#index"
  resources :products
end
```

Clean, standard Rails routes. No API namespace, no catch-all.

- [ ] **Step 3: Commit**

```bash
git add app/controllers/products_controller.rb config/routes.rb
git commit -m "feat: add Inertia products controller and standard routes"
```

---

### Task 5: Create Inertia page components

**Files:**
- Create: `app/frontend/pages/Products/Index.tsx`
- Create: `app/frontend/pages/Products/Show.tsx`
- Create: `app/frontend/pages/Products/New.tsx`
- Create: `app/frontend/pages/Products/Edit.tsx`

- [ ] **Step 1: Create Products/Index.tsx**

Create `app/frontend/pages/Products/Index.tsx`:

```tsx
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  id: number;
  name: string;
}

interface Props {
  products: Product[];
}

export default function Index({ products }: Props) {
  return (
    <div className="mx-auto max-w-2xl py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/products/new">New product</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Link href={`/products/${product.id}`} className="hover:underline">
                  {product.name}
                </Link>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/products/${product.id}/edit`}>Edit</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

Key changes from SPA version:
- `Link` from `@inertiajs/react` instead of `react-router` (uses `href` not `to`)
- Props received directly from Rails controller (no `useState`/`useEffect`/`fetch`)

- [ ] **Step 2: Create Products/Show.tsx**

Create `app/frontend/pages/Products/Show.tsx`:

```tsx
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  product: {
    id: number;
    name: string;
  };
}

export default function Show({ product }: Props) {
  return (
    <div className="mx-auto max-w-md py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Product #{product.id}</p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button asChild>
            <Link href={`/products/${product.id}/edit`}>Edit</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">Back to products</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

Key change: No loading state needed — props arrive server-side, fully rendered.

- [ ] **Step 3: Create Products/New.tsx**

Create `app/frontend/pages/Products/New.tsx`:

```tsx
import { useForm, Link } from "@inertiajs/react";
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

export default function New() {
  const form = useForm({ name: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post("/products");
  };

  return (
    <div className="mx-auto max-w-md py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">New product</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid gap-2">
              <Label htmlFor="product_name">Name</Label>
              <Input
                type="text"
                id="product_name"
                value={form.data.name}
                onChange={(e) => form.setData("name", e.target.value)}
                placeholder="Enter product name"
              />
              {form.errors.name && (
                <p className="text-sm text-destructive">{form.errors.name}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={form.processing}>
              {form.processing ? "Creating..." : "Create Product"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">Cancel</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
```

Key changes:
- `useForm` hook from Inertia handles form state, submission, errors, and processing
- `form.post("/products")` submits to Rails — no manual `fetch()`
- `form.errors.name` displays validation errors from Rails
- `form.processing` disables button during submission

- [ ] **Step 4: Create Products/Edit.tsx**

Create `app/frontend/pages/Products/Edit.tsx`:

```tsx
import { useForm, Link } from "@inertiajs/react";
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

interface Props {
  product: {
    id: number;
    name: string;
  };
}

export default function Edit({ product }: Props) {
  const form = useForm({ name: product.name });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.patch(`/products/${product.id}`);
  };

  return (
    <div className="mx-auto max-w-md py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit product</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid gap-2">
              <Label htmlFor="product_name">Name</Label>
              <Input
                type="text"
                id="product_name"
                value={form.data.name}
                onChange={(e) => form.setData("name", e.target.value)}
                placeholder="Enter product name"
              />
              {form.errors.name && (
                <p className="text-sm text-destructive">{form.errors.name}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={form.processing}>
              {form.processing ? "Updating..." : "Update Product"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">Cancel</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
```

Uses `form.patch()` instead of `form.post()` for updates.

- [ ] **Step 5: Commit**

```bash
git add app/frontend/pages/
git commit -m "feat: create Inertia page components with shadcn UI"
```

---

### Task 6: Create SSR entrypoint

**Files:**
- Create: `app/frontend/entrypoints/ssr.tsx`
- Modify: `Procfile.dev`

- [ ] **Step 1: Create SSR entrypoint**

Create `app/frontend/entrypoints/ssr.tsx`:

```tsx
import { createInertiaApp } from "@inertiajs/react";
import ReactDOMServer from "react-dom/server";

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob("../pages/**/*.tsx", { eager: true });
    return pages[`../pages/${name}.tsx`];
  },
  setup({ App, props }) {
    return ReactDOMServer.renderToString(<App {...props} />);
  },
});
```

This mirrors the client entrypoint but uses `ReactDOMServer.renderToString` instead of `createRoot`. The Inertia Vite plugin handles the rest.

- [ ] **Step 2: Update Procfile.dev**

Replace `Procfile.dev` with:

```
vite: bin/vite dev
web: bin/rails s -p 3000
```

Note: SSR runs automatically in development via the Vite plugin. In production, add `plugin :inertia_ssr` to `config/puma.rb`.

- [ ] **Step 3: Commit**

```bash
git add app/frontend/entrypoints/ssr.tsx Procfile.dev
git commit -m "feat: add SSR entrypoint for Inertia"
```

---

### Task 7: Clean up old files

**Files:**
- Delete: `app/controllers/api/products_controller.rb`
- Delete: `app/controllers/api/` (directory)
- Delete: `app/controllers/pages_controller.rb`
- Delete: `app/views/pages/index.html.erb`
- Delete: `app/views/pages/` (directory)
- Delete: `app/frontend/components/App.tsx`
- Delete: `app/frontend/components/ProductIndex.tsx`
- Delete: `app/frontend/components/ProductShow.tsx`
- Delete: `app/frontend/components/ProductForm.tsx`

- [ ] **Step 1: Delete old files**

```bash
rm -rf app/controllers/api
rm app/controllers/pages_controller.rb
rm -rf app/views/pages
rm app/frontend/components/App.tsx
rm app/frontend/components/ProductIndex.tsx
rm app/frontend/components/ProductShow.tsx
rm app/frontend/components/ProductForm.tsx
```

- [ ] **Step 2: Remove unused gems from Gemfile**

In `Gemfile`, remove these lines (no longer needed with Inertia):

```ruby
gem "turbo-rails"
gem "stimulus-rails"
gem "jbuilder"
```

Run:
```bash
bundle install
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove old SPA files, API controller, and unused gems"
```

---

### Task 8: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README**

Update `README.md` to reflect the new Inertia architecture:
- Replace "JSON API + React SPA" with "Inertia.js"
- Update the architecture diagram to show `Rails → Inertia → React`
- Add SSR to the feature list
- Update "How It Works" to describe the Inertia flow
- Remove API endpoints table (no more API)
- Update file structure to show `pages/` instead of `components/`
- Note that `useForm` handles form submission (no `fetch()`)

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README for Inertia.js architecture"
```
