export const APP_CONFIG = {
  name: "Aurexion Enterprise",
  version: "1.0.0",
  apiBaseUrl: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  sessionTimeoutMinutes: 60,
  defaultRedirectPath: {
    ADMIN: "/admin/dashboard",
    BDM: "/bdm/dashboard",
    CLIENT: "/portal/dashboard",
    PUBLIC: "/",
  },
};

export default APP_CONFIG;
