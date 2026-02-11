# Transport Management System (TMS)

A full-stack logistics and shipment management platform with role-based access control, real-time tracking, and analytics. Built with **React**, **GraphQL**, and **interoperable backends** (NestJS + Java Spring Boot).

**Live Demo:** [tms-frontend.satyadeepsb.workers.dev](https://tms-frontend.satyadeepsb.workers.dev)

> **Demo Credentials:** `admin@transport.com` / `password123`

---

## Screenshots

| | |
|---|---|
| ![Login](assets/login.png) | ![Dashboard](assets/dashboard.png) |
| **Login** - Modern auth with JWT | **Dashboard** - KPIs, status charts, driver overview |
| ![Shipments](assets/shipment.png) | ![Track](assets/track.png) |
| **Shipments** - Search, filter, table/grid views | **Tracking** - Real-time status timeline |
| ![Users](assets/users.png) | ![Drivers](assets/drivers.png) |
| **User Management** - CRUD with role assignment | **Drivers** - Activity monitoring and stats |
| ![Reports](assets/reports.png) | ![Profile](assets/profile.png) |
| **Reports** - Filtered analytics, CSV export, print | **Profile** - Account management |
| ![Edit User](assets/edit-user.png) | ![Settings](assets/setting.png) |
| **Edit User** - Role and status management | **Settings** - Notifications, preferences, export |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│          React 19 + TypeScript + Tailwind CSS           │
│              Apollo Client (GraphQL)                    │
│           Cloudflare Workers (CDN Edge)                 │
└──────────────────────┬──────────────────────────────────┘
                       │ GraphQL over HTTPS
                       ▼
         ┌─────────────────────────────┐
         │     BACKEND (Choose One)    │
         │                             │
         │  ┌───────┐    ┌──────────┐  │
         │  │NestJS │ OR │  Spring  │  │
         │  │ :3000 │    │  Boot    │  │
         │  │  TS   │    │  :8080   │  │
         │  │Prisma │    │Hibernate │  │
         │  └───┬───┘    └────┬─────┘  │
         │      │  Same API   │        │
         │      │  Contract   │        │
         └──────┼─────────────┼────────┘
                │             │
                ▼             ▼
         ┌─────────────────────────────┐
         │       PostgreSQL            │
         │    Neon (Serverless)        │
         │    Shared Database          │
         └─────────────────────────────┘
```

### Key Design Decisions

- **GraphQL as API contract** - Both backends implement the same GraphQL schema, making them fully interchangeable. The frontend doesn't know or care which backend is running.
- **Backend independence** - Switch between NestJS and Java Spring Boot by changing one environment variable. Zero frontend code changes required.
- **Serverless database** - Neon PostgreSQL auto-suspends when idle and wakes in ~1 second, keeping free-tier costs at zero.
- **Edge deployment** - Frontend deployed to Cloudflare's edge network for sub-50ms load times globally.

---

## Features

### Shipment Management
- Create, update, and delete shipments with full cargo details
- Track shipments by tracking number with visual status timeline
- Filter by status, city, tracking number, or free-text search
- Pagination with configurable page sizes
- Table and grid view modes

### User & Role Management
- Four roles: **Admin**, **Dispatcher**, **Driver**, **Customer**
- Admins can create, edit, deactivate, and delete users
- Role-based route protection and API authorization

### Driver Management
- View all drivers with active/inactive status
- Assign drivers to shipments
- Driver activity statistics (active, inactive, total)

### Dashboard & Analytics
- Real-time KPI cards: Total Shipments, Delivered, In Transit, Revenue
- Status distribution breakdown with visual progress bars
- Driver overview with online/offline status

### Reports
- Filter by date range, status, and vehicle type
- Revenue summary (estimated vs actual)
- Status breakdown across all shipments
- Export to CSV and print support

### Profile & Settings
- Edit personal information and change password
- Notification preferences (email, push, shipment updates)
- Dashboard preferences (statistics toggle, default view)
- Data export functionality

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite 7 | Build tool and dev server |
| Apollo Client | GraphQL state management |
| Tailwind CSS v3 | Utility-first styling (Horizon UI theme) |
| React Router v7 | Client-side routing |
| ApexCharts | Dashboard charts |
| TanStack Table | Data tables with sorting and pagination |

### Backend Option 1: NestJS
| Technology | Purpose |
|---|---|
| NestJS 11 | Node.js framework |
| TypeScript | Type safety |
| Apollo Server | GraphQL API |
| Prisma 7 | ORM with migrations |
| Passport.js + JWT | Authentication |
| bcrypt | Password hashing |

### Backend Option 2: Java Spring Boot
| Technology | Purpose |
|---|---|
| Spring Boot 3.4 | Java framework |
| Java 21 | Runtime |
| Spring for GraphQL | GraphQL API |
| Hibernate (JPA) | ORM |
| MapStruct | Compile-time DTO mapping |
| Spring Security + JWT | Authentication |

### Infrastructure
| Service | Purpose | Tier |
|---|---|---|
| Neon | PostgreSQL database | Free (0.5GB) |
| Koyeb | Backend hosting (Docker) | Free (always-on) |
| Cloudflare Workers | Frontend hosting (edge) | Free (unlimited bandwidth) |
| GitHub Actions | CI/CD pipelines | Free (2000 min/mo) |
| GHCR | Docker image registry | Free |

---

## Data Model

```
┌──────────────────┐         ┌──────────────────────────┐
│      User        │         │       Shipment           │
├──────────────────┤         ├──────────────────────────┤
│ id          PK   │    ┌───▶│ id              PK       │
│ email     unique │    │    │ trackingNumber  unique   │
│ password         │    │    │ status                   │
│ firstName        │    │    │ shipperName/Phone/Email  │
│ lastName         │    │    │ shipperAddress/City/     │
│ role (enum)      │    │    │   State/Zip              │
│ phone            │    │    │ consigneeName/Phone/     │
│ isActive         │    │    │   Email/Address/City/    │
│ createdAt        │    │    │   State/Zip              │
│ updatedAt        │    │    │ cargoDescription         │
│                  │    │    │ weight, dimensions       │
│ shipmentsCreated─┼────┘    │ vehicleType              │
│ shipmentsAssigned┼────┐    │ estimatedRate, actualRate │
└──────────────────┘    │    │ currency                 │
                        │    │ pickupDate               │
      Roles:            │    │ estimatedDelivery        │
      - ADMIN           │    │ deliveryDate             │
      - DISPATCHER      │    │ createdById    FK──▶User │
      - DRIVER          └───▶│ driverId       FK──▶User │
      - CUSTOMER              │ notes                   │
                              │ createdAt, updatedAt    │
      Shipment Statuses:      └────────────────────────┘
      - PENDING
      - ASSIGNED
      - PICKED_UP
      - IN_TRANSIT
      - DELIVERED
      - CANCELLED
```

---

## Request Flow

```
1. User opens app
   Browser ──▶ Cloudflare Workers (serves static React app)

2. User logs in
   React App ──▶ GraphQL Mutation: login(email, password)
            ──▶ Backend validates credentials
            ◀── Returns JWT token + user data
            ──▶ Token stored in localStorage

3. User views shipments
   React App ──▶ GraphQL Query: shipments(filter, pagination)
              │  Authorization: Bearer <JWT>
              ▼
   Backend   ──▶ JWT Guard validates token
             ──▶ Role Guard checks permissions
             ──▶ Service queries PostgreSQL (Prisma/Hibernate)
             ◀── Returns paginated shipment data
              │
   React App ◀── Apollo Client caches response
             ──▶ Renders table with TanStack Table

4. Dispatcher creates shipment
   React App ──▶ GraphQL Mutation: createShipment(input)
              │  Role required: ADMIN | DISPATCHER | CUSTOMER
              ▼
   Backend   ──▶ Validates input (class-validator / Jakarta Bean)
             ──▶ Generates tracking number
             ──▶ Saves to PostgreSQL
             ◀── Returns new shipment with tracking #

5. Anyone tracks a shipment (public, no auth)
   React App ──▶ GraphQL Query: trackShipment(trackingNumber)
             ◀── Returns shipment with status timeline
```

---

## Project Structure

```
transportation-management-app/
│
├── frontend/                     # React SPA
│   ├── src/
│   │   ├── pages/                # Dashboard, Shipments, Users, Drivers,
│   │   │                         # Track, Reports, Profile, Settings
│   │   ├── components/           # Logo, PageTitle, reusable UI
│   │   ├── horizon-components/   # Sidebar, Navbar (Horizon UI)
│   │   ├── layouts/              # Admin layout, Auth layout
│   │   ├── contexts/             # AuthContext (JWT state)
│   │   ├── graphql/              # Queries and mutations
│   │   ├── lib/                  # Apollo Client setup
│   │   └── routes.tsx            # Route definitions
│   ├── wrangler.jsonc            # Cloudflare Workers config
│   └── tailwind.config.js        # Horizon UI theme
│
├── backend/                      # NestJS GraphQL API
│   ├── src/
│   │   ├── auth/                 # JWT strategy, guards, decorators
│   │   ├── users/                # User CRUD, role filtering
│   │   ├── shipment/             # Shipment CRUD, tracking, assignment
│   │   ├── health/               # Health check endpoint
│   │   └── prisma/               # Database service (pg adapter)
│   ├── prisma/
│   │   ├── schema.prisma         # Data model
│   │   ├── seed.ts               # Test data seeder
│   │   └── migrations/           # SQL migrations
│   └── Dockerfile                # Multi-stage production build
│
├── backend-java/                 # Spring Boot GraphQL API (alternative)
│   ├── src/main/java/.../
│   │   ├── controller/           # GraphQL resolvers
│   │   ├── service/              # Business logic
│   │   ├── repository/           # JPA repositories
│   │   ├── model/                # JPA entities
│   │   ├── dto/                  # Input/Output DTOs
│   │   ├── mapper/               # MapStruct mappers
│   │   └── security/             # JWT filter and config
│   └── src/main/resources/
│       └── graphql/schema.graphqls
│
├── .github/workflows/            # CI/CD
│   ├── ci.yml                    # Lint + build on PRs
│   ├── deploy-backend.yml        # Docker build ──▶ GHCR ──▶ Koyeb
│   └── deploy-frontend.yml       # Vite build ──▶ Cloudflare Workers
│
└── assets/                       # Screenshots
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ (or use Docker)
- Java 21 (only if using the Java backend)

### 1. Clone and install

```bash
git clone https://github.com/Satyadeepsb/transportation-management-app.git
cd transportation-management-app
```

### 2. Start the database

```bash
# Using Docker
docker run -d --name tms-postgres \
  -e POSTGRES_USER=tms_user \
  -e POSTGRES_PASSWORD=tms_password \
  -e POSTGRES_DB=tms_database \
  -p 5432:5432 postgres:16-alpine
```

### 3. Start a backend (choose one)

**Option A: NestJS**
```bash
cd backend
cp .env.example .env          # Edit DATABASE_URL if needed
npm install
npx prisma migrate dev        # Create tables
npx tsx prisma/seed.ts        # Load test data
npm run start:dev              # Starts on http://localhost:3000
```

**Option B: Java Spring Boot**
```bash
cd backend-java
./gradlew bootRun              # Starts on http://localhost:8080
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev                    # Starts on http://localhost:5173
```

### 5. Open the app

Navigate to http://localhost:5173 and login with `admin@transport.com` / `password123`

---

## Switching Backends

The frontend works with both backends without code changes. Just update one env var:

```bash
cd frontend

# For NestJS (default):
echo "VITE_GRAPHQL_URL=http://localhost:3000/graphql" > .env.local

# For Java Spring Boot:
echo "VITE_GRAPHQL_URL=http://localhost:8080/graphql" > .env.local

# Restart frontend
npm run dev
```

Both backends implement the identical GraphQL schema. The schema acts as the API contract.

---

## Deployment

The app deploys to three free-tier cloud services:

| Component | Service | URL |
|---|---|---|
| Frontend | Cloudflare Workers | [tms-frontend.satyadeepsb.workers.dev](https://tms-frontend.satyadeepsb.workers.dev) |
| Backend | Koyeb (Docker) | `*.koyeb.app/graphql` |
| Database | Neon PostgreSQL | Serverless, auto-suspend |

### CI/CD Pipeline

```
Push to main
     │
     ├── backend/** changed?
     │        ├── Build Docker image
     │        ├── Push to GitHub Container Registry
     │        └── Redeploy on Koyeb
     │
     └── frontend/** changed?
              ├── npm run build (with production GraphQL URL)
              └── Deploy to Cloudflare Workers
```

Pull requests trigger the CI workflow which runs lint and build checks for both frontend and backend.

---

## API Overview

GraphQL endpoint: `/graphql`

### Queries
| Query | Auth Required | Description |
|---|---|---|
| `me` | Yes | Get current user |
| `users(filter, pagination)` | Yes | List users with filters |
| `user(id)` | Yes | Get user by ID |
| `drivers` | Yes | List active drivers |
| `shipments(filter, pagination)` | Yes | List shipments with filters |
| `shipment(id)` | Yes | Get shipment by ID |
| `trackShipment(trackingNumber)` | **No** | Public shipment tracking |

### Mutations
| Mutation | Roles | Description |
|---|---|---|
| `register(input)` | Public | Create new account |
| `login(input)` | Public | Authenticate and get JWT |
| `createShipment(input)` | Admin, Dispatcher, Customer | Create shipment |
| `updateShipment(input)` | Admin, Dispatcher | Update shipment details |
| `removeShipment(id)` | Admin | Delete a shipment |
| `assignDriver(shipmentId, driverId)` | Admin, Dispatcher | Assign driver |
| `flagShipment(id)` | Any authenticated | Flag for review |

---

## Role Permissions

| Capability | Admin | Dispatcher | Driver | Customer |
|---|---|---|---|---|
| View dashboard | Yes | Yes | Yes | Yes |
| Create shipments | Yes | Yes | No | Yes |
| Edit any shipment | Yes | Yes | No | No |
| Assign drivers | Yes | Yes | No | No |
| Delete shipments | Yes | No | No | No |
| Manage users | Yes | No | No | No |
| Track shipments | Yes | Yes | Yes | Yes |
| View reports | Yes | Yes | No | No |

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/tms_database
DIRECT_DATABASE_URL=postgresql://user:pass@host/tms_database   # For Neon
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRATION=24h
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173   # Comma-separated for multiple origins
```

### Frontend (.env.local)
```env
VITE_GRAPHQL_URL=http://localhost:3000/graphql
```

---

## License

This project is for demonstration and portfolio purposes.
