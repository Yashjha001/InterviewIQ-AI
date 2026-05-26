# Deployment Guide

## Prerequisites

- Node.js for the frontend
- Python 3.10+ for the backend
- Access to environment variables for API keys and secrets

## Frontend Deployment

1. Install dependencies in `frontend`.
2. Set production environment variables.
3. Run the build command.
4. Deploy the generated Next.js app to your hosting provider.

## Backend Deployment

1. Install Python dependencies from `backend/requirements.txt`.
2. Configure `.env` values for database access, JWT, and Gemini integration.
3. Start the FastAPI app with a production ASGI server.
4. Ensure file uploads and static storage are available in the target environment.

## Environment Variables

- `APP_NAME`
- `DEBUG`
- `DATABASE_URL`
- `GEMINI_API_KEY`
- `JWT_SECRET`

## Notes

This guide is a starter template and should be updated with the exact hosting platform, database, and runtime commands once those choices are finalized.
