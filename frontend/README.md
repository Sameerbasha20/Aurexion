# Aurexion Enterprise Frontend

This project represents the structured TypeScript frontend for Aurexion's enterprise platforms.

## Architecture

The project is structured according to the modular feature-based architecture pattern:
- **src/app/**: App entry points, configuration, providers, and global routing.
- **src/api/**: API layer with Axios client, response/request interceptors, error handlers, and endpoints.
- **src/components/**: Common UI elements organized by category (ui, forms, charts, tables, etc.).
- **src/features/**: Self-contained module features containing pages, local components, services, and hooks.
- **src/layouts/**: Shell layouts (Public, Auth, Admin, Bdm, Client).
- **src/routes/**: Sub-routes mapping for distinct sections of the app (Public, Admin, Bdm, etc.) and protective route components.
- **src/styles/**: Stylings files following the *Midnight Signal* aesthetic.

## Development

```bash
# Install dependencies
pnpm install

# Run the development server
pnpm dev

# Check TypeScript compilations
pnpm check

# Build for production
pnpm build
```
