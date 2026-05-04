# Notification System API

A production-ready notification system built with NestJS that supports multi-channel delivery (Email, SMS, Push), message prioritization via RabbitMQ, and an automatic retry mechanism with dead letter handling.

---

## Architecture

```mermaid
flowchart TD
    A(Client) -->|POST /notifications| B(Auth Guard)
    B --> C(Notification Service)
    C -->|Emit Created.
     Payload = id + priority low, medium or high| D(Notification status => Pending)
    D --> E[RabbitMQ Broker]
    E --> F[Main Queue]
    F -->|consume| G[Notifications Worker]
    G --> H{Channel?}
    H -->|sms| J[SMS Service
    Twilio]
    H -->|email| K[Email Service
        AWS SES]
    H -->|push| L[Push Service
    Firebase FCM]
    J --> M
    K --> M
    L --> M
    J --> N
    K --> N
    L --> N
    M{Success} -->|Emit created| O[UpdateStatus to SENT] --> s[(Postgres
     Notification Status: Pending )]
    N{Fail}  -->|Emit retry| P[Recovery Queue] --> Q[Recovery Worker] --> R{Retrycount < 3 ?} 
    R -->|yes -> Emit Created, increment retryCount + 1| G
    R -->|no| S[UpdateStatus to Failed] --> s
    

```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS |
| Language | TypeScript |
| Database | PostgreSQL + TypeORM |
| Message Broker | RabbitMQ |
| Cache | Redis |
| Email | AWS SES |
| SMS | Twilio |
| Push | Firebase Cloud Messaging |
| Auth | JWT + Passport |
| Validation | Zod + class-validator |
| Containerization | Docker + Docker Compose |
| Testing | Jest |
| Documentation | Swagger |

---

## Features

- Multi-channel notification delivery — Email, SMS and Push in a single API
- Message prioritization — RabbitMQ processes high-priority notifications first via `x-max-priority`
- Automatic retry — up to 3 attempts with manual delay between retries
- Status tracking — notifications are persisted with `pending`, `sent` or `failed` status
- Dead letter handling — failed notifications after max retries are marked and preserved
- JWT authentication — all notification endpoints are protected
- Input validation — channel-aware validation (email format for email channel, phone number for SMS)
- Rate limiting — configurable throttling per IP
- Swagger documentation — available at `/docs`

---

## Prerequisites

- Node.js 20+
- Docker and Docker Compose
- AWS account with SES configured
- Twilio account
- Firebase project with FCM enabled

---

## Getting Started

**1. Clone the repository**

```bash
git clone https://github.com/your-username/notification-system
cd notification-system
```

**2. Configure environment variables**

```bash
cp .env.example .env
```

Fill in the required values in `.env` (see [Environment Variables](#environment-variables)).

**3. Start infrastructure**

```bash
docker compose up -d
```

This starts PostgreSQL, RabbitMQ and Redis. Wait for all healthchecks to pass before proceeding.

**4. Run database migrations**

```bash
npm run migration:run
```

**5. Start the application**

```bash
npm run start:dev
```

The API will be available at `http://localhost:3001/v1/api`.
Swagger docs at `http://localhost:3001/docs`.
RabbitMQ management at `http://localhost:15672`.

---

## Environment Variables

```dotenv
# App
NODE_ENV=development
PORT=3001
HOST=localhost
NAME=notification_system
CORS_ALLOWED_ORIGINS=http://localhost:3001

# Database
DATABASE_URL=postgresql://notification:notification123@localhost:5432/notification

# Cache
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBITMQ_QUEUE_URL=amqp://notification:notification123@localhost:5672
RABBITMQ_QUEUE_NAME=RABBITMQ_NOTIFICATION_MAIN_QUEUE
RABBITMQ_RECOVERY_QUEUE_NAME=RABBITMQ_NOTIFICATION_RECOVERY_QUEUE

# Auth
JWT_TOKEN_SECRET=your-secret
JWT_TOKEN_EXPIRESIN=3600
JWT_REFRESH_TOKKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRESIN=86400
JWT_TOKEN_AUDIENCE=localhost:3001
JWT_TOKEN_ISSUER=localhost:3001

# AWS SES
AWS_ACCESS_KEY=your-access-key
AWS_SECRET_KEY=your-secret-key
AWS_SES_REGION=us-east-1
AWS_SES_SOURCE_EMAIL=no-reply@yourdomain.com

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_SENDER_PHONE_NUMBER=+19806003628

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
```

---

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/v1/api/auth/register` | Create a new account | Public |
| POST | `/v1/api/auth/login` | Sign in and receive JWT | Public |
| POST | `/v1/api/auth/refresh-token` | Send the refresh token to validate | Public |
| GET | `/v1/api/auth/me` | Get current user | Required |

### Notifications

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/v1/api/notifications` | Send a notification | Required |
| GET | `/v1/api/notifications/:id` | Get notification status | Required |

### POST /notifications — Request body

```json
{
  "channel": "email",
  "recipient": "user@example.com",
  "message": "Your order has been confirmed.",
  "priority": "high",
  "data": {}
}
```

| Field | Type | Values |
|---|---|---|
| `channel` | enum | `email`, `sms`, `push` |
| `recipient` | string | Email, phone (+55...) or FCM device token |
| `message` | string | Notification content |
| `priority` | enum | `low`, `medium`, `high` |
| `data` | object | Optional metadata |

Recipient is validated based on channel — email format for `email`, E.164 phone number for `sms`, string for `push`.

### GET /notifications/:id — Response

```json
{
  "id": "uuid",
  "channel": "email",
  "recipient": "user@example.com",
  "message": "Your order has been confirmed.",
  "priority": "high",
  "status": "sent",
  "data": {},
  "created_at": "2026-05-03T20:00:00.000Z",
  "updated_at": "2026-05-03T20:00:01.000Z"
}
```

Status values: `pending`, `sent`, `failed`.

---

## Retry Mechanism

When a notification fails to deliver, the system applies the following flow:

```
Worker fails → emit notification.retry (retryCount + 1)
Recovery Worker receives → retryCount < 3 → re-emit to main queue
Recovery Worker receives → retryCount >= 3 → update status to FAILED
```

Each retry attempt is logged with the current `retryCount`.

**Trade-off:** The retry delay is implemented via `setTimeout` in the Recovery Worker rather than RabbitMQ's native TTL + Dead Letter Exchange. This approach was chosen because the NestJS RMQ transport does not allow filtering consumers by queue when using the same `@EventPattern` — both workers would compete for the same messages. A future improvement would be to migrate to `@golevelup/nestjs-rabbitmq` which supports queue-scoped handlers and native TTL.

---

## Available Scripts

```bash
# Development
npm run start:dev

# Build
npm run build

# Production
npm run start:prod

# Tests
npm run test
npm run test:cov

# Migrations
npm run migration:run
npm run migration:generate --name=migration-name
npm run migration:revert

# Linting
npm run lint
npm run format
```

---

## Project Structure

```
src/
  app/
    app.module.ts
  infra/
    config/
      env/          # Zod schema + per-domain config files
      typeorm-datasource.ts
    database/
      migrations/
    hashing/
  modules/
    auth/
    users/
    notifications/
      notifications.controller.ts
      notifications.service.ts
      notifications.worker.ts
      notifications-recovery.worker.ts
      dto/
      entities/
    email/
    sms/
    firebase/
  common/
    constants/
    decorators/
    events/
    interfaces/
    types/
```

---

## Running Tests

```bash
npm run test
```

Tests cover `NotificationsService` — create, findById and updateStatus — with mocked TypeORM repository and RabbitMQ client.

---

## License

MIT
