# College Placement Management System

A full-stack MERN application for managing college placement processes, including student applications, interview scheduling with video support, company coordination, and placement drive management.

## Features

- **Student & Application Management**: Submit applications with resume, cover letter, track status (submitted → reviewed → shortlisted → interview → offer)
- **Interview Scheduling**: Schedule in-person, virtual, or phone interviews. Virtual interviews use **Jitsi Meet** (free) or **Daily.co** (with API key)
- **Company Coordination**: Post jobs, review applications, shortlist candidates, schedule interviews, provide feedback
- **Placement Drives**: Admin can create and manage placement drives with eligibility criteria
- **Recruitment Tracking**: Dashboards for students, companies, and admins with metrics
- **Reports & Analytics**: Charts for applications over time, placements by department, drive performance
- **Academic Records Integration**: API endpoint for syncing student academic records

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, React Router, Chart.js, React Hot Toast
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Video**: Jitsi Meet (default) or Daily.co API

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. Clone and install dependencies:

```bash
npm run install:all
```

Or manually:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

2. Configure backend:

- Copy `backend/.env.example` to `backend/.env`
- Set `MONGODB_URI` (e.g. `mongodb://localhost:27017/college_placement`)
- Set `JWT_SECRET` for production

3. Start development:

```bash
npm run dev
```

This runs the backend on `http://localhost:5000` and frontend on `http://localhost:3000`.

### Video Interview Setup

- **Jitsi Meet** (default): No setup. Virtual interviews create Jitsi rooms automatically.
- **Daily.co**: Add `DAILY_API_KEY` to `.env` for Daily.co rooms. Get a free key at [daily.co](https://dashboard.daily.co/).

### Admin Setup

Create the first admin user via API:

```bash
curl -X POST http://localhost:5000/api/auth/admin/setup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@college.edu","password":"yourpassword"}'
```

## API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register/student` | Student registration |
| `POST /api/auth/register/company` | Company registration |
| `POST /api/auth/login` | Login |
| `GET /api/jobs` | List active jobs |
| `POST /api/applications` | Submit application |
| `GET /api/applications/my` | My applications |
| `POST /api/interviews` | Schedule interview |
| `GET /api/interviews/student` | Student interviews |
| `GET /api/placement-drives` | List placement drives |
| `GET /api/reports/dashboard` | Admin dashboard stats |

## Project Structure

```
├── backend/
│   ├── config/       # DB, upload
│   ├── middleware/   # auth, error handling
│   ├── models/       # User, Student, Company, Job, Application, Interview, PlacementDrive
│   ├── routes/       # API routes
│   ├── services/     # video (Daily/Jitsi), notifications
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/  # AuthContext
│   │   ├── pages/    # student, company, admin
│   │   └── services/ # api
│   └── ...
└── README.md
```

## License

MIT
