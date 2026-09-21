# OpsDesk Client

This is the frontend for the OpsDesk service request management system. It is built with React, TypeScript, and Vite and connects to the Spring Boot backend for request management and real-time WebSocket updates.

## Purpose

The client supports two operational roles:

- Operator: create and track submitted requests
- Supervisor: review pending, active, and completed requests; inspect progress logs; cancel work when needed

## Local Setup

```bash
cd client
npm install
npm run dev
```

The app typically runs on:

- http://localhost:5173

## Backend Connection

The frontend expects the backend API on:

- http://localhost:8080

The current system is wired to the Spring Boot REST API and the STOMP WebSocket endpoint at:

- ws://localhost:8080/ws

## Core UI Responsibilities

- Request creation form
- Filter and search controls
- Pagination and sorting
- Progress tracking and status badges
- Request detail modal with audit trail
- Real-time updates via live subscription events

## Notes

This frontend is designed to work alongside the Spring Boot + PostgreSQL backend in this workspace. It is not a standalone app and depends on the backend service being running for complete functionality.
