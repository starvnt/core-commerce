# StarVnt Core

A core commerce platform — customers, bookings, inquiries, journeys, and admin — built on the MERN stack. This repo tracks the Day 1 foundation and onwards.

> **Status:** Day 1 foundation complete. Frontend + backend running, MongoDB connected, end-to-end Customer flow verified. See the end of this README for the Day 1 status report.

---

## Repository layout

```
core-commerce/
├── server/                     # Node.js + Express + Mongoose API
│   ├── src/
│   │   ├── config/             # env, db connection
│   │   ├── middleware/         # error handler, async wrapper
│   │   ├── modules/            # feature modules (customers/, …)
│   │   │   └── customers/      # model · service · controller · routes · index
│   │   ├── routes/             # /api router
│   │   ├── app.js              # Express app wiring
│   │   └── server.js           # entry point
│   ├── .env.example
│   └── package.json
└── client/                     # React + Vite SPA
    ├── public/
    ├── src/
    │   ├── modules/            # feature modules (customers/, …)
    │   │   └── customers/      # pages · service · index (router)
    │   ├── pages/              # top-level pages
    │   ├── components/         # shared components (Day 2+)
    │   ├── services/           # shared API clients (axios)
    │   ├── App.jsx             # top-level router
    │   ├── main.jsx            # entry point
    │   └── styles.css
    ├── .env.example
    └── package.json
```

---

## Prerequisites

- **Node.js 20+** (tested on 24.x)
- **MongoDB** — either:
  - A local install running on `mongodb://127.0.0.1:27017`, **or**
  - A MongoDB Atlas connection string, **or**
  - Nothing extra — set `ALLOW_MEMORY_DB=1` in `server/.env` to spin up an in-process MongoDB for Day 1 dev.

---

## Quick start

### 1. Backend

```bash
cd server
cp .env.example .env       # then edit if needed
npm install
npm run dev                # nodemon, hot reload
```

The API listens on **http://localhost:5000**. Sanity check: `curl http://localhost:5000/api/health`.

### 2. Frontend

```bash
cd client
cp .env.example .env       # VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev                # vite, hot reload
```

The SPA is served on **http://localhost:5173**. Vite proxies `/api/*` to the backend, so the browser only ever talks to 5173.

### 3. End-to-end smoke test

```bash
curl -X POST http://localhost:5173/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"Smoke","email":"smoke@starvnt.dev","phone":"+91 90000 00001","status":"active","source":"website"}'
```

You should get back `{"success":true,"data":{"customerId":"CUST-…",…}}`.

---

## Environment variables

### `server/.env`

| Key               | Required    | Example                                                       | Notes                                  |
| ----------------- | ----------- | ------------------------------------------------------------- | -------------------------------------- |
| `PORT`            | optional    | `5000`                                                        | Default 5000                           |
| `NODE_ENV`        | optional    | `development`                                                 |                                        |
| `MONGO_URI`       | recommended | `mongodb://127.0.0.1:27017/starvnt_core`                      | Omit if using `ALLOW_MEMORY_DB`        |
| `ALLOW_MEMORY_DB` | dev only    | `1`                                                           | Boots an in-process MongoDB (dev only) |
| `CLIENT_ORIGIN`   | optional    | `http://localhost:5173`                                       | Used by CORS                           |

### `client/.env`

| Key                  | Required | Example                              | Notes                                |
| -------------------- | -------- | ------------------------------------ | ------------------------------------ |
| `VITE_API_BASE_URL`  | optional | `http://localhost:5000/api`          | Default falls back to `/api` (proxy) |

---

## API — Day 1 surface

Base URL: `http://localhost:5000/api`

| Method | Path                | Description                  |
| ------ | ------------------- | ---------------------------- |
| GET    | `/health`           | API health probe             |
| POST   | `/customers`        | Create a customer            |
| GET    | `/customers`        | List customers (paginated)   |
| GET    | `/customers/:id`    | Get one customer by id       |
| PUT    | `/customers/:id`    | Update a customer            |
| DELETE | `/customers/:id`    | Delete a customer            |

`:id` accepts either the MongoDB `_id` or the business `customerId` (e.g. `CUST-MTHN434V-GVK`).

Request body for `POST` / `PUT`:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+91 90000 00000",
  "status": "new | active | inactive | archived",
  "source": "website | referral | walk_in | social | other"
}
```

Successful responses are wrapped: `{ "success": true, "data": ... }`. Errors return `{ "success": false, "message": "..." }`.

---

## Frontend routes

| Path                | Page                |
| ------------------- | ------------------- |
| `/`                 | Home (links to Customers) |
| `/customers`        | Customer list       |
| `/customers/add`    | Add Customer form   |
| `/customers/:id`    | Customer details    |

---

## Branch workflow

- `main` — stable, deployable
- `feat/*` — feature work (e.g. `feat/day-1-foundation`)
- `fix/*` — bug fixes

---

## Day 1 Status Report

**Repository:** `Sourav20031/core-commerce`
**Branch:** `feat/day-1-foundation`
**Latest Commit:** _filled in at end of day_

### Completed work
- Backend skeleton (`server/`) with Express + Mongoose, modular folder layout (`config/`, `middleware/`, `modules/`, `routes/`)
- Frontend skeleton (`client/`) with React + Vite, modular folder layout (`modules/`, `pages/`, `services/`, `components/`, `routes/`)
- MongoDB connection (real Mongoose wire protocol; falls back to in-process memory DB when `ALLOW_MEMORY_DB=1`)
- `.env` + `.env.example` for both apps, `.gitignore` for both
- Customer module (model, service, controller, routes, module index)
- Customer API: `POST /api/customers`, `GET /api/customers`, `GET /api/customers/:id`, `PUT /api/customers/:id`, `DELETE /api/customers/:id`
- Frontend Customer module (List, Add, Details, Service, Router entry)
- React Router wired for `/customers`, `/customers/add`, `/customers/:id`
- Vite dev proxy: `/api/*` → backend on 5000
- End-to-end proof: created a customer from the browser form path, listed it back through the API

### Working proof
- ✅ Frontend running — `http://localhost:5173`
- ✅ Backend running — `http://localhost:5000` (`/api/health` 200)
- ✅ MongoDB connected — `mongoose.connection.name = starvnt_core`
- ✅ Customer API working — POST/GET/PUT/DELETE all return `{success:true, data:…}`
- ✅ Frontend → Backend connection working — Vite proxy round-tripped POST `/api/customers` → 201 with Mongo-written document

### Pending / next steps (Day 2+)
- Replace in-memory MongoDB with a persistent Atlas cluster for shared dev
- Customer Tracking V1 — notes, follow-ups, activity timeline, status transitions
- Auth + multi-tenant organization scoping
- Admin module (users, organizations, audit log)
- Bookings, inquiries, journeys, offerings, partners, quotes modules (mirroring the prior prototype)
- Styling pass — current UI is intentionally utilitarian
- Tests — Jest + supertest on the API, React Testing Library on the SPA
