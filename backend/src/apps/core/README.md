# Aurexion Core Module

## Overview

The **Core Module** provides central platform infrastructure, background email dispatching, standardized JSON API renderers, pagination utilities, and health check endpoints for Aurexion Technologies.

In simple terms:

> **System Infrastructure → Non-blocking Email Dispatcher → Standardized API Envelopes & Health Monitoring**

---

## Key Responsibilities

1. **Async Email Service (`src/apps/core/services.py`)**:
   - Sends emails asynchronously in daemon threads (`threading.Thread`) to prevent blocking HTTP request-response cycles.
   - Handles auto-confirmation emails for public form submissions (`rfp_form`, `contact_form`, `estimator`, `website_form`).
   - Dispatches BDM client welcome credentials emails with portal login URLs.
   - Dispatches meeting schedule notifications to clients.

2. **Standardized API Response Renderer (`src/apps/core/renderers.py`)**:
   - `StandardJSONRenderer` wraps DRF responses in a consistent API structure:
     ```json
     {
       "success": true,
       "data": { ... },
       "errors": null
     }
     ```

3. **Global Pagination (`src/apps/core/pagination.py`)**:
   - Configures standard page size (`StandardResultsSetPagination`) and limits for database query results.

4. **Health Check Endpoint (`src/apps/core/views.py`)**:
   - Provides `/api/v1/health/` returning system operational status, timestamp, and database Connectivity.

---

## Core Services & Functions

- `send_email(...)`: Non-blocking async background email dispatcher.
- `send_form_submission_confirmation_email(...)`: Public form auto-acknowledgement email.
- `send_welcome_credentials_email(...)`: BDM client onboarding credentials email.
- `send_meeting_scheduled_email(...)`: Meeting confirmation email with video link.
