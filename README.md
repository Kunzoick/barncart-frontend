# BarnCart Frontend

A React (Vite) frontend for BarnCart — a farm-based e-commerce platform. Built as a portfolio project demonstrating real-time inventory updates, a multi-step Stripe checkout flow, and a full customer + admin experience.

**Live demo:** https://barncart-frontend.vercel.app  
**Author:** Kunzoick  
**Repository:** https://github.com/Kunzoick/barncart-frontend  
**Backend repository:** https://github.com/Kunzoick/barncart-backend

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 (Vite) |
| Routing | React Router v7 |
| HTTP | Axios (`withCredentials: true`) |
| WebSocket | SockJS + STOMP |
| Styling | Tailwind CSS v3 |
| Payment | Stripe.js + React Stripe.js |
| State | React Context + useState/useReducer |
| Auth storage | Access token in memory (`window.__accessToken__`), refresh token in httpOnly cookie |
| Icons | lucide-react |
| Charts | Custom CSS/SVG (recharts installed but not used — see Known Gaps) |

---

## Architecture Highlights

- **In-memory access tokens, httpOnly refresh cookies** — access tokens never touch localStorage or sessionStorage, eliminating XSS token theft. Refresh tokens are invisible to JavaScript entirely
- **Silent refresh on mount** — `AuthContext` restores the session on page load without requiring the user to log in again, with an `authLoading` gate to prevent UI flash between logged-out and logged-in states
- **Real-time inventory via WebSocket** — SockJS + STOMP subscription to `/topic/listing/{id}/inventory` updates stock counts live without polling
- **Multi-step checkout with reservation timer** — delivery slot selection → address → Stripe payment, with a live countdown reflecting the backend's 15-minute stock reservation window
- **Resilient checkout on resume** — if a user reloads mid-checkout, the app detects an existing `RESERVED` order and resumes at the payment step rather than restarting

---

## Project Structure

```
src/
├── api/
│   ├── axios.js              # Configured Axios instance with auth interceptor
│   ├── auth.js
│   ├── listings.js
│   ├── cart.js
│   ├── orders.js
│   ├── delivery.js
│   └── admin.js
├── context/
│   ├── AuthContext.jsx       # Silent refresh, in-memory access token
│   └── CartContext.jsx
├── hooks/
│   ├── useWebSocket.js
│   ├── useInventory.js
│   └── useOrderStatus.js
├── components/
│   ├── auth/RequireAdmin.jsx
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── AdminLayout.jsx
│   ├── listing/ListingCard.jsx
│   ├── checkout/ReservationTimer.jsx
│   └── order/OrderStatusBadge.jsx
└── pages/
    ├── Home.jsx
    ├── Login.jsx
    ├── Register.jsx
    ├── VerifyEmail.jsx
    ├── ForgotPassword.jsx
    ├── ResetPassword.jsx
    ├── Listings.jsx
    ├── ListingDetails.jsx
    ├── Cart.jsx
    ├── Checkout.jsx
    ├── OrderConfirmation.jsx
    ├── Orders.jsx
    ├── OrderDetail.jsx
    └── admin/
        ├── AdminDashboard.jsx
        ├── AdminOrders.jsx
        ├── AdminBatches.jsx
        ├── AdminListings.jsx
        ├── AdminSlots.jsx
        ├── AdminProduce.jsx
        └── AdminAnalytics.jsx
```

---

## Design System

| Token | Value |
|---|---|
| `farm-green` | `#2D6A4F` |
| `farm-amber` | `#F4A261` |
| `farm-bg` | `#FAFAF8` |
| `farm-text` | `#1A1A1A` |
| `farm-greenLight` | `#52B788` |
| `farm-greenMuted` | `#D8F3DC` |
| `farm-amberLight` | `#FEDCB8` |

Font: Inter (Google Fonts)

Mobile-first on all customer-facing pages, 390px minimum viewport. Admin panel targets 768px+ desktop use.

---

## Auth Flow

1. On login/register, the backend issues an access token (returned in the response body) and a refresh token (set as an httpOnly cookie)
2. Access token is stored in `window.__accessToken__` — memory only, never persisted
3. Every request attaches `Authorization: Bearer <token>` via an Axios request interceptor
4. On `401` or `403` (expired token can surface as either depending on Spring Security's filter chain position), the response interceptor attempts a silent refresh via the cookie, then retries the original request once
5. On page load, `AuthContext` calls the refresh endpoint proactively to restore the session — gated by `authLoading` so the UI doesn't flash a logged-out state while this resolves

Email verification is sent on registration but not required to log in — users can skip verification and log in immediately. This is a deliberate portfolio decision (see Known Gaps) to keep the demo testable without email delivery restrictions.

---

## Running Locally

### Prerequisites
- Node.js 18+
- Backend running locally (see [barncart-backend](https://github.com/Kunzoick/barncart-backend))

### 1. Clone the repo
```bash
git clone https://github.com/Kunzoick/barncart-frontend.git
cd barncart-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create local environment file
Create `.env` in the project root (never committed):

```env
VITE_API_URL=http://localhost:8080
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Run the dev server
```bash
npm run dev
```

Runs on `http://localhost:5173` by default.

---

## Environment Variables (Production — Vercel)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (Render deployment) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (test mode) |

---

## Deployment

Deployed on Vercel with automatic deployments on push to `main`. Backend CORS and cookie settings (`WEBSOCKET_ALLOWED_ORIGINS`, `FRONTEND_URL`, `app.cookie.secure`) are configured on the Render side to match the Vercel production URL.

---

## Known Gaps

| Gap | Notes |
|---|---|
| Recharts installed but unused | `recharts@2.12.7` has a Vite compatibility issue causing blank chart renders. `AdminAnalytics.jsx` uses pure CSS/SVG charts instead. Do not upgrade recharts to v3 — this previously broke the app. `vite.config.js` retains `optimizeDeps.include: ['recharts']` |
| Email verification is optional | Registration sends a verification email, but users can skip it and log in immediately. This is intentional for portfolio/demo purposes — Resend's free tier only delivers to the account owner's email without a verified domain |
| Mobile checkout state loss | If mobile Safari reloads the page mid-checkout (before payment), slot and address selections are lost. If a reservation was already created, the app resumes correctly at the payment step; earlier steps are not persisted across reload |
| Cold start delay | Backend is on Render's free tier — a period of inactivity causes a cold start of several seconds on the next request. UptimeRobot pings `/actuator/health` every 5 minutes to minimize this, but brief delays can still occur |
| Featured listings, customer reviews | Deferred features, not implemented |

---

## Related Documentation

Backend architecture decisions, bug history, and API documentation live in the [barncart-backend repository](https://github.com/Kunzoick/barncart-backend), including:

- 15 Architectural Decision Records covering checkout flow, WebSocket patterns, auth design, and more
- A detailed bug log documenting real production issues encountered and resolved during deployment
