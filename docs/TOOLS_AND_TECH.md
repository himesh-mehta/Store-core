# Tools & Technology Stack

StoreCore is built using a modern, edge-ready tech stack designed for speed, developer experience, and scalability.

---

## 🖥️ Frontend Framework
**[React Router v7](https://reactrouter.com/)**
We are using the latest React Router framework (which recently merged with Remix). It provides file-system based routing, Server-Side Rendering (SSR), and incredibly fast client-side navigation. It handles both our UI components and our backend API routes.

**[Vite](https://vitejs.dev/)**
Vite powers our build system, providing lightning-fast Hot Module Replacement (HMR) during development and highly optimized rollup bundles for production.

---

## 🎨 Styling & UI
**[Tailwind CSS](https://tailwindcss.com/) + Vanilla CSS**
The application uses Tailwind for rapid utility-class styling, combined with global custom CSS for specific premium aesthetic needs (like the ambient grain overlay, custom animations, and scrollbar hiding).

**[Lucide React](https://lucide.dev/)**
A clean, beautiful open-source icon set used consistently across the entire platform.

---

## 🧠 State Management & Data Fetching
**[Zustand](https://github.com/pmndrs/zustand)**
Used for managing the Shopping Cart state. Zustand is extremely lightweight, requires zero boilerplate, and easily persists the cart data to `localStorage` so users don't lose their items when they close the tab.

**[TanStack React Query](https://tanstack.com/query/latest)**
Used for fetching products and filtering. It handles caching, background updates, and loading states declaratively, making the catalog feel instantly responsive.

---

## 🔐 Authentication & Security
**[Auth.js (@auth/core)](https://authjs.dev/)**
The standard for React authentication. We use it with a custom database adapter to handle secure credentials (email/password) sign-ins.

**[Argon2](https://github.com/ranisalt/node-argon2)**
The industry-recommended password hashing algorithm. It is highly resistant to both GPU and ASIC cracking attempts, ensuring user credentials are safe.

---

## 🗄️ Database
**[Neon Serverless Postgres](https://neon.tech/)**
A modern, serverless PostgreSQL database. It scales to zero when not in use, making it incredibly cost-effective, and provides branching features that are perfect for modern CI/CD workflows.
