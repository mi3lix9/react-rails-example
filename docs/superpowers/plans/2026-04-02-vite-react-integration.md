# Vite + React Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace importmap-rails with vite_rails and convert all product views to React (TypeScript) components mounted from Rails views.

**Architecture:** Rails keeps routing and controllers. Each Rails view renders a container `<div>` with JSON-encoded props. A lightweight `mountComponent` helper hydrates React components into those divs on page load. Forms submit via standard HTML form submission (not AJAX) to keep the existing controller create/update flow.

**Tech Stack:** vite_rails, React 18, TypeScript, @vitejs/plugin-react

---

## File Structure

```
app/javascript/
  entrypoints/
    application.tsx          # Vite entrypoint — imports and mounts all components
  components/
    ProductIndex.tsx          # Product listing page
    ProductShow.tsx           # Single product display
    ProductForm.tsx           # Shared form for new + edit
    mountComponent.tsx        # DOM mounting utility
```

**Modified files:**
- `Gemfile` — remove importmap-rails, add vite_rails
- `app/views/layouts/application.html.erb` — replace `javascript_importmap_tags` with `vite_javascript_tag`
- `app/views/products/index.html.erb` — mount `ProductIndex`
- `app/views/products/show.html.erb` — mount `ProductShow`
- `app/views/products/new.html.erb` — mount `ProductForm`
- `app/controllers/products_controller.rb` — add JSON props helper for edit
- `bin/dev` — run vite dev server alongside rails

**New files:**
- `app/views/products/edit.html.erb` — mount `ProductForm` for editing
- All files under `app/javascript/entrypoints/` and `app/javascript/components/`
- `tsconfig.json` — TypeScript configuration
- `package.json` — npm dependencies
- `vite.config.ts` — Vite configuration

**Removed files:**
- `config/importmap.rb`
- `app/javascript/application.js`
- `app/javascript/controllers/` (Stimulus controllers no longer needed)

---

### Task 1: Install vite_rails and remove importmap

**Files:**
- Modify: `Gemfile`
- Remove: `config/importmap.rb`
- Remove: `app/javascript/application.js`
- Remove: `app/javascript/controllers/application.js`
- Remove: `app/javascript/controllers/index.js`
- Remove: `app/javascript/controllers/hello_controller.js`

- [ ] **Step 1: Remove importmap-rails gem and add vite_rails**

In `Gemfile`, remove the line:
```ruby
gem "importmap-rails"
```

And add:
```ruby
gem "vite_rails"
```

- [ ] **Step 2: Run bundle install**

Run: `bundle install`
Expected: Successful install, vite_rails added, importmap-rails removed.

- [ ] **Step 3: Run vite install generator**

Run: `bundle exec vite install`
Expected: Creates `vite.config.ts`, `package.json`, `bin/vite`, `config/vite.json`, `app/javascript/entrypoints/application.js`, and `Procfile.dev`. Updates `bin/dev` if needed.

- [ ] **Step 4: Remove old importmap files**

```bash
rm config/importmap.rb
rm app/javascript/application.js
rm -rf app/javascript/controllers
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: replace importmap-rails with vite_rails"
```

---

### Task 2: Set up TypeScript and React

**Files:**
- Modify: `vite.config.ts`
- Modify: `package.json` (via npm install)
- Create: `tsconfig.json`
- Modify: `app/javascript/entrypoints/application.js` → rename to `application.tsx`

- [ ] **Step 1: Install React and TypeScript dependencies**

Run:
```bash
npm install react react-dom
npm install -D typescript @types/react @types/react-dom @vitejs/plugin-react
```
Expected: Packages added to `package.json`.

- [ ] **Step 2: Create tsconfig.json**

Create `tsconfig.json` in project root:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./app/javascript/*"]
    }
  },
  "include": ["app/javascript/**/*"]
}
```

- [ ] **Step 3: Add React plugin to vite.config.ts**

Read the generated `vite.config.ts` first. Then update it to:

```typescript
import { defineConfig } from "vite";
import ViteRuby from "vite-plugin-ruby";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [ViteRuby(), react()],
});
```

- [ ] **Step 4: Rename entrypoint to .tsx and set up**

```bash
mv app/javascript/entrypoints/application.js app/javascript/entrypoints/application.tsx
```

Write `app/javascript/entrypoints/application.tsx`:

```tsx
import "../components/mountComponent";
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add TypeScript and React with Vite"
```

---

### Task 3: Create mountComponent utility

**Files:**
- Create: `app/javascript/components/mountComponent.tsx`

- [ ] **Step 1: Create the mount utility**

Create `app/javascript/components/mountComponent.tsx`:

```tsx
import React from "react";
import { createRoot } from "react-dom/client";

const componentRegistry: Record<string, React.ComponentType<any>> = {};

export function registerComponent(
  name: string,
  component: React.ComponentType<any>
) {
  componentRegistry[name] = component;
}

function mountComponents() {
  const mountPoints = document.querySelectorAll("[data-react-component]");
  mountPoints.forEach((element) => {
    const name = element.getAttribute("data-react-component");
    const propsJson = element.getAttribute("data-react-props");

    if (!name || !componentRegistry[name]) {
      console.warn(`React component "${name}" not found in registry`);
      return;
    }

    const props = propsJson ? JSON.parse(propsJson) : {};
    const Component = componentRegistry[name];
    const root = createRoot(element);
    root.render(<Component {...props} />);
  });
}

document.addEventListener("DOMContentLoaded", mountComponents);
document.addEventListener("turbo:load", mountComponents);
```

This listens to both `DOMContentLoaded` (initial load) and `turbo:load` (Turbo navigation) to mount components.

- [ ] **Step 2: Commit**

```bash
git add app/javascript/components/mountComponent.tsx
git commit -m "feat: add React component mount utility"
```

---

### Task 4: Create ProductIndex component and update view

**Files:**
- Create: `app/javascript/components/ProductIndex.tsx`
- Modify: `app/views/products/index.html.erb`
- Modify: `app/javascript/entrypoints/application.tsx`

- [ ] **Step 1: Create ProductIndex component**

Create `app/javascript/components/ProductIndex.tsx`:

```tsx
import React from "react";

interface Product {
  id: number;
  name: string;
}

interface ProductIndexProps {
  products: Product[];
}

export default function ProductIndex({ products }: ProductIndexProps) {
  return (
    <div>
      <h1>Products</h1>
      <a href="/products/new">New product</a>
      <div id="products">
        {products.map((product) => (
          <div key={product.id}>
            <a href={`/products/${product.id}`}>{product.name}</a>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Register component in entrypoint**

Update `app/javascript/entrypoints/application.tsx`:

```tsx
import { registerComponent } from "../components/mountComponent";
import ProductIndex from "../components/ProductIndex";

registerComponent("ProductIndex", ProductIndex);
```

- [ ] **Step 3: Update Rails view**

Replace `app/views/products/index.html.erb` with:

```erb
<div data-react-component="ProductIndex"
     data-react-props="<%= j({products: @products.map { |p| {id: p.id, name: p.name} }}.to_json) %>">
</div>
```

- [ ] **Step 4: Commit**

```bash
git add app/javascript/components/ProductIndex.tsx app/javascript/entrypoints/application.tsx app/views/products/index.html.erb
git commit -m "feat: convert products index to React component"
```

---

### Task 5: Create ProductShow component and update view

**Files:**
- Create: `app/javascript/components/ProductShow.tsx`
- Modify: `app/views/products/show.html.erb`
- Modify: `app/javascript/entrypoints/application.tsx`

- [ ] **Step 1: Create ProductShow component**

Create `app/javascript/components/ProductShow.tsx`:

```tsx
import React from "react";

interface ProductShowProps {
  product: {
    id: number;
    name: string;
  };
}

export default function ProductShow({ product }: ProductShowProps) {
  return (
    <div>
      <h1>{product.name}</h1>
      <a href="/products">Back to products</a>
    </div>
  );
}
```

- [ ] **Step 2: Register component in entrypoint**

Add to `app/javascript/entrypoints/application.tsx`:

```tsx
import ProductShow from "../components/ProductShow";
registerComponent("ProductShow", ProductShow);
```

Full file should now be:

```tsx
import { registerComponent } from "../components/mountComponent";
import ProductIndex from "../components/ProductIndex";
import ProductShow from "../components/ProductShow";

registerComponent("ProductIndex", ProductIndex);
registerComponent("ProductShow", ProductShow);
```

- [ ] **Step 3: Update Rails view**

Replace `app/views/products/show.html.erb` with:

```erb
<div data-react-component="ProductShow"
     data-react-props="<%= j({product: {id: @product.id, name: @product.name}}.to_json) %>">
</div>
```

- [ ] **Step 4: Commit**

```bash
git add app/javascript/components/ProductShow.tsx app/javascript/entrypoints/application.tsx app/views/products/show.html.erb
git commit -m "feat: convert product show to React component"
```

---

### Task 6: Create ProductForm component and update new/edit views

**Files:**
- Create: `app/javascript/components/ProductForm.tsx`
- Modify: `app/views/products/new.html.erb`
- Create: `app/views/products/edit.html.erb`
- Modify: `app/javascript/entrypoints/application.tsx`
- Modify: `app/controllers/products_controller.rb` (add CSRF token to props)

- [ ] **Step 1: Create ProductForm component**

Create `app/javascript/components/ProductForm.tsx`:

```tsx
import React from "react";

interface ProductFormProps {
  product: {
    id?: number;
    name: string;
  };
  action: string;
  method?: string;
  authenticityToken: string;
}

export default function ProductForm({
  product,
  action,
  method,
  authenticityToken,
}: ProductFormProps) {
  const isEdit = !!product.id;

  return (
    <div>
      <h1>{isEdit ? "Edit product" : "New product"}</h1>
      <form action={action} method="post" acceptCharset="UTF-8">
        <input type="hidden" name="authenticity_token" value={authenticityToken} />
        {method && <input type="hidden" name="_method" value={method} />}
        <div>
          <label htmlFor="product_name">Name</label>
          <input
            type="text"
            name="product[name]"
            id="product_name"
            defaultValue={product.name}
          />
        </div>
        <div>
          <input
            type="submit"
            value={isEdit ? "Update Product" : "Create Product"}
          />
        </div>
      </form>
      <a href="/products">Cancel</a>
    </div>
  );
}
```

This renders a standard HTML form that submits to Rails. The `_method` hidden field handles PATCH for updates. The `authenticityToken` is passed from the Rails view for CSRF protection.

- [ ] **Step 2: Register component in entrypoint**

Add to `app/javascript/entrypoints/application.tsx`:

```tsx
import ProductForm from "../components/ProductForm";
registerComponent("ProductForm", ProductForm);
```

Full file should now be:

```tsx
import { registerComponent } from "../components/mountComponent";
import ProductIndex from "../components/ProductIndex";
import ProductShow from "../components/ProductShow";
import ProductForm from "../components/ProductForm";

registerComponent("ProductIndex", ProductIndex);
registerComponent("ProductShow", ProductShow);
registerComponent("ProductForm", ProductForm);
```

- [ ] **Step 3: Update new view**

Replace `app/views/products/new.html.erb` with:

```erb
<div data-react-component="ProductForm"
     data-react-props="<%= j({
       product: {name: @product.name || ''},
       action: products_path,
       authenticityToken: form_authenticity_token
     }.to_json) %>">
</div>
```

- [ ] **Step 4: Create edit view**

Create `app/views/products/edit.html.erb`:

```erb
<div data-react-component="ProductForm"
     data-react-props="<%= j({
       product: {id: @product.id, name: @product.name},
       action: product_path(@product),
       method: 'patch',
       authenticityToken: form_authenticity_token
     }.to_json) %>">
</div>
```

- [ ] **Step 5: Commit**

```bash
git add app/javascript/components/ProductForm.tsx app/javascript/entrypoints/application.tsx app/views/products/new.html.erb app/views/products/edit.html.erb
git commit -m "feat: convert product form (new/edit) to React component"
```

---

### Task 7: Update layout and finalize

**Files:**
- Modify: `app/views/layouts/application.html.erb`
- Modify: `bin/dev` (if not already updated by vite install)

- [ ] **Step 1: Update layout to use Vite tags**

In `app/views/layouts/application.html.erb`, replace:

```erb
<%= stylesheet_link_tag :app, "data-turbo-track": "reload" %>
<%= javascript_importmap_tags %>
```

With:

```erb
<%= stylesheet_link_tag :app, "data-turbo-track": "reload" %>
<%= vite_javascript_tag "application" %>
```

- [ ] **Step 2: Ensure bin/dev runs both servers**

Check if `Procfile.dev` was created by the vite install generator. If it exists, update `bin/dev` to:

```bash
#!/usr/bin/env sh

if ! gem list foreman -i --silent; then
  echo "Installing foreman..."
  gem install foreman
fi

exec foreman start -f Procfile.dev "$@"
```

The `Procfile.dev` should contain:

```
web: bin/rails server -p 3000
vite: bin/vite dev
```

- [ ] **Step 3: Verify the app works**

Run: `bin/dev`

Test:
1. Visit `http://localhost:3000/products` — should see React-rendered product list
2. Click "New product" — should see React form, submit should create product
3. Product show page should render with React
4. Edit should work via the edit link (add one to show page if missing)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: update layout for Vite and finalize React integration"
```
