# Aurexion Enterprise Frontend

Welcome to the **Aurexion Enterprise Frontend**, a high-performance, modular, and visually striking React web application built with **Vite**, **TypeScript**, and **Tailwind CSS**. It follows the **Midnight Signal** cinematic visual design system and provides seamless integration with the Aurexion Django REST API backend.

---

## 🚀 Technology Stack

- **Core Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vite.dev/)
- **Routing**: [wouter 3](https://github.com/molecula-db/wouter) (Lightweight, high-performance router)
- **Data Caching & Fetching**: [TanStack Query v5](https://tanstack.com/query/latest) (React Query) & [Axios](https://axios-http.com/)
- **State Management**: [Zustand 5](https://github.com/pmndrs/zustand)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS following the *Midnight Signal* aesthetic
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) (Validation)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📂 Project Architecture

The codebase utilizes a modular, feature-based directory structure designed for scalability and maintainability:

```text
frontend/
├── public/                 # Static assets (images, logos, icons)
├── src/
│   ├── api/                # Core API clients, Axios configurations, interceptors
│   ├── app/                # Application entry points, providers (QueryProvider, ThemeProvider)
│   ├── components/         # Reusable global components (ui, forms, charts, tables)
│   ├── data/               # Static mock data and configuration values
│   ├── features/           # Self-contained business modules (Auth, Admin, BDM, CMS, Portal, Public)
│   │   ├── <module>/
│   │   │   ├── components/ # Module-specific sub-components
│   │   │   ├── pages/      # Module pages
│   │   │   └── hooks/      # Module-specific React hooks
│   ├── layouts/            # Shell layouts wrapping pages (PublicLayout, AuthLayout, BDM, Portal, etc.)
│   ├── queries/            # Shared TanStack query keys, mutations, and caching configurations
│   ├── routes/             # Route configurations, protection middleware, and routing tables
│   ├── store/              # Global Zustand state stores (authentication, UI states)
│   ├── styles/             # Global styling stylesheets (typography, variables, variables-theme)
│   ├── App.tsx             # Main router dispatcher
│   └── main.tsx            # Application bootstrapping
├── package.json
└── tsconfig.json
```

---

## 🔑 Authentication Flow & RBAC

The application implements a cookie-based JWT flow coupled with an HTTP header fallback mechanism:
1. **Credentials Login**: Dispatched via `POST /api/v1/auth/login/` returning an access token and setting HTTP-Only cookies.
2. **State Sync**: The authenticated profile is stored globally in the Zustand state manager (`useAuthStore`).
3. **RBAC Guard**: Routes are wrapped in the `<RoleRoute>` wrapper checking role permission claims before rendering layout shells.
4. **Token Refresh**: Token renewals are performed transparently via the Axios response interceptors.

---

## 🎨 Midnight Signal Design System

Styling is driven by custom theme tokens located in `src/styles/` prioritizing:
- **Cinematic Dark Themes**: Deep midnight backgrounds coupled with glowing cyan indicators (`#63f5e8`).
- **Restrained Cinematic Motion**: Custom Framer Motion micro-animations on interactive components.
- **Glassmorphism**: Backdrop blur overlays with light, semitransparent borders (`border-white/10`).

---

## 🛠️ Development & Operations

To set up and run the frontend application locally, make sure you have [Node.js](https://nodejs.org/) installed.

### 1. Install Dependencies
Using npm (or pnpm):
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.development` file in the root of the frontend folder:
```env
VITE_API_URL=http://localhost:8000/api/v1/
```

### 3. Start Local Development Server
Launch Vite development server:
```bash
npm run dev
```
The application will serve locally on `http://localhost:3000/`.

### 4. Build for Production
Create the optimized production build bundle:
```bash
npm run build
```

### 5. Type Checking
Perform strict TypeScript validations without generating output files:
```bash
npm run check
```
## 6 Cache Performance

Cache performance was tested on both **localhost** and the **Vercel production environment** using repeated API requests.

* **Localhost:** ~13 ms initial response and ~5 ms cached response.
* **Vercel:** ~876 ms initial response, with production latency affected by network and backend hosting.
* **Cache Hit Rate:** ~66.7% across tested cache-enabled APIs.

The results confirm that frontend caching significantly reduces repeated API response time, especially in the local environment.