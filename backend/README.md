# Internship Management System - Backend Microservices

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         API Gateway (:3000)                       │
│              Entry point for all client requests                  │
└─────────────────────────────────────────────────────────────────┘
              │              │              │              │
              ▼              ▼              ▼              ▼
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│   Auth     │ │   Users    │ │Positions   │ │Applications│ │ Approvals  │ │   Logs     │ │Evaluations │ │Notifications│
│  (:3001)   │ │  (:3002)   │ │  (:3003)   │ │  (:3004)   │ │  (:3005)   │ │  (:3006)   │ │  (:3007)   │ │   (:3008)  │
└────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 3000 | HTTP entry point, routes to microservices |
| Auth | 3001 | Authentication, JWT, refresh tokens |
| Users | 3002 | User management, student profiles |
| Positions | 3003 | Internship position CRUD |
| Applications | 3004 | Student applications |
| Approvals | 3005 | Multi-stage approval workflow |
| Logs | 3006 | Weekly internship journal |
| Evaluations | 3007 | Student evaluations |
| Notifications | 3008 | User notifications |

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Infrastructure

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- RabbitMQ (port 5672)

### 3. Start Services

Start all services:
```bash
npm run start:dev
```

Or start individual services:
```bash
npm run dev:gateway    # API Gateway
npm run dev:auth      # Auth Service
npm run dev:users     # Users Service
npm run dev:positions # Positions Service
# ... etc
```

### 4. Access API

- Gateway: http://localhost:3000
- Swagger Docs: http://localhost:3000/api/docs

## Project Structure

```
quan-ly-thuc-tap-1/
├── my-project/           # Frontend (React)
├── services/             # Microservices
│   ├── auth-service/     # Authentication
│   ├── users-service/    # User Management
│   ├── positions-service/# Positions CRUD
│   ├── applications-service/
│   ├── approvals-service/
│   ├── logs-service/
│   ├── evaluations-service/
│   └── notifications-service/
├── gateway/              # API Gateway
├── packages/
│   └── shared/          # Shared DTOs, interfaces
├── docker-compose.yml
└── .env
```

## API Endpoints

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `GET /auth/profile` - Get current user

### Users
- `GET /users` - Get all users (admin)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `GET /users/students/profile` - Get student profile
- `PUT /users/students/profile` - Update student profile

### Positions
- `GET /positions` - Get positions
- `GET /positions/:id` - Get position by ID
- `POST /positions` - Create position (company)
- `PUT /positions/:id` - Update position
- `DELETE /positions/:id` - Delete position

### Applications
- `GET /applications` - Get applications
- `GET /applications/:id` - Get application by ID
- `POST /applications` - Create application (student)
- `PUT /applications/:id/status` - Update status

### Approvals
- `GET /approvals` - Get approvals
- `POST /approvals` - Create approval
- `PUT /approvals/:id/review` - Review approval

### Logs
- `GET /logs` - Get log entries
- `POST /logs` - Create log entry
- `PUT /logs/:id` - Update log entry
- `PUT /logs/:id/review` - Review log entry

### Evaluations
- `GET /evaluations` - Get evaluations
- `POST /evaluations` - Create evaluation
- `PUT /evaluations/:id` - Update evaluation

### Notifications
- `GET /notifications` - Get notifications
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
USERS_SERVICE_PORT=3002
# ... etc

DATABASE_URL=postgresql://internship:internship123@localhost:5432/internship_management_db
JWT_SECRET=your-secret-key
```

## Development

### Build
```bash
npm run build
```

### Test
```bash
npm run test
```

### Lint
```bash
npm run lint
```

## Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma)
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Communication**: TCP (microservices), HTTP (gateway)

## User Roles

- `student` - Student users
- `lecturer` - University lecturers
- `company` - Company representatives
- `admin` - System administrators
