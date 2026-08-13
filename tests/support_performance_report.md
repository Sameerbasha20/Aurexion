# Support Module Performance Report

- **Date:** 2026-08-13 15:12:55 UTC
- **Backend:** PostgreSQL (postgresql)
- **Target:** average response < 500 ms
- **Iterations:** 50 per endpoint
- **N+1 check:** {1: 2, 5: 2, 15: 2}

| Endpoint | Avg | Min | Max | P50 | P95 | P99 | DB time avg | Query avg | Result |
|---|---|---|---|---|---|---|---|---|---|
| POST /api/v1/tickets/ | 217.10 ms | 211.74 ms | 225.91 ms | 217.01 ms | 222.03 ms | 224.54 ms | 210.54 ms | 4.0 | **PASS** |
| GET /api/v1/tickets/ | 120.51 ms | 114.51 ms | 167.54 ms | 119.02 ms | 128.00 ms | 148.84 ms | 108.32 ms | 2.0 | **PASS** |
| GET /api/v1/tickets/{id}/ | 117.38 ms | 107.32 ms | 366.99 ms | 112.31 ms | 116.72 ms | 247.57 ms | 110.58 ms | 2.0 | **PASS** |
| PATCH /api/v1/tickets/{id}/ | 220.83 ms | 214.67 ms | 230.88 ms | 220.69 ms | 224.35 ms | 230.45 ms | 212.70 ms | 4.0 | **PASS** |

**Overall: PASS**
