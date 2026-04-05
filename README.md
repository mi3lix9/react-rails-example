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

Inertia eliminates the entire API layer. There's no `fetch()`, no loading states, no client-side router. Rails owns routing, React owns rendering, and Inertia handles the handoff. Forms use the `useForm` hook which manages state, submission, validation errors, and loading — all wired to standard Rails controller actions.

```tsx
export default function Index({ products }: Props) {
  // Props arrive directly from Rails — no fetch, no useEffect, no loading state
  return (
    <Table>
      {products.map((product) => (
        <TableRow key={product.id}>
          <TableCell>{product.name}</TableCell>
          <TableCell>${product.price.toFixed(2)}</TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
```

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

## Code Quality Tooling

We strongly recommend enforcing linters and formatters from day one. With a fullstack codebase, both sides need coverage.

| Side | Tool | Role |
|------|------|------|
| TypeScript/React | [oxlint](https://oxc.rs) | Fast Rust-based linter |
| Ruby | [RuboCop](https://rubocop.org) (rails-omakase) | Linter + formatter |
| Ruby | [Brakeman](https://brakemanscanner.org) | Security analysis |
| Ruby | [Bundler Audit](https://github.com/rubysec/bundler-audit) | Dependency vulnerability scanning |
| Git hooks | [Lefthook](https://github.com/evilmartians/lefthook) | Runs both linters pre-commit in parallel |

Lefthook is configured to run oxlint on staged `.tsx/.ts` files and RuboCop on staged `.rb` files — in parallel, on every commit. No code gets committed without passing both.

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
