# StoreCore Essentials — Premium Full-Stack E-Commerce Platform

Welcome to **StoreCore Essentials**, a state-of-the-art, high-performance, and visually stunning minimalist e-commerce platform built with modern full-stack web technologies. 

StoreCore features a curated editorial monochrome design system, high-fidelity micro-animations, robust user authentication, and fully secure Stripe payment integrations.

---

## 🎨 Design & Aesthetic System
StoreCore is crafted to impress at first glance with an editorial look inspired by high-end fashion and industrial design labels:
*   **Monochromatic & High-Contrast Typography:** Utilizing deep blacks, refined grays, and modern sans-serif typography (`Inter`) instead of browser defaults.
*   **Asymmetric Masonry Grid Layouts:** Features interactive product cards with staggered weight columns and grid arrangements.
*   **Vibrant Hover Filters:** High-contrast images smoothly transition from black-and-white (grayscale) to color, accompanied by subtle zoom-in micro-animations on mouse-hover.
*   **Custom Easing Animations:** Home page metrics feature automatic number count-up counters easing with custom `cubic-bezier` timing.
*   **Fluid Notifications:** Integrates the premium `Sonner` toast engine to display responsive action feedbacks.

---

## ⚡ Tech Stack Architecture
StoreCore is engineered using a robust serverless-first modular architecture:

*   **Frontend Core:** React Router v7 (configured for fast Server-Side Rendering (SSR) and client hydration).
*   **API Framework:** **Hono Web Framework** (highly optimized router handles routing and middlewares, wrapped with `react-router-hono-server` for Node.js environments).
*   **Database Layer:** **Neon Serverless PostgreSQL** (accessed via a high-performance serverless pool with prepared statement caching).
*   **User Authentication:** **Firebase Client-Side Authentication** (supporting both Google OAuth 2.0 and standard email/password credentials), seamlessly synced to the Postgres DB pool via custom session handlers.
*   **Payments Pipeline:** **Stripe Payments SDK** (providing fully compliant, secure payment gateways).
*   **Build & Deployment:** Vite 6, esbuild compilation, and native packaging utilizing **Vercel Build Output API (v3)** to deploy highly responsive edge serverless functions.

---

## 🛠️ Key Engineering Challenges Resolved
During the development and scaling of StoreCore, several advanced system integration blockers were solved:
1.  **Vite Environment Variable Baking (Firebase Credentials):** Resolved a compiler shim issue where client-side process environment variables were stripped into local stubs by rewriting configurations to standard Vite `import.meta.env` references and introducing the custom `nextPublicProcessEnv` Vite bundling plugin.
2.  **Stripe Redirects & Popup Blockers:** Bypassed modern browser popup blocking policies (which silently cancel `window.open` calls inside asynchronous fetch resolutions) by utilizing a robust, direct window redirect (`window.location.href = session.url`) for standard Stripe Checkout.
3.  **Auth.js Session 400 Bad Request Errors:** Cleared background NextAuth console warning logs on serverless environments by adding programmatic `trustHost: true` options and registering the system environment variable `AUTH_TRUST_HOST=true` directly in the Vercel dashboard.
4.  **Static Favicon Asset Resolution:** Fixed browser tab favicon rendering by dynamically importing the static image in `root.tsx` to let Vite resolve and embed it cleanly as an inline base64 Data-URI.
5.  **Serverless Connection Mismatches:** Prevented function hangs and gateway timeouts (504) by integrating Hono’s `getRequestListener` handler to map standard streams to the Node.js platform interface.

---

## 📂 Project Structure
```bash
Store-core/
├── __create/                # Core Hono entrypoint, database adapter, and route-builders
├── plugins/                 # Custom Vite compilation and environment injection plugins
├── scripts/                 # Vercel Build Output API custom packaging scripts
├── src/
│   ├── app/                 # React Router pages, layouts, and route definitions
│   │   ├── account/         # Sign-in & Sign-up views (Firebase-integrated)
│   │   ├── cart/            # Interactive cart and Stripe Checkout portal
│   │   ├── landing/         # Monochrome marquee and stats landing page
│   │   └── product/         # Dynamic product details and review board
│   ├── components/          # Reusable UI elements (Product Cards, Headers)
│   └── utils/               # Firebase configurations, custom hooks, and state managers
├── vercel.json              # Custom Vercel Build configuration
├── vite.config.ts           # Bundler environment settings
└── seed-products.js         # PostgreSQL catalog database seeder
```

---

## 🚀 Local Development Setup

### 1. Clone the repository and install dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL=postgresql://<user>:<password>@<host>/<dbname>?sslmode=require

# Firebase Client Credentials
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...

# NextAuth Configuration
AUTH_URL=http://localhost:4000
AUTH_SECRET=secretsecretsecretsecretsecretsecretsecret
AUTH_TRUST_HOST=true
```

### 3. Seed the PostgreSQL Database
Populate your database with the beautifully curated monochrome products catalog:
```bash
node seed-products.js
```

### 4. Run the Programmatic Integration Test
Confirm your database connection and Stripe SDK keys are fully operational:
```bash
node test-integration.js
```

### 5. Launch the Development Server
```bash
npm run dev
```
Open `http://localhost:4000` in your browser.

---

## 📦 Production Deployment (Vercel)
The project compiles and packages natively for Vercel Serverless Functions using the custom build wrapper `node scripts/vercel-build.mjs`. 

To deploy instantly from the command-line:
1.  Add environment variables in the Vercel project settings (specifically `AUTH_TRUST_HOST=true`).
2.  Run the Vercel deploy command:
    ```bash
    npx vercel --prod --yes
    ```
