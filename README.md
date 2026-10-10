# Help Desk Frontend

Modern, responsive web interface for the Help Desk & Ticket Management System built with React, Vite, and Tailwind CSS.

## Features
- **User Authentication**: Login and registration with JWT token management and role-based views.
- **Ticket Dashboard**: Overview cards with metrics (open tickets, resolved tickets, assigned workload).
- **Ticket Management**:
  - Create new tickets with category, priority, and description.
  - Interactive ticket detail view with discussion thread / comments.
  - Status updates (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`).
  - Search, filter, and paginate tickets.
- **Admin Tools**: User management and ticket assignment to support agents.

## Prerequisites
- Node.js 18+
- npm or yarn

## Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:8080/api` |

## Run Locally
```bash
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`.

## Build for Production
```bash
npm run build
```
The production bundle will be output to `dist/`.

## Docker
```bash
docker build -t helpdesk-frontend .
docker run -p 5173:80 helpdesk-frontend
```
