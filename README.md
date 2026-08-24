# 🌌 Aurexion Technologies — Enterprise B2B Digital Platform

A high-performance, modular enterprise web platform designed for enterprise digital transformation, automated lead management, sales executive scoping, client portal operations, and business development management (BDM).

---

## 🏗️ Repository Architecture

The codebase is organized as an enterprise monorepo with strict isolation between the frontend user interface and backend micro-services:

```
Aurexion_technologies/
├── backend/                  # Django REST Framework Backend & Pytest Suite
│   ├── src/                  # Core application modules & API controllers
│   │   ├── apps/
│   │   │   ├── authentication/  # JWT auth, user profiles, RBAC permissions
│   │   │   ├── bdm/             # BDM dashboard, workload balancing, RFP desk
│   │   │   ├── crm/             # 7-stage Lead state machine, follow-ups, Won onboarding
│   │   │   ├── portal/          # Client portal, milestones, ticket support desk
│   │   │   ├── cms/             # Services, industry solutions, blog & case studies
│   │   │   └── recruitment/     # ATS candidate applicant tracking system
│   │   └── config/              # Django settings, URLs, middleware, ASGI/WSGI
│   ├── tests/                # Automated pytest suite (unit, API, security, perf)
│   ├── manage.py             # Django management CLI
│   ├── requirements.txt      # Python dependencies
│   ├── pytest.ini            # Pytest configuration
│   ├── conftest.py           # Pytest Django fixtures
│   ├── Dockerfile            # Production Gunicorn backend container
│   ├── .env.example          # Backend environment variable template
│   └── db.sqlite3            # SQLite database (Development / Staging)
├── frontend/                 # React 18 + TypeScript + Vite Frontend
│   ├── src/                  # UI components, features, pages, hooks, services
│   │   ├── app/              # Navigation config, app providers
│   │   ├── components/       # Reusable UI component library (Cards, Buttons, Tables)
│   │   ├── features/         # Modular feature apps (admin, bdm, crm, portal, public)
│   │   ├── queries/          # TanStack React Query state managers
│   │   └── routes/           # Role-based route guards
│   ├── package.json          # Node dependencies
│   ├── vite.config.ts        # Vite bundler configuration
│   └── tsconfig.json         # TypeScript configuration
├── docs/                     # Module Documentation Suite
│   ├── BDM.md                # BDM Workload & RFP Desk Guide
│   ├── CRM.md                # CRM 7-Stage State Machine Guide
│   └── README.md             # Platform Documentation Index
├── docker-compose.yml        # Multi-container orchestrator
├── vercel.json               # Vercel deployment configuration
├── .gitignore                # Git ignore rules
└── LICENSE                   # Open-source license
```

---

## ✨ Key Platform Modules

### 1. 💼 **BDM Desk (Business Development Management)**
- **Lead Triage & Workload Balancing**: Real-time workload distribution among active Sales Executives.
- **RFP Desk**: Interactive RFP acceptance/decline engine with automated client notification emails.
- **Client Onboarding & Credential Dispatch**: 2-stage Won deal client account creation and instant credential emailing.

### 2. 📊 **CRM (Customer Relationship Management)**
- **7-Stage Lead State Machine**: `NEW` &rarr; `UNDER_REVIEW` &rarr; `CONTACTED` &rarr; `QUALIFIED` &rarr; `PROPOSAL_SUBMITTED` &rarr; `NEGOTIATION` &rarr; `WON` / `LOST`.
- **Server-Side Pagination**: Sub-25ms paginated queries (`10 items/page`) backed by B-Tree database indexing on `(assigned_to, status)`, `(source, status)`, and `user_role`.

### 3. 🌐 **Client Portal & Support Desk**
- **Project Telemetry & Milestones**: Live milestone tracking, sprint deliverables, and document vault.
- **Support Ticket Engine**: Real-time support ticket creation, executive assignment, and audit logging.

### 4. 📰 **CMS (Content Management System)**
- Services, industry solutions, case studies with confidential client name masking, and knowledge center engine.

### 5. 👥 **Recruitment & ATS**
- Job vacancy postings, candidate applications, candidate stage pipeline, and resume attachment handling.

---

## ⚡ Performance Benchmark

- **Query Latency**: Reduced `/api/v1/leads/` response times from **4,380ms &rarr; 3.01ms** (1,455x faster) using compound B-Tree database indexing and Redis/in-memory query caching.
- **API Call Deduplication**: In-flight HTTP promise deduplication prevents duplicate concurrent network requests.

---

## 🛠️ Local Development Setup

### 1. **Backend Setup (Python / Django)**
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start Django development server
python manage.py runserver 0.0.0.0:8000
```

### 2. **Frontend Setup (React / TypeScript / Vite)**
```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

### 3. **Docker Compose Setup (Full-Stack)**
```bash
docker-compose up --build
```

---

## 🧪 Testing & Verification

```bash
# Run backend pytest suite
cd backend
pytest

# Run Django system health check
cd backend
python manage.py check

# Run frontend TypeScript compiler check
cd frontend
npx tsc --noEmit
```

---

## 📚 Platform Documentation

- 📘 [CRM Module Documentation](file:///d:/All%20HTML/VPD/Aurexion/Aurexion_tech_extracted/Aurexion_technologies/docs/CRM.md)
- 📗 [BDM Module Documentation](file:///d:/All%20HTML/VPD/Aurexion/Aurexion_tech_extracted/Aurexion_technologies/docs/BDM.md)
- 📙 [Documentation Index](file:///d:/All%20HTML/VPD/Aurexion/Aurexion_tech_extracted/Aurexion_technologies/docs/README.md)