# Web App Architecture & File Walkthrough 🏗️

This document describes the directories and file structure of the **CampusOne** web application, explaining the core responsibilities and functionalities of each file.

---

## 📂 Project Root Structure: `apps/web/`

The web application resides under `apps/web/`. Here are the configuration files in the root of the web app:

* **`package.json`**: Declares application dependencies (React 18.2, React Router 7.6, Zustand 5, TanStack Query, Auth.js, Neon Serverless) and scripting triggers (`dev`, `typecheck`).
* **`vite.config.ts`**: The Vite compiler config containing the React Router compiler plugin and Tailwind compiler pipeline.
* **`tsconfig.json`**: Configures TypeScript compiler settings, target environments, and paths mapping (`@/*` to `./src/*`).
* **`tailwind.config.js` / `postcss.config.js`**: Contains layout styling adjustments and design tokens (colors, animations, fonts).
* **`react-router.config.ts`**: Directs compiler settings for the React Router framework integration.

---

## 🧭 The Core Application Directory: `apps/web/src/`

The main application source resides in `src/`. Below is a comprehensive, file-by-file walkthrough.

### 🌟 Root Files in `src/`

* **`index.css`**: Core entry stylesheet pulling in system font imports and applying global styling configurations.
* **`auth.js`**: The authentication driver. Initializes `CreateAuth` from `@auth/core` with a custom serverless adapter connecting directly to a **Neon PostgreSQL** database. Contains the logic for verification tokens, user creations, credentials-signin, credentials-signup, and Argon2 password hashing.
* **`client.d.ts` / `global.d.ts`**: Global TypeScript ambient declarations for assets, environments, and custom types.

---

### 🎨 Shared Layout Components: `src/components/`

Reusable React elements rendered across multiple routes:

* **`Header.jsx`**: The navigation header containing:
  * Brand Logo (**CampusOne StoreCore**).
  * Interactive Search routing.
  * Active links to Storefront, Orders, and Admin dashboard.
  * Shopping Cart icon with a dynamic indicator bubble showing the current count of items.
  * User profile dropdown and authentication controls (Sign In / Sign Out).
* **`ProductCard.jsx`**: The foundational visual component representing a product item. Houses:
  * Product thumbnail image.
  * Rating badges.
  * Price tags.
  * "Add to Cart" CTA buttons triggering the Zustand state store.

---

### 🧰 Custom Utilities & React Hooks: `src/utils/`

Contains helper hooks and Zustand stores controlling client-side state:

* **`useCart.js`**: A persisted **Zustand** store containing actions:
  * `items`: Array of products currently in the cart.
  * `addItem()`: Adds products or increments quantity if already present.
  * `removeItem()`: Filters out an item by ID.
  * `updateQuantity()`: Mutates selected item quantity count.
  * `clearCart()`: Flushes cart contents upon successful checkout.
  * `getTotal()`: Reducer calculating aggregate price across all selected quantities.
  * Uses `persist` middleware to save state inside `localStorage` (named `"cart-storage"`).
* **`useAuth.js`**: Connects client components with NextAuth React providers (`signIn`, `signOut`). Implements Credentials wrappers for both `credentials-signin` and `credentials-signup`.
* **`useUser.js`**: Manages the current logged-in user profile, avatar, and roles.
* **`useUpload.js`**: Handles file uploading hooks (e.g., product images inside the Admin dashboard).
* **`useHandleStreamResponse.js`**: Standard stream response hook used for high-performance chunked responses.
* **`create.js`**: System-generated helper utility for backend operations.

---

### 🗺️ Dynamic Routes: `src/app/`

The routes are organized based on dynamic directory mappings. The `routes.ts` file scans this folder looking for `page.jsx` components:

```
src/app/
├── account/
│   ├── signin/page.jsx      <-- Login Screen
│   ├── signup/page.jsx      <-- Register Account Screen
│   └── logout/page.jsx      <-- Sign Out Utility
├── admin/
│   └── page.jsx             <-- High-Powered Admin Panel (42KB)
├── cart/
│   └── page.jsx             <-- Detailed Checkout Shopping Cart
├── orders/
│   └── page.jsx             <-- User's Purchase History
├── product/
│   └── [id]/
│       └── page.jsx         <-- Dynamic Product Details Screen
├── root.tsx                 <-- React Router Global Shell
├── routes.ts                <-- Filesystem Dynamic Scanner
└── page.jsx                 <-- Landing Page Storefront
```

#### 📂 Detailed Page Walkthrough

1. **`routes.ts`**:
   * Scans the `src/app/` directory programmatically.
   * Maps folders (including dynamic segments like `[id]` which transform into `:id`) to React Router configurations.
   * Injects fallback handlers (`*?`) pointing to `./__create/not-found.tsx`.
2. **`root.tsx`**:
   * Standard HTML boilerplate wrapping (`<html>`, `<head>`, `<body>`).
   * Configures `<Meta />`, `<Links />`, `<ScrollRestoration />`, and `<Scripts />` for React Router.
   * Mounts the global `<SessionProvider>` to propagate Auth context down the tree.
   * Integrates HMR diagnostics and developmental event-bridges (`window.parent.postMessage`) to connect to developer preview windows.
   * Sets up global `<Toaster />` for dynamic notifications.
3. **`page.jsx` (Landing Storefront)**:
   * Displays the main catalog.
   * Queries products dynamically via TanStack React Query (`/api/products`).
   * Implements instant search filters, categories toggle, and price category dropdowns.
4. **`product/[id]/page.jsx` (Detail Page)**:
   * Uses the `:id` parameter to query product particulars.
   * Renders detailed descriptions, images, dynamic ratings/reviews, inventory availability, and an extensive "Add to Cart" module.
5. **`cart/page.jsx` (Shopping Cart)**:
   * Pulls active state from `useCart`.
   * Lists items, prices, quantities, and aggregates a total.
   * Emits checkout API payloads to create new orders.
6. **`orders/page.jsx` (Order History)**:
   * Queries list of user orders.
   * Renders structured invoice timelines, purchase totals, and status updates (Pending, Packaged, Shipped).
7. **`admin/page.jsx` (Admin Control Console)**:
   * The powerhouse page for managing StoreCore Essentials.
   * Features lists of existing inventory, creation drawers to upload product specs, order oversight modules to modify delivery statuses, and sales KPI dashboards.

---

### 🔌 Server Backend APIs: `src/app/api/`

Backing the client-side screens are endpoints running on the integrated Hono Server:

* **`/api/products`**: Serves, searches, and filters product records from Neon.
* **`/api/checkout`**: Handles secure checkout requests, cart translations, and Stripe payment initiations.
* **`/api/orders`**: Retrieves customer invoice lists and stores newly created order records.
* **`/api/reviews`**: Submits and lists product evaluations.
* **`/api/admin`**: Restricted endpoints validating session roles to process order status modifications and inventory updates.
