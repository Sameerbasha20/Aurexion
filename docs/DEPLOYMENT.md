# 🚀 Enterprise Deployment Guide — Aurexion Technologies

> **Document Status**: Production Deployment Architecture & Operations Guide  
> **Frontend Hosting**: **Vercel (Hobby / Free Tier)**  
> **Backend Hosting**: **Render (Free Web Service Tier)**  
> **Database Engine**: **Supabase Managed PostgreSQL / SQLite Fallback**  
> **Repository Monorepo**: `frontend/` & `backend/`

---

## 📋 Executive Summary

The Aurexion Technologies platform is deployed using a modern, serverless & container-ready monorepo topology.  
- **Frontend SPA**: Hosted on **Vercel Edge Network** (`frontend/` directory).
- **Backend REST API**: Hosted on **Render Web Services** (`backend/` directory).
- **Hosting Tier**: Both environments utilize **Free Tiers** (Vercel Hobby & Render Free Instance).

---

## 📐 Production Architecture Diagram

```mermaid
graph TD
    subgraph Client & Edge Network
        A1[Web Browser / Mobile Client] -->|HTTPS Requests| B1[Vercel Global Edge CDN]
        B1 -->|Serves Static React Assets| A1
    end

    subgraph Frontend Infrastructure - Vercel Free Tier
        B1 --> C1[Vercel Serverless Build Engine]
        C1 -->|Root Directory: frontend/| C2[Vite SPA Bundle dist/]
    end

    subgraph Backend Infrastructure - Render Free Tier
        A1 -->|REST API Calls / JSON| D1[Render Web Service Load Balancer]
        D1 -->|Free Service Engine 512MB RAM| D2[Gunicorn WSGI Application Server]
        D2 -->|Root Directory: backend/| D3[Django REST Framework]
    end

    subgraph Data & Storage Services
        D3 -->|Pooled Connections| E1[(Supabase Managed PostgreSQL)]
        D3 -->|Presigned S3 API| E2[(S3 / MinIO Object Storage)]
    end
```

---

## 🎨 1. Frontend Deployment on Vercel (Free Tier)

### Infrastructure Specifications
- **Hosting Platform**: Vercel (Hobby Free Tier)
- **Deployment Monorepo Setting**: `Root Directory: frontend`
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: 18.x / 20.x

### Configuration File (`frontend/vercel.json`)
The frontend uses [`frontend/vercel.json`](file:///d:/All%20HTML/VPD/Aurexion/Aurexion_tech_extracted/Aurexion_technologies/frontend/vercel.json) to handle SPA routing and security headers:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https: http: ws: wss:; media-src 'self' https: data: blob:;"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Required Frontend Environment Variables (Vercel Dashboard)
- `VITE_API_BASE_URL`: `https://aurexion-backend.onrender.com/api/v1`

---

## 🐍 2. Backend Deployment on Render (Free Tier)

### Infrastructure Specifications
- **Hosting Platform**: Render (Free Web Service Tier)
- **Instance Type**: 512 MB RAM / 0.1 CPU
- **Deployment Monorepo Setting**: `Root Directory: backend`
- **Environment**: Python 3.11+
- **Build Command**: `pip install -r requirements.txt && python manage.py migrate`
- **Start Command**: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`

### ⚡ Free Tier Characteristics & Behavior
> **Important Note on Render Free Tier**:
> 1. **Inactivity Sleep**: Render's free tier automatically spins down (sleeps) after **15 minutes of inactivity**.
> 2. **Cold Start Latency**: Upon receiving a new request after sleeping, Render takes **~30–50 seconds** to boot the container (Cold Start).
> 3. **Memory Bounding**: Free tier instances are capped at **512 MB RAM**. Gunicorn workers are configured (`--workers 2 --threads 2`) to ensure RAM utilization stays under limit.

### Required Backend Environment Variables (Render Dashboard)

| Variable Name | Value | Purpose |
|---|---|---|
| `DJANGO_SECRET_KEY` | `production-secret-key-3f22418...` | Cryptographic signing key |
| `DEBUG` | `0` | Disables debug mode in production |
| `ALLOWED_HOSTS` | `aurexion-backend.onrender.com,localhost,127.0.0.1` | Prevents HTTP Host header attacks |
| `CORS_ALLOWED_ORIGINS` | `https://aurexion-frontend.vercel.app` | Controls cross-origin API access |
| `DATABASE_URL` | `postgresql://postgres:...@supavisor...` | Database connection string |
| `PORT` | `10000` | Render assigned port |

---

## 🗄️ 3. Database Deployment (Supabase Managed PostgreSQL)

- **Engine**: Managed PostgreSQL 15+ hosted on Supabase (Free Tier).
- **Connection Pooler**: Reached via Supavisor pooler on port 6543 to maintain persistent connection bounds under low RAM limits.
- **Migration Strategy**: Migrations execute automatically during the Render build phase (`python manage.py migrate`).

---

## 🔄 4. Automated CI/CD & Deployment Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Developer
    participant Git as GitHub (origin/dev)
    participant Vercel as Vercel Deployment Pipeline
    participant Render as Render Deployment Pipeline

    Developer->>Git: git push origin dev
    Git-->>Vercel: Trigger Webhook (Root: frontend/)
    Git-->>Render: Trigger Webhook (Root: backend/)
    
    par Frontend Build
        Vercel->>Vercel: npm run build (Vite)
        Vercel->>Vercel: Deploy to Vercel Global Edge CDN
    and Backend Build
        Render->>Render: pip install -r requirements.txt
        Render->>Render: python manage.py migrate
        Render->>Render: Launch Gunicorn WSGI Server
    end
    
    Vercel-->>Developer: Live: https://aurexion-frontend.vercel.app
    Render-->>Developer: Live: https://aurexion-backend.onrender.com
```

---

## 🧪 5. Post-Deployment Verification Commands

```bash
# Verify backend Django health on Render
curl -I https://aurexion-backend.onrender.com/api/v1/users/

# Verify frontend Vite asset loading on Vercel
curl -I https://aurexion-frontend.vercel.app/
```
