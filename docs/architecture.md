# Architecture

## Overview

InterviewIQ AI is organized as a full-stack application with a Next.js frontend and a FastAPI backend.

## Frontend

- App Router pages live under `frontend/src/app`
- Shared UI components live under `frontend/src/components`
- Service and state helpers live under `frontend/src/services`, `frontend/src/hooks`, and `frontend/src/store`

## Backend

- API entrypoint: `backend/app/main.py`
- Route handlers: `backend/app/routes`
- Business logic: `backend/app/services`
- Data models and schemas: `backend/app/models` and `backend/app/schemas`
- Configuration and utilities: `backend/app/config` and `backend/app/utils`

## Data Flow

1. The frontend collects user input and uploads files.
2. The backend processes auth, resume parsing, interview analysis, and report generation.
3. Results are returned to the frontend for display in dashboard and report views.

## Notes

This document can be expanded with diagrams, API boundaries, and deployment topology once implementation details are finalized.
