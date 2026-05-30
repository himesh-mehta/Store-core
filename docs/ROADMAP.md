# Product Roadmap

This document outlines the phased approach to building and scaling the StoreCore / CampusOne platform.

---

## ✅ Phase 1: MVP & Core Foundation (Current)
The goal of this phase was to establish a beautiful, working storefront with full authentication and product browsing capabilities.

- [x] **Storefront UI:** Responsive grid layout, premium typography, and animations.
- [x] **Product Catalog:** Dynamic rendering of products by category and price filters.
- [x] **Shopping Cart:** Zustand-powered persistent local state for cart management.
- [x] **Authentication:** Secure credentials login using Auth.js and Argon2 hashing.
- [x] **Admin Dashboard:** Basic inventory and order oversight for campus managers.
- [x] **Database Setup:** Neon serverless PostgreSQL schema deployment.

---

## 🚧 Phase 2: Checkout & User Profiles (Upcoming)
The next immediate focus is to finalize the checkout pipeline and enhance the user account experience.

- [ ] **Stripe Integration:** Fully functional payment processing and checkout sessions.
- [ ] **Order Webhooks:** Secure webhook listeners to update order statuses automatically upon payment.
- [ ] **User Profiles:** Allow users to update their details, shipping addresses, and avatars.
- [ ] **Wishlist Feature:** Allow users to save items for later without adding them to the cart.
- [ ] **Product Reviews:** Enable authenticated users to leave 1-5 star ratings and comments on purchased items.

---

## 🔮 Phase 3: Scaling & Ecosystem (Future)
Long-term goals to expand the platform's utility beyond a simple retail store.

- [ ] **Multi-Vendor Support:** Allow different campus clubs, departments, or local businesses to list their own merchandise.
- [ ] **Mobile Application:** A dedicated React Native / Expo application that shares the same backend.
- [ ] **Advanced Analytics:** Dashboard charts for admins to visualize sales trends, popular categories, and peak traffic times.
- [ ] **Inventory Alerts:** Automated email notifications when stock runs low for popular items.
