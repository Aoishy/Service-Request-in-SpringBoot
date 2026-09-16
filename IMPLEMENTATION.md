# IMPLEMENTATION: Real-Time Service Request Management System

## 1. Implementation Overview

This document describes how the Real-Time Service Request Management System was implemented in code. The application provides a complete solution for asynchronously processing customer service requests using Node.js Worker Threads while streaming live stage and progress updates to connected operators and supervisors via Socket.IO.

---

## 2. Technology Stack & Dependencies

### Backend Dependencies (`server/package.json`)
- **Node.js** (v18+ LTS runtime)
- **Express** (`^4.19.2`): HTTP API routing and middleware framework
- **Mongoose** (`^8.5.1`): Object Document Mapper for MongoDB
- **Socket.IO** (`^4.7.5`): WebSocket server for real-time bidirectional communication
- **Zod** (`^3.23.8`): Schema definition and input validation
- **express-rate-limit** (`^7.4.0`): Rate limiting middleware
- **cors** (`^2.8.5`): Cross-Origin Resource Sharing middleware
- **dotenv** (`^16.4.5`): Environment variable loader
- **TypeScript** (`^5.5.3`): Static typing and compilation
- **tsx** (`^4.16.2`): TypeScript execution engine for development
- **Vitest** (`^2.0.3`): Integration test runner
- **supertest** (`^7.0.0`): HTTP endpoint testing assertion library
- **mongodb-memory-server** (`^10.0.0`): In-memory MongoDB instance for isolated unit/integration tests

### Frontend Dependencies (`client/package.json`)
- **React** (`^19.2.8`): Component-based UI library
- **React DOM** (`^19.2.8`): DOM bindings for React
- **Vite** (`^8.2.2`): Build tool and dev server
- **@tanstack/react-query** (`^5.51.1`): Server state caching and synchronization
- **socket.io-client** (`^4.7.5`): WebSocket client
- **zustand** (`^4.5.4`): Lightweight global state management for roles
- **axios** (`^1.7.2`): Promise-based HTTP client
- **tailwindcss** (`^3.4.6`): Utility-first CSS styling
- **lucide-react** (`^0.408.0`): Icon library
- **tailwind-merge** (`^2.4.0`) & **clsx** (`^2.1.1`): Conditional CSS class utility

---

## 3. Frontend Implementation

The frontend is implemented as a modular Single-Page Application inside `client/src/`.

### 1. Application Shell & State Management
- **`Layout.tsx`**: Provides the top navigation bar with brand identity, live WebSocket connection indicator (`LiveIndicator.tsx`), and role switcher.
- **`store/roleStore.ts`**: Zustand store managing current role state (`operator` vs. `supervisor`) and the active operator identity name (`Alex Mercer`).

### 2. User Pages
- **`pages/OperatorPage.tsx`**:
  - Contains the `RequestForm` intake component.
  - Features quick business presets (*Customer Account Data Migration*, *Monthly Billing Ledger Reconciliation*, *Enterprise SLA Audit*).
  - Displays submitted service requests with live progress bars and a filter toggle for "My Submissions".
- **`pages/SupervisorPage.tsx`**:
  - Live metric KPI cards: Active Processing, Queued Pending, Completed Tasks, and Failed/Alerts.
  - `FilterBar`: Keyword search, status filter dropdown, priority filter dropdown, submitter name filter, and reset button.
  - **View Toggle**: Switches seamlessly between **Enterprise Data Table View** (dense tabular view with live stage chips, progress bar, submitter, and actions) and **Card Grid View**.
  - Pagination controls for page traversal.

### 3. Reusable UI Components
- **`components/ProgressBar.tsx`**: Renders dynamic progress percentages (0–100%) with status-aware colors (Blue for Processing, Emerald for Completed, Rose for Failed, Amber for Queued).
- **`components/StatusBadge.tsx`** & **`PriorityBadge.tsx`**: Styled status and priority indicator chips.
- **`components/RequestDetailModal.tsx`**: Modal displaying request metadata, live stage status, failure reasons, cancel action button, and an audit trail list of all logged checkpoints.

### 4. API & WebSocket Integration
- **`api/requests.ts`**: Implements React Query hooks (`useRequestsQuery`, `useRequestDetailQuery`, `useProgressLogsQuery`, `useCreateRequestMutation`, `useCancelRequestMutation`).
- **`hooks/useSocket.ts`**: Centralized Socket.IO subscriber hook. Upon receiving events (`request:status-updated`, `request:progress-updated`, `request:completed`, `request:failed`, `request:cancelled`), it directly patches the React Query cache via `queryClient.setQueriesData()` and invalidates relevant audit log queries.

---

## 4. Backend Implementation

The backend follows a layered architectural pattern inside `server/src/`.

### 1. Server Bootstrap (`index.ts`)
1. Connects to MongoDB via Mongoose.
2. Initializes the Express HTTP server on `PORT` (default: 5000).
3. Attaches Socket.IO to the HTTP server via `initSocketServer()`.
4. Initializes the `WorkerPool` singleton with `MAX_WORKERS` (default: 5).

### 2. Layered Modules
- **`routes/serviceRequest.routes.ts`**: Defines REST endpoints, applies rate limiting to POST `/api/requests`, and binds Zod validation middleware.
- **`controllers/serviceRequest.controller.ts`**: Thin handlers that unwrap request parameters, invoke service methods, and return uniform JSON payloads (`{ success: true, data: { ... } }`).
- **`services/serviceRequest.service.ts`**: Contains business logic: creates database records, emits WebSocket `request:created` events, dispatches jobs to `WorkerPool`, handles cancellation state validation, and queries repositories.
- **`repositories/serviceRequest.repository.ts` & `progressLog.repository.ts`**: Encapsulates all Mongoose query operations, pagination math, sorting, and text search queries.
- **`middleware/validate.ts` & `validation/serviceRequest.schema.ts`**: Zod schema validators parsing `req.body`, `req.query`, and `req.params`.
- **`middleware/errorHandler.ts`**: Global error trap formatting uniform error payloads with HTTP status mapping.

---

## 5. Database Implementation

### 1. Mongoose Models
- **`models/ServiceRequest.ts`**:
  - Enforces schema types, min/max lengths, required fields, and enums (`low`, `medium`, `high`, `critical` for priority; `pending`, `processing`, `completed`, `failed`, `cancelled` for status).
  - Indexes: Single field indexes on `status`, `priority`, `submittedBy`, `createdAt`, compound index on `{ status: 1, priority: 1 }`, and text index on `{ title: 'text', description: 'text' }`.
- **`models/ProgressLog.ts`**:
  - Append-only schema storing `{ requestId, stage, message, progress, timestamp }`.
  - Indexes on `requestId` and `timestamp`.

### 2. Connection Management (`db/connection.ts`)
- Manages Mongoose connection lifecycle, handles reconnection events, and provides graceful shutdown handlers on `SIGINT`/`SIGTERM`.

---

## 6. Real-Time Implementation

Real-time synchronization is implemented via Socket.IO:

### Server Side (`socket/socketHandler.ts`)
- Configured with CORS matching the frontend development server.
- On connection, performs **Late-Join Hydration**: queries MongoDB for active `pending` and `processing` requests and emits `requests:initial-state` to the newly connected socket.

### Client Side (`hooks/useSocket.ts`)
- Subscribes to Socket.IO events:
  - `request:created`: Invalidates `REQUESTS_QUERY_KEY` to include new entries.
  - `request:status-updated`: Optimistically patches status and timestamps in React Query cache.
  - `request:progress-updated`: Updates progress bar and current stage in cache without full refetch.
  - `request:completed` / `request:failed` / `request:cancelled`: Updates status in cache and refreshes audit logs.

---

## 7. Concurrent Processing Implementation

Background execution is implemented in `server/src/workers/`:

### 1. `WorkerPool` Class (`workerPool.ts`)
- Maintains a pool of active workers (`activeWorkers: Map<string, ActiveWorker>`) and an in-memory FIFO queue (`queue: Job[]`).
- **`enqueue(job)`**: Adds job to queue; if `activeWorkers.size < maxWorkers`, immediately calls `startWorker()`.
- **`startWorker(job)`**:
  - Dynamically detects runtime environment (`.ts` with tsx loader in development vs. compiled `.js` in production).
  - Spawns a new Node.js `Worker` thread pointing to `requestProcessor.worker`.
  - Listens to worker IPC messages (`STARTED`, `PROGRESS`, `COMPLETED`, `FAILED`, `CANCELLED`).
  - Updates MongoDB and emits corresponding Socket.IO events on the main thread.
- **`cancel(requestId)`**:
  - If the job is queued, removes it from queue and marks it cancelled in DB.
  - If actively executing in a worker thread, sends `{ type: 'CANCEL' }` IPC message to the worker.

### 2. `requestProcessor.worker.ts`
- Executes in an isolated OS thread outside the main event loop.
- Simulates 6 distinct processing phases (*Validation, Resource Allocation, Analysis, Processing, Quality Check, Finalization*).
- **CPU Computation & Chunking**: Each stage runs a prime number sieve in 100ms chunks, yielding to the worker event loop via `setImmediate()` to check for incoming `CANCEL` signals.

---

## 8. Complete Request Lifecycle Walkthrough

```
1. Operator submits form in OperatorPage
   ↓
2. POST /api/requests arrives at Express
   ↓
3. Zod middleware validates request payload
   ↓
4. Service persists ServiceRequest record in MongoDB (status: 'pending')
   ↓
5. Server emits "request:created" via Socket.IO
   ↓
6. HTTP 201 response returns to client immediately (Non-blocking)
   ↓
7. Service enqueues request into WorkerPool
   ↓
8. WorkerPool spawns Worker Thread (status updated to 'processing')
   ↓
9. Worker executes Stage 1-6 CPU chunks, sending IPC messages to main thread
   ↓
10. Main thread writes ProgressLog entry to MongoDB and emits "request:progress-updated"
    ↓
11. Supervisor and Operator UIs update progress bar & logs in real time
    ↓
12. Worker completes final stage (100%), emits "COMPLETED"
    ↓
13. Main thread marks request 'completed' in MongoDB and emits "request:completed"
    ↓
14. Worker terminates; WorkerPool picks next queued request
```

---

## 9. Testing & Quality Assurance

API integration tests are implemented in `server/src/__tests__/serviceRequest.test.ts` using **Vitest**, **Supertest**, and **MongoMemoryServer**.

These tests isolate the API layer by mocking the WorkerPool and Socket.IO server. They do not replace
manual runtime verification of real Worker Thread execution, WebSocket delivery, or active-worker
cancellation.

### Test Suites Covered:
- **`GET /health`**: Verifies server health check response.
- **`POST /api/requests`**: Verifies request creation, default `pending` status, whitespace trimming, and validation errors (missing title, short description, invalid priority).
- **`GET /api/requests`**: Tests pagination defaults, limit boundaries, status filtering, priority filtering, case-insensitive submitter search, and validation errors.
- **`GET /api/requests/:id`**: Tests ID lookup, 404 for missing IDs, and 400 for invalid ObjectId formatting.
- **`POST /api/requests/:id/cancel`**: Tests cancelling pending requests, and verifies 422 Invalid State when attempting to cancel completed or failed requests.
- **`GET /api/requests/:id/progress`**: Tests progress log retrieval.
- **Unknown Routes**: Tests 404 handler for unregistered endpoints.

### Running Tests:
```bash
cd server
npm test
```

---

## 10. Engineering Practices

- **Strict TypeScript**: `tsconfig.json` enforces strict type checking across client and server.
- **Layered Decoupling**: Complete separation between transport (Express/Socket.IO), business logic (Services), and database queries (Repositories).
- **No Database Access in Worker Threads**: Prevents connection exhaustion and maintains single-source-of-truth writes on the main thread.
- **Defensive Error Handling**: Worker crashes and unhandled promise rejections are intercepted and mapped to clean client statuses without crashing the server.

---

## 11. Known Limitations & Constraints

1. **In-Memory Queue**: The request queue is held in server memory. If the server is killed while jobs are queued, unstarted jobs remain in `pending` state until manually handled.
2. **Single-Node Socket.IO**: WebSockets are not connected to a Redis adapter; horizontal scaling across multiple Node.js instances would require adding `@socket.io/redis-adapter`.
3. **Client-Side Role Toggle**: Role switching between Operator and Supervisor is managed in client state without password authentication or JWT verification.
