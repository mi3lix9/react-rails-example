# Rails + React: A Fullstack Integration Guide

A hands-on exploration of using Ruby on Rails with React, Vite, Inertia.js, and shadcn/ui — built to evaluate how well these tools work together for fullstack PWA development.

> This project was ~90% written with AI (Claude Code) to test how productive this stack is with AI-assisted development. The integration was smooth and the result speaks for itself.

## What We Were Exploring

We wanted to find out: can fullstack developers use Ruby on Rails without giving up the frontend DX they're used to? Specifically — can we keep React, Vite, TypeScript, and shadcn/ui while getting Rails' backend conventions, and have it all work together cleanly with SSR and PWA support?

**Short answer: yes.** Inertia.js is the bridge that makes it work.

## The Integration — One App, One Deploy

This is not two separate apps. There's no standalone React frontend calling a Rails API. It's one codebase, one deployment, one dev server. Rails serves the HTML, Vite bundles the frontend, and Inertia connects them seamlessly.

```
Request → Rails Router → Controller → Inertia → React Component (Vite + shadcn)
```

### Rails — Backend Conventions

Rails handles routing, data loading, validations, and database operations. Controllers pass data directly to React components as props — no serializers, no API versioning, no REST endpoints to maintain.

```ruby
class ProductsController < ApplicationController
  def index
    render inertia: "Products/Index", props: {
      products: Product.all.map { |p| { id: p.id, name: p.name, price: p.price.to_f } }
    }
  end
end
```

### Inertia.js — The Bridge

Inertia eliminates the entire API layer. There's no `fetch()`, no loading states, no client-side router. Rails owns routing, React owns rendering, and Inertia handles the handoff. Here's how data flows from backend to frontend:

**The controller sends data to a React component:**

```ruby
# app/controllers/products_controller.rb
def show
  product = Product.find(params[:id])
  render inertia: "Products/Show", props: {
    product: { id: product.id, name: product.name, price: product.price.to_f }
  }
end
```

**The React component receives it as props — no fetch, no loading state:**

```tsx
// app/frontend/pages/Products/Show.tsx
interface Props {
  product: { id: number; name: string; price: number };
}

export default function Show({ product }: Props) {
  return (
    <Card>
      <CardTitle>{product.name}</CardTitle>
      <p>${product.price.toFixed(2)}</p>
    </Card>
  );
}
```

**Forms work the same way in reverse — `useForm` submits to Rails, errors come back as props:**

```tsx
// app/frontend/pages/Products/New.tsx
export default function New() {
  const form = useForm({ name: "", price: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post("/products"); // → hits ProductsController#create
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input value={form.data.name} onChange={(e) => form.setData("name", e.target.value)} />
      {form.errors.name && <p>{form.errors.name}</p>}
      <Button disabled={form.processing}>Create</Button>
    </form>
  );
}
```

```ruby
# Rails handles it like a normal controller action
def create
  product = Product.new(product_params)
  if product.save
    redirect_to product_path(product)  # Inertia navigates to Show page
  else
    redirect_back fallback_location: new_product_path,
      inertia: { errors: product.errors.to_hash(true) }  # errors appear in form.errors
  end
end
```

There is no API. Rails controllers look like normal Rails controllers. React components look like normal React components. Inertia is invisible glue.

### Real-Time — WebSockets & HTTP Streaming

This stack supports real-time features out of the box. Rails ships with [Action Cable](https://guides.rubyonrails.org/action_cable_overview.html) for WebSockets and native support for Server-Sent Events (SSE). Both work alongside Inertia without conflict.

### Vite — Frontend Tooling + PWA

Vite replaces the Rails asset pipeline entirely. One config file gives you TypeScript, JSX, Hot Module Replacement, Tailwind CSS, SSR builds, and PWA support. In development, editing a React component updates the browser instantly without a page reload.

The [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) adds Progressive Web App capabilities — a web app manifest, service worker with auto-update, and offline caching via Workbox. Users can install the app to their home screen and get a native-like experience.

```typescript
// vite.config.ts — everything in one place
export default defineConfig({
  plugins: [
    ViteRuby(),
    inertia({ ssr: { enabled: true } }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: { name: "Store", short_name: "Store", display: "standalone" },
    }),
  ],
});
```

### shadcn/ui + Tailwind — Design System

shadcn/ui provides accessible, customizable components that you copy into your project — you own the code, not a dependency. Combined with Tailwind CSS v4, you get a consistent design system with dark mode support out of the box.

## Recommendations

### Use React Without Sacrifices

This stack gives you the full React ecosystem without compromise. You're not locked into Rails-specific UI patterns — you can use any React library, and several packages are purpose-built for this integration:

| Package | What it does |
|---------|-------------|
| [@inertiajs/react](https://inertiajs.com) | Bridge between Rails controllers and React components |
| [@inertiajs/vite](https://inertiajs.com) | Vite plugin for automatic page resolution and SSR |
| [@rails/actioncable](https://guides.rubyonrails.org/action_cable_overview.html) | WebSocket client for real-time features with Action Cable |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app) | Progressive Web App support (manifest, service worker, offline) |
| [shadcn/ui](https://ui.shadcn.com) | Accessible components you own (not a dependency) |

The React community and npm ecosystem work as-is — no adapters, no workarounds.

### Enforce Linting From Day One

With a fullstack codebase, both sides need strict linting. We strongly recommend enforcing this before writing any feature code.

**Frontend:**

| Tool | Role |
|------|------|
| [oxlint](https://oxc.rs) | Fast Rust-based linter for TypeScript/React |
| [Ultracite](https://www.ultracite.ai) | Zero-config preset for oxlint — opinionated defaults, AI-agent-friendly rules |

**Backend:**

| Tool | Role |
|------|------|
| [RuboCop](https://rubocop.org) (rails-omakase) | Linter + formatter — Rails team's opinionated config |
| [Brakeman](https://brakemanscanner.org) | Static security analysis |
| [Bundler Audit](https://github.com/rubysec/bundler-audit) | Dependency vulnerability scanning |

**Enforcement:**

| Tool | Role |
|------|------|
| [Lefthook](https://github.com/evilmartians/lefthook) | Runs frontend + backend linters pre-commit in parallel |

No code gets committed without passing both sides. Here's the config:

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  jobs:
    - name: oxlint
      glob: "*.{ts,tsx,js,jsx}"
      run: npx oxlint {staged_files}
    - name: rubocop
      glob: "*.rb"
      run: bundle exec rubocop --force-exclusion {staged_files}
```

## Getting Started

### Prerequisites

- Ruby 3.4+
- Node.js 20+
- SQLite

### Setup

```bash
git clone https://github.com/mi3lix9/react-rails-example.git
cd react-rails-example

bundle install
npm install

bin/rails db:create db:migrate

bin/dev
```

Visit `http://localhost:3000` to see the app.

### Project Structure

```
app/
  controllers/
    products_controller.rb        # render inertia: "Products/Index", props: {...}
  models/
    product.rb                    # Active Record model with validations
  frontend/
    entrypoints/
      application.tsx             # Inertia client setup
      ssr.tsx                     # Inertia SSR setup
    pages/
      Products/
        Index.tsx                 # List, search, sort, delete
        Show.tsx                  # Detail view
        New.tsx                   # Create form (useForm)
        Edit.tsx                  # Edit form (useForm)
    components/
      ui/                         # shadcn/ui components
      Header.tsx                  # App header with dark mode toggle
      Layout.tsx                  # Shared layout wrapper
    styles/
      index.css                   # Tailwind + shadcn theme
config/
  routes.rb                       # Standard resourceful routes
vite.config.ts                    # Vite + Inertia + React + Tailwind + PWA
lefthook.yml                      # Pre-commit hooks (oxlint + RuboCop)
oxlint.json                       # oxlint configuration
```

## Key Files

If you want to understand how the integration works, start here:

- **`vite.config.ts`** — How Vite, Inertia, React, Tailwind, and PWA are wired together
- **`config/routes.rb`** — Standard Rails routes, no catch-all needed
- **`app/controllers/products_controller.rb`** — How Rails passes props to React
- **`app/frontend/entrypoints/application.tsx`** — How Inertia boots on the client
- **`app/frontend/pages/Products/Index.tsx`** — A complete page with search, sort, and delete
- **`lefthook.yml`** — How both linters run in parallel on every commit
