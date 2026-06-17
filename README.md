# AetherSound Premium Headphones E-Commerce Application

AetherSound is a production-ready, premium e-commerce web application tailored for selling high-end headphones. The interface features a futuristic dark-mode aesthetic with neon green accents, glassmorphic containers, smooth hover scales, visual stepper tracking, and interactive product details.

---

## 🚀 Quick Start (Runs Out-of-the-Box!)

The project is configured to run instantly **without requiring any pre-installed database or external configurations**. If no MongoDB cluster is provided, the backend transparently launches a local file-based database fallback that auto-seeds premium headphones on first boot.

### 1. Install Dependencies
Run the following command at the **workspace root directory** to install all required packages concurrently:
```bash
npm run install-all
```

### 2. Launch the Development Servers
Start both the Node/Express backend (Port `5000`) and the Vite/React frontend (Port `5173`) simultaneously:
```bash
npm run dev
```

### 3. Open in Browser
Open your browser and navigate to:
```
http://localhost:5173
```

---

## 🔑 Demo Credentials

To explore role-based flows easily, use the following pre-seeded customer and administrator credentials:

| Portal Role | Email | Password | Privileges |
|---|---|---|---|
| **Standard Customer** | `user@aethersound.com` | `user123` | Cart operations, reviews, checkout, order history & visual timelines tracking. |
| **Administrator** | `admin@aethersound.com` | `admin123` | Full dashboard metrics, products CRUD, categories registry, orders status updates, user role toggles. |

---

## 📂 Project Architecture

```
/project-root
├── backend/
│   ├── config/          # Database connection handlers & data seeding scripts
│   ├── controllers/     # Authentication, products, categories, orders & admin controllers
│   ├── data/            # Local JSON database files (fallback mode)
│   ├── middleware/      # JWT security verify & global express error handlers
│   ├── models/          # Mongoose database models (MongoDB mode)
│   ├── routes/          # API endpoint routes mapping
│   ├── services/        # dbService database query abstraction layer
│   ├── server.js        # Backend Express entry point
│   ├── .env             # Active environment configurations
│   └── .env.example     # Configuration guide references
│
├── frontend/
│   ├── src/
│   │   ├── assets/      # Media and global static files
│   │   ├── components/  # Header, Footer, ProductCard, SkeletonLoader, Route guards
│   │   ├── context/     # Auth, Cart, Wishlist, and Toast notifications contexts
│   │   ├── layouts/     # RootLayout wrapper
│   │   ├── pages/       # Home, Shop, Details, Cart, Wishlist, Profile, Orders, OrderTracking, AdminDashboard
│   │   ├── services/    # api.js Fetch API call wrapper
│   │   ├── index.css    # Scoped Vanilla CSS design tokens & animations
│   │   ├── App.jsx      # React router pages configuration
│   │   └── main.jsx     # Frontend DOM mounting entry point
│   └── vite.config.js
│
├── package.json         # Root package manager mapping concurrent commands
└── README.md            # Setup & configuration instructions
```

---

## 📡 RESTful API Documentation

All API routes are prefixed with `/api` and are hosted on port `5000` (`http://localhost:5000/api`).

### 1. Authentication (`/api/auth`)
* `POST /auth/register` - Create standard customer user (or administrator if email is `admin@aethersound.com`).
* `POST /auth/login` - Verify credentials and obtain JWT Bearer tokens.
* `GET /auth/profile` - Fetch profile metadata. *(Protected)*
* `PUT /auth/profile` - Modify name, email, or passwords. *(Protected)*

### 2. Catalog Products (`/api/products`)
* `GET /products` - Browse products. Supports queries: `?search=model&category=Over-Ear&brand=AetherSound&minPrice=100&maxPrice=350&rating=4&sort=price_asc`.
* `GET /products/:id` - Fetch item details and specs.
* `POST /products` - Register new product drops. *(Admin Only)*
* `PUT /products/:id` - Modify product drop details. *(Admin Only)*
* `DELETE /products/:id` - Remove product from database. *(Admin Only)*
* `POST /products/:id/reviews` - Submit ratings and reviews. *(Protected)*

### 3. Categories (`/api/categories`)
* `GET /categories` - Load registered sound category profiles.
* `POST /categories` - Create new category blocks. *(Admin Only)*
* `DELETE /categories/:id` - Remove category block. *(Admin Only)*

### 4. Orders Fulfillment (`/api/orders`)
* `POST /orders` - Place new orders. Decalls product stock levels. *(Protected)*
* `GET /orders/myorders` - Fetch log of purchase history. *(Protected)*
* `GET /orders/:id` - Fetch detailed receipt details. *(Protected)*
* `POST /orders/checkout-session` - Creates Stripe Checkout URLs or issues local simulator modes. *(Protected)*

### 5. Administrative Controls (`/api/admin`)
* `GET /admin/dashboard` - Gross revenue statistics, terminal counts, stock level alert counts. *(Admin Only)*
* `GET /admin/users` - List all registered user terminals. *(Admin Only)*
* `PUT /admin/users/:id/role` - Toggle administrative permissions. *(Admin Only)*
* `GET /admin/orders` - View all active orders in database. *(Admin Only)*
* `PUT /admin/orders/:id/status` - Update order tracking state. *(Admin Only)*

---

## ⚙️ Configuration Setup

### Connect to MongoDB Database
1. Create a MongoDB database (e.g. via Atlas or Local container).
2. Inside `backend/.env`, set:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/aethersound
   ```
3. Restart dev server. It will automatically connect and seed the MongoDB database.

### Integrate Stripe Payments
1. Obtain test API keys from the [Stripe Dashboard](https://dashboard.stripe.com).
2. In `backend/.env`, populate:
   ```env
   STRIPE_SECRET_KEY=sk_test_yourSecretKeyHere
   ```
3. Restart server. The secure Checkout button on the cart will redirect users directly to official Stripe Checkout hosted domains and automatically record successful orders.
