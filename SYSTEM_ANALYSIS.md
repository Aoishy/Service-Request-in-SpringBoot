# SYSTEM ANALYSIS: Real-Time Service Request Management System

## 1. Problem Statement

Service organizations often handle operational requests in fragmented workflows, where updates are delayed and visibility is limited. The result is slow coordination, poor accountability, and weak operational oversight.

The current solution centralizes incoming service requests in a single platform where:

- operators can submit work immediately,
- supervisors can monitor status changes in real time,
- background processing can continue asynchronously without blocking the API layer,
- request history and lifecycle checkpoints remain persisted for review.

This reduces manual tracking effort and improves transparency across the service pipeline.

---

## 2. Business Objectives

The implemented system supports the following operational goals:

1. Immediate intake of service requests without delaying the user interface.
2. Real-time visibility into status transitions and progress milestones.
3. Controlled background processing through a bounded worker pool.
4. Reliable persistence in PostgreSQL with request and log traceability.
5. Responsive dashboards for operator and supervisor roles.

---

## 3. Users and Actors

| Role | Responsibility | Implementation Status |
| --- | --- | --- |
| Operator | Submits new requests, monitors their own submissions, and views progress and logs. | Implemented |
| Supervisor | Monitors all requests, filters by status/priority, inspects progress, and cancels work when needed. | Implemented |

> The current scope does not include full authentication or user management. Role selection is client-side and intended for demo and workflow separation.

---

## 4. Assumptions

1. Requests represent asynchronous service tasks with metadata such as title, description, priority, and submitter name.
2. A request moves through a defined lifecycle: pending → processing → completed/failed/cancelled.
3. Requests may be cancelled while pending or processing.
4. The main API thread should remain responsive while background work is handled by worker threads.
5. Data is stored in PostgreSQL and managed via JPA entities and repositories.

---

## 5. Scope

### In Scope
- REST APIs for creation, listing, retrieval, cancellation, and logging.
- PostgreSQL-backed persistence with JPA entities.
- Real-time updates using STOMP over WebSockets.
- Background processing with Java thread pool scheduling.
- Role-specific frontend pages for operator and supervisor workflows.
- Audit logging for each progress checkpoint.

### Out of Scope
- Full JWT/OAuth authentication.
- Multi-node distributed queueing.
- Advanced RBAC policies.
- External notification integration such as SMS or email.

---

## 6. Functional Requirements

| ID | Requirement | Description | Status |
| --- | --- | --- | --- |
| FR-01 | Create service request | Operators can submit a request with title, description, priority, and submittedBy. | Implemented |
| FR-02 | Non-blocking request intake | Request creation returns immediately while processing continues in the background. | Implemented |
| FR-03 | List and paginate requests | System retrieves paginated request data with sorting and filters. | Implemented |
| FR-04 | Search and filtering | Requests can be filtered by status, priority, submitter, and keyword search. | Implemented |
| FR-05 | View details | Request metadata and lifecycle information are available for inspection. | Implemented |
| FR-06 | Live status updates | Status changes are pushed through WebSocket topics. | Implemented |
| FR-07 | Progress tracking | Progress percentages and stage names are updated during processing. | Implemented |
| FR-08 | Request cancellation | Requests in pending or processing state can be cancelled. | Implemented |
| FR-09 | Audit trail | Each major stage creates a progress log entry. | Implemented |
| FR-10 | Input validation | Request bodies and query parameters are validated before processing. | Implemented |
| FR-11 | Failure handling | Exceptions are mapped to failed status and error messages. | Implemented |

---

## 7. Non-Functional Requirements

### 1. Responsiveness
The API layer must remain responsive while long-running work is executed asynchronously in worker threads.

### 2. Data Integrity
PostgreSQL constraints, JPA validation, and transactional updates are used to maintain consistent request state.

### 3. Observability
Progress logs and real-time messages support operational monitoring and debugging.

### 4. Reliability
Worker failures are isolated and converted into request failure states without collapsing the service.

### 5. Usability
Live progress indicators and role-based views give operators and supervisors a clean operational experience.

---

## 8. Design Considerations

The current design intentionally favors a single service node with a bounded Java worker pool. This satisfies the project scope while keeping the architecture easier to reason about, test, and maintain. Future scaling can extend this toward distributed messaging queues or multi-instance deployment if needed.
