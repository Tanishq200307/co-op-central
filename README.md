# CoopCentral

CoopCentral is a MERN platform for co-op hiring across students, employers, and universities. This rebuild turns the original demo into a populated recruiting portal with seeded data, modern dashboards, and a UI that feels much closer to a real job marketplace.

## What is included

- React + Vite frontend with a tokenized design system, theme toggle, React Query data layer, and reusable UI components.
- Express + Mongoose backend with richer models for companies, student profiles, saved jobs, and notifications.
- Search, job detail, recommendations, saved jobs, application tracking, company pages, employer workflows, and university views.
- Deterministic seed data with 8 universities, 40 companies, 150 jobs, 60 students, and over 1,000 seeded applications.
- In-memory MongoDB fallback for demo mode. When `MONGO_URI` is blank, the backend starts with a seeded memory database automatically.

## Demo credentials

- Employer: `demo.employer@shopify.com / Demo123!`
- Student (BCIT): `demo.student@bcit.ca / Demo123!`
- Student (general): `demo.general@gmail.com / Demo123!`
- University admin (BCIT): `admin@bcit.ca / Demo123!`

## Screenshots

- `docs/screenshots/homepage.png` placeholder
- `docs/screenshots/jobs-search.png` placeholder
- `docs/screenshots/employer-dashboard.png` placeholder
- `docs/screenshots/student-dashboard.png` placeholder

## Stack

- Frontend: React 18, Vite, React Router, Tailwind CSS v3, React Query, Recharts, Sonner
- Backend: Node.js, Express, Mongoose, JWT auth, Multer
- Data and demo tooling: MongoDB Memory Server, Faker, Zod

## Project structure

```text
co-op-central-demo/
├── client/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       └── styles/
├── server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── uploads/
│   └── utils/
├── .env.example
└── README.md
```

## Setup

### 1. Install dependencies

From the project root:

```bash
npm install
npm run install-all
```

### 2. Create env files

Copy the examples into place:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Recommended values:

`server/.env`

```env
PORT=5001
JWT_SECRET=replace_this_with_a_long_secret_key
MONGO_URI=
CLIENT_URL=http://localhost:5173
```

`client/.env`

```env
VITE_API_URL=http://localhost:5001/api
```

When `MONGO_URI` is blank, the app uses an in-memory MongoDB instance and seeds the demo data automatically on boot.

### 3. Start the app

From the root:

```bash
npm run dev
```

Or run the services separately:

```bash
npm --prefix server run dev
npm --prefix client run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5001`

## Seed the demo data manually

```bash
npm --prefix server run seed
```

This clears and recreates the seeded demo dataset, so repeated runs do not duplicate records.

## Main flows to review

### Jobs

- `/jobs` for search, filters, facet counts, and pagination
- `/jobs/:id` for the full job detail and apply flow
- `/saved` and `/applications` for the student follow-up loop

### Companies

- `/companies` for the hiring directory
- `/companies/:slug` for company details and active jobs

### Role dashboards

- `/student` for recommendations, activity, and quick links
- `/profile` for student profile editing
- `/employer` for job management, applicants, company profile, and analytics
- `/employer/jobs/new` for the multi-step posting flow
- `/university` for the school-facing overview

## Notes

- The frontend production build completes successfully and stays under the requested gzip threshold.
- The backend auto-seeds the demo dataset when the connected database is below the expected baseline.
- The fastest way to verify the main experience is to log in as the BCIT demo student, apply to a Shopify job, then log in as the Shopify employer and confirm the new application appears.
