# SYSTEM ANALYSIS: Real-Time Service Request Management System

## 1. Problem Statement

A growing customer service organization currently manages incoming service requests through manual procedures (such as email exchanges, physical logs, or ad-hoc spreadsheets). This manual operating workflow introduces severe operational friction:

- **Visibility Deficit**: Supervisors and stakeholders lack immediate insight into processing bottlenecks, request statuses, or queue backlogs.
- **Communication Latency**: Status updates require manual follow-ups, resulting in stale reporting, delayed customer responses, and missed Service Level Agreements (SLAs).
- **Concurrent Execution Bottlenecks**: Without an automated dispatching and concurrency architecture, operations are processed sequentially or without controlled thread limits, risking server starvation or missed requests.
- **Interface Blocking**: Systems attempting long-running computations synchronously cause request timeouts and unresponsive user interfaces.

A centralized, web-based Service Request Management System is required to allow **Operators** to submit requests instantly without waiting for completion, while **Supervisors** monitor simultaneous execution, stage progressions, and audit trails in real time.

---

## 2. Business Objectives

The implemented system achieves the following core operational objectives:

1. **Immediate Ingestion & Non-Blocking Dispatch**: Operators receive instant API acknowledgment upon submission; heavy processing runs asynchronously in the background.
2. **Real-Time Fleet Transparency**: Connected supervisors observe live status transitions, percentage progress bars, and stage checkpoints with zero manual page refreshes.
3. **Bounded Concurrent Throughput**: System processes multiple intensive requests simultaneously using a regulated thread pool to prevent CPU exhaustion.
4. **Resilient Request Lifecycle Management**: Provides real-time cooperative cancellation, audit logging, failure isolation, and late-join state hydration.

---

## 3. Users / Actors

| Role | Responsibility in Implemented System | Implementation Status |
| :--- | :--- | :--- |
| **Operator** | Submits new service requests (title, description, priority, submitter name); filters personal submissions; inspects individual progress logs. | **Implemented** (Active workspace portal with role context) |
| **Supervisor** | Monitors real-time KPI metrics (Active, Queued, Completed, Failed); views fleet via table/grid; filters and searches requests; inspects audit checkpoints; triggers cancellations. | **Implemented** (Active management console with live synchronization) |

> **Note on Authentication**: User roles are managed client-side via a workspace role toggle (backed by Zustand state). Formal authentication mechanisms (JWT, OAuth2, RBAC token middleware) are **not implemented** in the current scope.

---

## 4. Assumptions

1. **Request Nature**: Service requests represent asynchronous operational tasks (e.g., data migration, audit generation, transcoding) containing a title, description, priority (`low`, `medium`, `high`, `critical`), and submitter identity.
2. **Multi-Stage Processing Model**: Background execution executes across 6 defined lifecycle phases (*Validation, Resource Allocation, Analysis, Processing, Quality Check, Finalization*), simulated via CPU-bound chunked computation.
3. **Cancellation Semantics**: Requests in `pending` (queued) or `processing` states can be cancelled. Completed, failed, or already cancelled requests cannot be cancelled.
4. **Thread Isolation**: The main Node.js event loop must only manage HTTP routing, database queries, and WebSocket broadcasting, offloading compute to separate Worker Threads.
5. **Single-Node Execution**: The current Socket.IO and WorkerPool instance operate on a single server node; distributed queuing (Redis/BullMQ) is assumed out of initial scope.

---

## 5. Scope

### In Scope
- RESTful API endpoints for creating, listing, searching, inspecting, and cancelling service requests.
- Multi-threaded background execution engine with a configurable concurrency limit (`MAX_WORKERS`).
- FIFO queue for requests exceeding worker capacity.
- Real-time bidirectional WebSocket communication via Socket.IO for instant state synchronization.
- Audit logging persisting every progress checkpoint to MongoDB.
- Single-Page Application (SPA) frontend with role-specific views (Operator vs. Supervisor).
- Table and Grid visualization modes with responsive sorting and filtering.
- Automated API integration tests with in-memory database isolation.

### Out of Scope
- User authentication, login credentials, and session management (JWT / OAuth2).
- Multi-node clustering and distributed message brokers (Redis Pub/Sub, RabbitMQ, Kafka).
- Role-based backend authorization middleware.
- Automated email or SMS external notification webhooks.

---

## 6. Functional Requirements

| ID | Functional Requirement | Description | Implementation Status |
| :--- | :--- | :--- | :--- |
| **FR-01** | **Create Service Request** | Operators can submit requests with title, description, priority, and submitter name. | **Implemented** |
| **FR-02** | **Non-Blocking Ingestion** | Submissions return immediate HTTP 201 response while background worker processes the job. | **Implemented** |
| **FR-03** | **List & Paginate Requests** | Users can fetch paginated request listings with configurable sorting (`createdAt`, `priority`, etc.). | **Implemented** |
| **FR-04** | **Filter & Search** | Supports filtering by status, priority, submitter, and full-text keyword search across title/description. | **Implemented** |
| **FR-05** | **Inspect Request Details** | Users can view full metadata, execution timestamps, error details, and status badges. | **Implemented** |
| **FR-06** | **Live Status Updates** | Status changes (`pending` → `processing` → `completed`/`failed`/`cancelled`) push instantly via WebSockets. | **Implemented** |
| **FR-07** | **Live Progress Tracking** | Real-time percentage (0–100%) and current stage name updates broadcast as workers advance. | **Implemented** |
| **FR-08** | **Cancel Service Request** | Operators and supervisors can abort pending or active requests, interrupting worker execution. | **Implemented** |
| **FR-09** | **Progress Audit Trail** | Step-by-step progress checkpoints are persisted to database and retrievable via API/modal. | **Implemented** |
| **FR-10** | **Late-Join Hydration** | Connecting WebSocket clients receive current active/pending request snapshot on initial connect. | **Implemented** |
| **FR-11** | **Input Validation** | Strict schema validation with descriptive error feedback for invalid inputs. | **Implemented** |
| **FR-12** | **Error & Crash Recovery** | Worker thread errors or uncaught exceptions are caught and persisted as `failed` status without crashing server. | **Implemented** |

---

## 7. Non-Functional Requirements

### 1. Responsiveness & Concurrency
- The API gateway must never block on CPU-heavy tasks. The main event loop remains free to process incoming HTTP requests and WebSocket heartbeats with low latency (<50ms response for creation).

### 2. Scalability & Resource Control
- Bounded thread pool (`MAX_WORKERS=5` by default) ensures system stability under sudden ingestion spikes, queuing surplus requests in FIFO order.

### 3. Reliability & Fault Tolerance
- Individual worker thread crashes or unhandled task errors are isolated to the specific request, triggering a graceful `failed` transition while other workers continue uninterrupted.

### 4. Data Consistency
- MongoDB schemas enforce strict enum validations, string length boundaries, and indexing for optimized queries and full-text searches.

### 5. Usability & Ergonomics
- Zero-refresh live UI updates with clear visual indicators (progress bars, status chips, WebSocket connection telemetry, table/grid toggles).
