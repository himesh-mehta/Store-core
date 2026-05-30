# Database Migrations

This document contains the raw SQL migrations to initialize the Neon PostgreSQL database for StoreCore.

```sql
-- StoreCore Database Migrations Script
-- Copy and paste this script into your Neon Console SQL Editor to initialize all tables!

-- -------------------------------------------------------------
-- 1. Create Authentication Tables (Auth.js / NextAuth Schema)
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS auth_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    "emailVerified" TIMESTAMP WITH TIME ZONE,
    image VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user', -- 'user' or 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth_accounts (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    provider VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    "providerAccountId" VARCHAR(255) NOT NULL,
    access_token TEXT,
    expires_at INTEGER,
    refresh_token TEXT,
    id_token TEXT,
    scope VARCHAR(255),
    session_state VARCHAR(255),
    token_type VARCHAR(255),
    password TEXT -- Encrypted credentials hash (Argon2)
);

CREATE TABLE IF NOT EXISTS auth_sessions (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    "sessionToken" VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_verification_token (
    identifier VARCHAR(255) NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    token VARCHAR(255) PRIMARY KEY
);

-- -------------------------------------------------------------
-- 2. Create E-Commerce Storefront Tables
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    stock INTEGER DEFAULT 0,
    rating NUMERIC(3, 1) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- Corresponds to user auth ID string
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT one_review_per_user UNIQUE(product_id, user_id)
);
```
