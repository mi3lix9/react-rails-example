# README Redesign Spec

## Purpose

Replace the current technical-reference README with a journey narrative that shows fullstack developers how Rails + React integrate as a single app with a single deployment.

## Target Audience

Fullstack developers (colleagues, manager, CTO) who are already interested in Rails and want to see how the React integration works in practice.

## Tone

- Conversational, not salesy — they're already on board
- Focus on integration, not persuasion
- Show, don't tell — code snippets over explanations
- Brief AI mention to highlight productivity

## Structure

### 1. Title + One-liner + AI Note

**Title:** `Rails + React: A Fullstack Integration Guide`

**One-liner:** A hands-on exploration of using Ruby on Rails with React, Vite, Inertia.js, and shadcn/ui — built to evaluate how well these tools work together for fullstack development.

**AI note:** Blockquote — ~90% AI-written (Claude Code), showing how productive the stack is with AI-assisted development.

### 2. What We Were Exploring

One paragraph explaining the motivation: can fullstack developers use Rails without giving up modern frontend DX? Can we keep React, Vite, TypeScript, shadcn/ui and get Rails backend conventions — all in one app?

Short answer line: **yes, Inertia.js is the bridge.**

### 3. The Integration — One App, One Deploy

**Key message:** This is not two separate apps. It's one codebase, one deployment. Rails serves the HTML, Vite bundles the frontend, Inertia connects them.

**Flow diagram:**
```
Request → Rails Router → Controller → Inertia → React Component (Vite + shadcn)
```

**4 subsections** (2-3 sentences + one code snippet each):

1. **Rails** — routing, data, validations. Show controller with `render inertia:`.
2. **Inertia.js** — the bridge. No API, no client router, no fetch. Props go directly from controller to component.
3. **Vite** — bundles TypeScript/React/CSS, HMR in dev, SSR builds. One config file.
4. **shadcn/ui + Tailwind** — accessible components you own, consistent design system.

Emphasis: all tools serve the goal of keeping this as one unified fullstack app.

### 4. Code Quality Tooling

Framed as a strong recommendation for any team adopting this stack.

**Table:**
| Side | Tool | Role |
|------|------|------|
| TypeScript/React | oxlint | Fast Rust-based linter |
| Ruby | RuboCop (rails-omakase) | Linter + formatter |
| Ruby | Brakeman | Security analysis |
| Ruby | Bundler Audit | Dependency vulnerability scanning |
| Git hooks | Lefthook | Runs both linters pre-commit in parallel |

**Paragraph:** Strongly recommend enforcing from day one. Lefthook runs oxlint + RuboCop in parallel on every commit.

### 5. Getting Started

- Prerequisites: Ruby 3.4+, Node.js 20+, SQLite
- Setup commands: clone, bundle install, npm install, db:migrate, bin/dev
- Slim project structure tree showing only the key integration files (not every UI component)

### 6. Key Files

Short list of "start reading here" files — the ones that show how the integration works:
- `vite.config.ts`
- `config/routes.rb`
- `app/controllers/products_controller.rb`
- `app/frontend/entrypoints/application.tsx`
- `app/frontend/pages/Products/Index.tsx`
- `lefthook.yml`

## What NOT to Include

- No exhaustive API endpoint tables (this isn't an API)
- No "adding shadcn components" tutorial (they can read shadcn docs)
- No deep Rails or React tutorials
- No comparison to Next.js/Remix (audience doesn't need convincing)
