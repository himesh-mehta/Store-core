# Database & Authentication Integration 🔑

This document details how **CampusOne (StoreCore Essentials)** handles user authentication, session state, and database operations using **Auth.js** and a serverless **Neon PostgreSQL** database.

---

## 💾 Neon Serverless Connection

The web application uses the `@neondatabase/serverless` connection pool client to connect dynamically to the cloud PostgreSQL database:

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
```

All standard queries are processed over this pool with high-speed connection multiplexing.

---

## 🛠️ Custom Auth.js Adapter: `src/auth.js`

Instead of standard, pre-built ORM adapters, CampusOne implements a specialized SQL-based adapter in `src/auth.js`. This ensures the application is extremely lean and queries are fully optimized. 

The custom adapter maps standard Auth.js operations directly to PostgreSQL tables:

### 1. `auth_users` Table
Stores primary user profile records.
* **SQL Insert:**
  ```sql
  INSERT INTO auth_users (name, email, "emailVerified", image)
  VALUES ($1, $2, $3, $4)
  RETURNING id, name, email, "emailVerified", image;
  ```
* **SQL Query:**
  ```sql
  SELECT * FROM auth_users WHERE id = $1;
  ```

### 2. `auth_accounts` Table
Links specific credentials or social credentials (e.g., Google, Facebook, Apple) to a user account.
* **SQL Insert:**
  ```sql
  INSERT INTO auth_accounts (
    "userId", provider, type, "providerAccountId", 
    access_token, expires_at, refresh_token, id_token, 
    scope, session_state, token_type, password
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  RETURNING *;
  ```

### 3. `auth_sessions` Table
Manages database-backed sessions.
* **SQL Insert:**
  ```sql
  INSERT INTO auth_sessions ("userId", expires, "sessionToken")
  VALUES ($1, $2, $3)
  RETURNING id, "sessionToken", "userId", expires;
  ```

### 4. `auth_verification_token` Table
Used for email verification routines and one-time password links.
* **SQL Insert:**
  ```sql
  INSERT INTO auth_verification_token (identifier, expires, token)
  VALUES ($1, $2, $3);
  ```

---

## 🔐 Credentials Providers

CampusOne implements two secure credential authentication engines using `auth.js`:

### 📥 1. Sign In Provider (`credentials-signin`)
* **ID:** `credentials-signin`
* **Trigger Location:** `src/app/account/signin/page.jsx`
* **Execution Flow:**
  1. Requests `email` and `password`.
  2. Queries the user account via `adapter.getUserByEmail(email)`.
  3. Verifies if there is an associated credentials account.
  4. Cryptographically matches the hashed password with the user-inputted password using `argon2.verify()`.
  5. Returns the user object upon success; otherwise throws a credential sign-in error.

### 📤 2. Sign Up Provider (`credentials-signup`)
* **ID:** `credentials-signup`
* **Trigger Location:** `src/app/account/signup/page.jsx`
* **Execution Flow:**
  1. Requests user profile metadata (`email`, `password`, `name`, `image`).
  2. Checks if an account already exists with the given email.
  3. If vacant, inserts a new user record inside the `auth_users` table.
  4. Hashes the user password using `argon2.hash()`.
  5. Inserts an entry in the `auth_accounts` table linking the user to `credentials` with the secure hash.
  6. Authenticates and starts the user session immediately.

---

## 🧪 Cryptographic Architecture

Password hashing uses **Argon2**, the winner of the Password Hashing Competition (PHC) and the industry standard for securing raw secrets against brute-force attacks.

* **Argon2 Hashing:** Done on the server side prior to saving credentials records in PostgreSQL.
* **Salt & Memory Hardness:** Managed automatically by the `argon2` module to prevent GPU-accelerated dictionary attacks.
