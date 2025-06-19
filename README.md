# Aureus

Production-ready backend for a consumer fintech-style mobile app with NestJS, PostgreSQL, RabbitMQ, and Redis.

## Architecture

- **Main Backend Service**: NestJS backend with Firebase authentication, user profiles, rewards, KYC, gold trading, goals/SIP, withdrawals, and double-entry ledger
- **SMS Processor Microservice**: High-volume SMS ingestion, parsing, categorization, and event publishing

## Tech Stack

- **Backend Framework**: NestJS with TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **Message Queue**: RabbitMQ
- **Cache**: Redis
- **Authentication**: Firebase JWT
- **API Docs**: Swagger/OpenAPI
- **Containerization**: Docker

## Prerequisites

- Node.js 20+
- Docker and Docker Compose
- Firebase project credentials

## Setup

1. Clone the repository

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your Firebase credentials and other configuration

4. Start services with Docker Compose:
```bash
docker-compose up -d
```

5. Run database migrations:
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma generate

cd ../sms-processor
npm install
npx prisma migrate dev
npx prisma generate
```

6. Start the services:
```bash
# Backend
cd backend
npm run start:dev

# SMS Processor (in another terminal)
cd sms-processor
npm run start:dev
```

## API Documentation

Once the backend is running, access Swagger documentation at:
- http://localhost:3000/api

## Services

### Main Backend (Port 3000)
- User management
- KYC flow
- Gold trading
- Goals and SIP management
- Withdrawals
- Rewards system
- Double-entry ledger

### SMS Processor (Port 3001)
- SMS ingestion endpoint: `POST /sms/:userId`
- Batch SMS endpoint: `POST /sms/:userId/batch`
- SMS parsing and categorization
- Event publishing to RabbitMQ

## Database

Both services use the same PostgreSQL database. The schema is managed through Prisma migrations.

## Performance Targets

- P95 API response time < 300ms
- Handle 1k requests/min on main backend
- Process 10k SMS/min on SMS microservice
- Support 1-2M ledger entries
- Zero duplicate SMS entries

## Development

### Running Tests
```bash
cd backend
npm test

cd ../sms-processor
npm test
```

### Database Migrations
```bash
cd backend
npx prisma migrate dev

cd ../sms-processor
npx prisma migrate dev
```

## Production Deployment

1. Build Docker images:
```bash
docker-compose build
```

2. Set production environment variables

3. Run migrations:
```bash
docker-compose run backend npx prisma migrate deploy
docker-compose run sms-processor npx prisma migrate deploy
```

4. Start services:
```bash
docker-compose up -d
```

## License

Private

