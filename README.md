# Rails + Vite + React + shadcn/ui

A full-stack web application demonstrating how to use **Ruby on Rails** as a JSON API backend with **React** (TypeScript) as a single-page application frontend, powered by **Vite** for blazing-fast development and **shadcn/ui** for beautiful, accessible components.

## The Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Backend | Ruby on Rails 8.1 | JSON API, database, routing |
| Frontend | React 18 + TypeScript | SPA with client-side routing |
| Bundler | Vite (via vite_rails) | Dev server, HMR, production builds |
| UI | shadcn/ui + Tailwind CSS v4 | Component library and styling |
| Routing | React Router | Client-side navigation |
| Database | SQLite | Data persistence |

## Why This Stack?

### Rails as API
- Battle-tested framework for building robust APIs fast
- Active Record makes database operations simple
- Strong conventions reduce boilerplate (routing, validations, migrations)
- Mature ecosystem with gems for authentication, authorization, background jobs, etc.

### Vite instead of importmap/Webpacker
- Hot Module Replacement (HMR) — see changes instantly without page reload
- Native TypeScript and JSX support — no extra configuration
- Lightning-fast cold starts — Vite uses esbuild for pre-bundling
- Modern plugin ecosystem — React Fast Refresh, Tailwind CSS, and more
- Production builds with tree-shaking and code splitting

### React + TypeScript
- Component-based UI with type safety
- Rich ecosystem of libraries and tools
- React Router for seamless client-side navigation (no full page reloads)
- State management with hooks (`useState`, `useEffect`)
- Large community and extensive documentation

### shadcn/ui
- Not a component library — you own the code (copy/paste, fully customizable)
- Built on Radix UI primitives (accessible by default)
- Styled with Tailwind CSS (consistent, themeable design system)
- Dark mode support out of the box
- Components: Button, Card, Table, Input, Label, and 40+ more

## Project Structure

```
app/
  controllers/
    api/
      products_controller.rb    # JSON API endpoints
    pages_controller.rb         # Serves the SPA shell
  models/
    product.rb                  # Active Record model
  frontend/
    entrypoints/
      application.tsx           # Vite entrypoint, renders React app
    components/
      App.tsx                   # React Router setup
      ProductIndex.tsx          # Product listing with shadcn Table
      ProductShow.tsx           # Product detail with shadcn Card
      ProductForm.tsx           # Create/edit form with shadcn Input
      ui/                       # shadcn/ui components (Button, Card, etc.)
    lib/
      utils.ts                  # Tailwind merge utility
    styles/
      index.css                 # Tailwind CSS + shadcn theme
  views/
    layouts/
      application.html.erb      # HTML shell with Vite tags
    pages/
      index.html.erb            # <div id="root"> mount point
config/
  routes.rb                     # API routes + SPA catch-all
  vite.json                     # Vite Ruby configuration
vite.config.ts                  # Vite plugins (Ruby, React, Tailwind)
tsconfig.json                   # TypeScript configuration
```

## How It Works

1. **Rails** handles API requests at `/api/*` and returns JSON
2. **All other routes** fall through to `PagesController#index`, which renders a single `<div id="root">`
3. **Vite** bundles the React app and serves it with HMR in development
4. **React Router** handles client-side navigation between pages
5. **Components** fetch data from the Rails API using `fetch()`

```
Browser → React Router → Component → fetch("/api/products") → Rails API → Database
```

## Getting Started

### Prerequisites

- Ruby 3.4+
- Node.js 20+
- SQLite

### Setup

```bash
# Clone the repo
git clone https://github.com/mi3lix9/react-rails-example.git
cd react-rails-example

# Install dependencies
bundle install
npm install

# Set up the database
bin/rails db:create db:migrate

# Start the development server (Rails + Vite)
bin/dev
```

Visit `http://localhost:3000` to see the app.

### Adding shadcn Components

```bash
# Add any shadcn component
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add toast
```

Then import and use in your React components:

```tsx
import { Button } from "@/components/ui/button";

<Button variant="outline">Click me</Button>
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get a single product |
| POST | `/api/products` | Create a product |
| PATCH | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |

## Key Files

- **`vite.config.ts`** — Vite configuration with Ruby, React, and Tailwind plugins
- **`config/routes.rb`** — API namespace + catch-all route for the SPA
- **`app/frontend/entrypoints/application.tsx`** — App entry point
- **`app/frontend/components/App.tsx`** — React Router configuration
- **`app/frontend/styles/index.css`** — Tailwind + shadcn theme variables
