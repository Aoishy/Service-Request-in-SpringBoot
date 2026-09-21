# IMPLEMENTATION: Real-Time Service Request Management System

## 1. Implementation Overview

This project is implemented as a Spring Boot application that stores request records in PostgreSQL and runs asynchronous processing through a Java executor-based worker pool. The frontend remains a React + Vite application, while the backend exposes REST endpoints and STOMP-based real-time updates for live status monitoring.

---

## 2. Technology Stack

### Backend dependencies
The backend is defined in `service-request-server/pom.xml` and includes:

- Spring Boot 4.1.1
- Java 21
- Spring Data JPA
- Spring Web MVC
- Spring WebSocket
- Spring Security
- Spring Validation
- PostgreSQL JDBC driver
- Lombok

### Frontend dependencies
The client is a standard Vite + React + TypeScript app. It uses:

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios / fetch-oriented interaction patterns
- STOMP-compatible WebSocket integration from the browser client layer

---

## 3. Backend Implementation

### 1. Configuration
The server configuration is in `service-request-server/src/main/resources/application.properties`.

Key configuration values:
- datasource URL: `jdbc:postgresql://localhost:5432/service_request_db`
- datasource username: `postgres`
- datasource password: `postgres123`
- JPA DDL auto mode: `update`
- port: `8080`

### 2. WebSocket broker configuration
The STOMP setup is in `service-request-server/src/main/java/com/aoishy/servicerequest/config/WebSocketConfig.java`.

It configures:
- WebSocket endpoint: `/ws`
- broker destination prefix: `/topic`
- application destination prefix: `/app`

### 3. REST API layer
The main API is managed by `ServiceRequestController`.

Endpoints include:
- `POST /api/requests`
- `GET /api/requests`
- `GET /api/requests/{id}`
- `PATCH /api/requests/{id}/cancel`
- `GET /api/requests/{id}/progress`
- `DELETE /api/requests/{id}`

Responses are wrapped in a simple success/data payload:

```java
public record ApiResponse(boolean success, Object data) {}
```

### 4. Service logic
The main business logic is in `ServiceRequestService`.

This service performs:
- request creation and save to PostgreSQL,
- notification via `WebSocketEventService`,
- transaction-aware submission to the worker pool,
- request lookup and filtered listing,
- request cancellation handling,
- progress log retrieval.

### 5. Repository layer
Repository interfaces are defined under `service-request-server/src/main/java/com/aoishy/servicerequest/repository/`.

They encapsulate the persistence layer for:
- `ServiceRequest`
- `ProgressLog`

The repositories support filtering by status, priority, submitter, and other common query patterns.

---

## 4. Data Models

### ServiceRequest entity
The `ServiceRequest` entity is stored in the `service_requests` table.

Important fields:
- `id`
- `title`
- `description`
- `priority`
- `status`
- `progress`
- `currentStage`
- `submittedBy`
- `startedAt`
- `completedAt`
- `errorMessage`
- `createdAt`
- `updatedAt`

Validation rules include:
- title length 3–100
- description length 10–1000
- valid priority enum
- valid status enum
- progress range 0–100

### ProgressLog entity
The `ProgressLog` entity records each processing milestone and is linked to a parent service request through a many-to-one relationship.

Fields include:
- request
- stage
- message
- progress
- timestamp
- createdAt

---

## 5. Processing Implementation

The asynchronous execution logic is split across:

- `WorkerPool`
- `RequestProcessor`
- `WebSocketEventService`

### WorkerPool
The worker pool uses Java `ExecutorService` and tracks active futures by request ID. It supports submission and cancellation of request processing jobs.

### RequestProcessor
The processor moves a request through six lifecycle stages:

1. Validation
2. Resource Allocation
3. Analysis
4. Processing
5. Quality Check
6. Finalization

During each stage it:
- checks whether the thread has been interrupted,
- updates the request progress,
- saves a `ProgressLog`,
- emits a WebSocket update,
- marks the request as completed or failed/cancelled when appropriate.

The processing work simulates CPU-heavy work using a prime-sieve loop and checks interruption regularly.

---

## 6. Real-Time Update Flow

The real-time flow is implemented through `WebSocketEventService`.

It publishes these topics:
- `/topic/request-created`
- `/topic/request-status-updated`
- `/topic/request-progress-updated`
- `/topic/request-completed`
- `/topic/request-failed`
- `/topic/request-cancelled`

This allows the React frontend to react instantly without a page refresh.

---

## 7. Lifecycle Walkthrough

```text
1. Operator submits a request from the frontend.
2. REST controller validates the DTO.
3. ServiceRequestService saves the entity to PostgreSQL.
4. WebSocket notification emits request-created event.
5. Transaction synchronization triggers background worker submission.
6. WorkerPool schedules the task for async processing.
7. RequestProcessor updates status to PROCESSING.
8. Each stage writes progress and creates a ProgressLog.
9. Client receives progress update through STOMP.
10. Final stage marks request COMPLETED or FAILED/CANCELLED.
11. Final WebSocket event publishes the terminal state.
```

---

## 8. Current Quality Profile

The current implementation already covers the key architecture goals:

- persistence in PostgreSQL,
- asynchronous processing through a bounded worker pool,
- role-based UI separation in the client,
- live progress propagation over STOMP,
- request lifecycle tracking and logs,
- validation and failure handling.

---

## 9. Known Limitations

1. Authentication is not yet implemented as a full production RBAC system.
2. The worker pool is single-node and in-memory for active tasks.
3. The system targets a single application instance rather than a distributed queue architecture.
4. Production deployment hardening such as TLS, secrets management, and migration tooling is still future work.
