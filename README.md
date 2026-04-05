# Rails + Inertia.js + React + shadcn/ui

A full-stack web application demonstrating how to use **Ruby on Rails** with **Inertia.js** to build modern, server-driven React apps with **SSR**, powered by **Vite** and styled with **shadcn/ui**.

## The Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Backend | Ruby on Rails 8.1 | Routing, controllers, database |
| Bridge | Inertia.js | Connects Rails to React (no API needed) |
| Frontend | React 18 + TypeScript | UI rendering with server-passed props |
| Bundler | Vite (via vite_rails) | Dev server, HMR, SSR builds |
| UI | shadcn/ui + Tailwind CSS v4 | Accessible, customizable components |
| SSR | Inertia SSR + Vite | Server-side rendering via Node.js |
| Database | SQLite | Data persistence |

## Why This Stack?

### Inertia.js — The Glue

Inertia eliminates the gap between Rails and React:

- **No API layer** — Rails controllers pass props directly to React components
- **No client-side router** — Inertia `<Link>` handles navigation, Rails owns routing
- **No `fetch()` or loading states** — data arrives as props, ready to render
- **`useForm` hook** — handles form state, submission, validation errors, and processing state
- **SSR support** — server-side rendering with zero configuration overhead
- **Standard Rails redirects** — `redirect_to` just works

```ruby
# Controller passes props directly to React
def index
  render inertia: "Products/Index", props: {
    products: Product.all.map { |p| { id: p.id, name: p.name } }
  }
end
```

```tsx
// React component receives props — no fetch, no loading state
export default function Index({ products }: Props) {
  return <Table>...</Table>
}
```

### Rails as the Backend
- Battle-tested framework for building web apps fast
- Active Record makes database operations simple
- Strong conventions reduce boilerplate
- Mature ecosystem (authentication, background jobs, etc.)

### Vite for Development
- Hot Module Replacement (HMR) — instant feedback
- Native TypeScript and JSX support
- Lightning-fast cold starts via esbuild
- SSR build support out of the box

### shadcn/ui
- You own the code — fully customizable
- Built on Radix UI (accessible by default)
- Styled with Tailwind CSS
- 40+ components available

## Project Structure

```
app/
  controllers/
    products_controller.rb      # render inertia: "Products/Index", props: {...}
  models/
    product.rb                  # Active Record model
  frontend/
    entrypoints/
      application.tsx           # createInertiaApp (client)
      ssr.tsx                   # createInertiaApp (server-side rendering)
    pages/
      Products/
        Index.tsx               # Product listing (receives products as props)
        Show.tsx                # Product detail (receives product as props)
        New.tsx                 # Create form (useForm hook)
        Edit.tsx                # Edit form (useForm hook with initial data)
    components/
      ui/                       # shadcn/ui components
    lib/
      utils.ts                  # Tailwind merge utility
    styles/
      index.css                 # Tailwind CSS + shadcn theme
  views/
    layouts/
      application.html.erb      # HTML shell with Vite + Inertia SSR tags
config/
  routes.rb                     # Standard resourceful routes
  initializers/
    inertia_rails.rb            # SSR configuration
vite.config.ts                  # Vite + Inertia + React + Tailwind plugins
```

## How It Works

```
Browser → Rails Router → Controller → Inertia → React Component
                                         ↓
                              Props passed directly (no API)
                                         ↓
                              SSR pre-renders HTML (Node.js)
```

1. **Request hits Rails** — standard routing, no catch-all needed
2. **Controller runs** — loads data, calls `render inertia: "ComponentName", props: {...}`
3. **Inertia serializes** — passes component name + props as JSON
4. **React renders** — component receives props directly, no fetch needed
5. **Navigation** — `<Link href="...">` makes Inertia requests (XHR), swaps components without full page reload
6. **SSR** — on first load, the page is pre-rendered server-side for fast initial paint

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

### Adding shadcn Components

```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

Then use in your page components:

```tsx
import { Button } from "@/components/ui/button";

<Button variant="outline">Click me</Button>
```

## Key Patterns

### Passing Props from Rails

```ruby
def show
  product = Product.find(params[:id])
  render inertia: "Products/Show", props: {
    product: { id: product.id, name: product.name }
  }
end
```

### Forms with Inertia

```tsx
const form = useForm({ name: "" });

form.post("/products");        // Create
form.patch(`/products/${id}`); // Update
form.processing;               // Loading state
form.errors.name;              // Validation errors
```

### Navigation

```tsx
import { Link } from "@inertiajs/react";

<Link href="/products">Products</Link>
<Link href="/products/new">New</Link>
```

## Key Files

- **`vite.config.ts`** — Vite with Ruby, Inertia, React, and Tailwind plugins
- **`config/routes.rb`** — Standard Rails resourceful routes
- **`app/controllers/products_controller.rb`** — Inertia controller
- **`app/frontend/entrypoints/application.tsx`** — Client-side Inertia setup
- **`app/frontend/entrypoints/ssr.tsx`** — Server-side rendering entrypoint
- **`app/frontend/pages/`** — React page components mapped by Inertia
