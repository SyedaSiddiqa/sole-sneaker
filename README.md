# SOLE — Move Different.

A premium, 3D-focused sneaker e-commerce store built with the **MERN stack**.
It combines a luxury storefront (real 3D sneaker, GSAP scroll animations, light/dark theme) with a complete shop backend: authentication, products, cart, wishlist, Cash on Delivery checkout, order tracking and an admin dashboard.

<!-- Add screenshots here, e.g.
![Home](docs/home.png)
![Products](docs/products.png)
![Admin](docs/admin.png)
-->

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Demo Accounts](#demo-accounts)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [Security Notes](#security-notes)
- [Testing](#testing)
- [Deployment](#deployment)
- [Known Limitations](#known-limitations)
- [Credits](#credits)
- [License](#license)

---

## Features

### Storefront
- **Real 3D sneaker** (glTF model) rendered with React Three Fiber: floating, slow rotation, mouse parallax, studio lighting, gold podium and particles
- **Scroll-driven animation** with GSAP + ScrollTrigger (the sneaker spins, lifts and scales as you scroll)
- Cinematic **loading screen** (animated 1% → 100% counter), hide-on-scroll navbar, magnetic buttons, card tilt, masonry gallery with parallax
- **Light / Dark mode** with a gold luxury design system, saved between visits
- Fully **responsive** (mobile menu, filter drawer, touch-friendly) and respects `prefers-reduced-motion`
- Loading skeletons, empty states and toast notifications

### Shopping
- Product catalogue from MongoDB with **search, category / size / colour / price filters, sorting** (featured, popularity, price, newest, rating) and **server-side pagination**
- Product page with 3D view, image gallery, size and colour selection, stock status, related products
- **Cart**: add, remove, change quantity, size selection, subtotal / shipping / total. Guest cart is stored in the browser and merged into the account cart at login
- **Wishlist**: add, remove and view saved products
- **Checkout** with customer details, shipping address, order summary and **Cash on Delivery**
- **Orders**: order history, order details, visual status tracker (Pending → Processing → Shipped → Delivered) and cancellation while an order has not shipped

### Authentication
- Registration and login with **bcrypt**-hashed passwords and **JWT** sessions
- Protected routes and **role-based access** (Customer / Admin)

### Admin Dashboard
- Overview: total products, users, orders, revenue, orders by status, recent orders, low-stock alert
- **Products**: add, edit, delete
- **Orders**: view details and update status (stock is restored when an order is cancelled)
- **Users**: list and remove registered users

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router, Tailwind CSS, shadcn/ui-style components (Radix UI), Lucide icons, Sonner (toasts) |
| Animation / 3D | GSAP, ScrollTrigger, Three.js, React Three Fiber, drei |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth & Security | JWT, bcryptjs, helmet, CORS, express-rate-limit, express-validator |
| Testing | Vitest, Testing Library (UI) and an end-to-end API test script |

---

## Project Structure

```
sole/
├── public/models/sneaker.glb      # 3D sneaker model (see Credits)
├── src/
│   ├── components/                # Navbar, Footer, Hero3D, ShoeModel, ProductCard, CartDrawer, ...
│   │   ├── ui/                    # shadcn-style primitives (Button, Dialog, Sheet, Slider, Tabs, ...)
│   │   └── admin/                 # Admin product form
│   ├── context/                   # Theme, Auth, Cart, Wishlist providers
│   ├── pages/                     # Home, About, Products, ProductDetails, Checkout, Orders, Admin, ...
│   ├── lib/                       # API client and helpers
│   └── test/                      # UI integration tests
└── server/
    ├── config/                    # MongoDB connection
    ├── models/                    # User, Product, Cart, Order
    ├── controllers/               # Business logic
    ├── routes/                    # Routes + validation rules
    ├── middleware/                # auth (protect / role), validation, error handling
    ├── tests/                     # API test script
    ├── seed.js                    # Demo data
    └── server.js
```

---

## Getting Started

### Prerequisites
- **Node.js 18+**
- **MongoDB**: a local MongoDB Community Server, or a free MongoDB Atlas cluster

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# 2. Install frontend and backend dependencies
npm run setup

# 3. Create the server environment file
cp server/.env.example server/.env        # Windows: copy server\.env.example server\.env
```

Open `server/.env` and set `MONGO_URI` and `JWT_SECRET` (see [Environment Variables](#environment-variables)).

```bash
# 4. Add demo data (products, admin and customer accounts)
npm run seed

# 5. Start frontend and backend together
npm run dev:all
```

- Frontend: http://localhost:5173
- API: http://localhost:5000 (health check: `/api/health`)

> **Warning:** `npm run seed` deletes existing users, products, carts and orders in the configured database. Use an empty database.

---

## Environment Variables

Create `server/.env` (never commit it):

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | API port | `5000` |
| `NODE_ENV` | `development` or `production` | `development` |
| `CLIENT_URL` | Allowed frontend origin(s), comma-separated | `http://localhost:5173` |
| `MONGO_URI` | MongoDB connection string (include the database name) | `mongodb://127.0.0.1:27017/sole` |
| `JWT_SECRET` | Long random secret (16+ characters) | generate below |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin account created by the seed script | `admin@sole.com` |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

For MongoDB Atlas use a string like
`mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/sole?retryWrites=true&w=majority`
(URL-encode special characters in the password and allow your IP in Atlas Network Access).

Optional frontend variable (only if the API is on a different origin): `VITE_API_URL` — see `.env.example`.

---

## Demo Accounts

Created by `npm run seed` (change the admin password in `.env` before seeding anything public):

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@sole.com` | `Admin@12345` |
| Customer | `customer@sole.com` | `Customer@123` |

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run setup` | Install frontend and backend dependencies |
| `npm run dev:all` | Run frontend (Vite) and backend (Express) together |
| `npm run dev` | Frontend only |
| `npm run dev:server` | Backend only (auto-restart) |
| `npm run seed` | Reset the database and insert demo data |
| `npm run build` | Production build of the frontend |
| `npm start` | Serve the built app and the API from Express (`NODE_ENV=production`) |
| `npm test` | Run the UI integration tests |

---

## API Overview

Base URL: `/api`. Endpoints marked 🔒 require `Authorization: Bearer <token>`; 👑 requires the admin role.

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, 🔒 `GET /auth/me`, 🔒 `PUT /auth/me` |
| Products | `GET /products` (query: `search`, `category`, `sizes`, `colors`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`, `featured`), `GET /products/:id`, `GET /products/:id/related`, 👑 `POST /products`, 👑 `PUT /products/:id`, 👑 `DELETE /products/:id` |
| Cart 🔒 | `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`, `DELETE /cart`, `POST /cart/merge` |
| Wishlist 🔒 | `GET /wishlist`, `POST /wishlist/:productId`, `DELETE /wishlist/:productId` |
| Orders 🔒 | `POST /orders`, `GET /orders/mine`, `GET /orders/:id`, `PATCH /orders/:id/cancel`, 👑 `GET /orders`, 👑 `PATCH /orders/:id/status` |
| Admin 👑 | `GET /admin/stats`, `GET /admin/users`, `DELETE /admin/users/:id` |

Sorting values: `featured`, `popular`, `price-asc`, `price-desc`, `newest`, `rating`.

---

## Security Notes

- Passwords are hashed with bcrypt (cost 12) and never returned by the API
- Public registration can only create **customer** accounts; admins come from the seed script
- **Prices, totals and stock are always calculated on the server** from the database, never trusted from the client
- Stock is reserved per order line and restored when an order is cancelled
- helmet, a CORS allow-list, rate-limited auth routes, request size limit, input validation and centralized error handling

---

## Testing

```bash
# Start the API and seed a fresh database first
node server/tests/api.test.mjs   # 71 end-to-end API checks
npm test                          # 12 UI tests that render the real app against the API
```

The API script covers authentication, validation, filtering, cart, wishlist, orders, role-based access, stock handling and admin actions.

---

## Deployment

The simplest setup is a single server:

```bash
npm run build
npm start        # Express serves the built React app and the API (NODE_ENV=production)
```

Set `MONGO_URI` (e.g. MongoDB Atlas), a strong `JWT_SECRET` and `CLIENT_URL` in the host's environment variables. If the frontend is hosted separately (Vercel, Netlify), set `VITE_API_URL` at build time and add the frontend URL to `CLIENT_URL`.

---

## Known Limitations

- Payment method is Cash on Delivery only (no online payment gateway)
- No email notifications, email verification or password reset yet
- Admin product images are added by URL (no file upload yet)
- The same 3D sneaker model is shown for every product; the model file is ~7.8 MB (compress with Draco / meshopt for faster loads)
- The auth token is stored in `localStorage`; an httpOnly cookie would be more secure
- Product photos are placeholder URLs; replace them with your own photography

---

## Credits

- 3D sneaker model: **"MaterialsVariantsShoe"** from the [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets), by Eric Chadwick / Wayfair, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Keep this attribution if you use the model.
- Icons by [Lucide](https://lucide.dev), UI primitives by [Radix UI](https://www.radix-ui.com)

---

## License

Released under the [MIT License](LICENSE). Add a `LICENSE` file, or replace this section with the license you prefer.
