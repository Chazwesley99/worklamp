# Quick Start Guide

Get up and running with Worklamp in minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 20+ LTS
- Docker and Docker Compose
- Git

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd worklamp
```

### 2. Set Up Environment Variables

**On macOS/Linux:**

```bash
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh
```

**On Windows:**

```bash
scripts\setup-env.bat
```

Then edit `backend/.env` with your specific configuration.

### 3. Start Infrastructure Services

Start PostgreSQL and Redis using Docker Compose:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This will start:

- PostgreSQL (main database) on port 5432
- PostgreSQL (demo database) on port 5433
- Redis on port 6379

### 4. Install Dependencies

```bash
npm install
```

This will install dependencies for all workspaces (frontend, backend, and shared).

### 5. Set Up Database

Generate Prisma client and run migrations:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
cd ..
```

### 6. Start Development Servers

```bash
npm run dev
```

This will start both frontend and backend in development mode:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Verify Installation

### Check Backend Health

```bash
curl http://localhost:3001/health
```

You should see:

```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected",
  "redis": "connected"
}
```

### Check Frontend

Open your browser and navigate to http://localhost:3000

You should see the Worklamp home page.

## Default Credentials

After seeding, you can log in with:

- Email: admin@worklamp.com
- Password: admin123

**Important:** Change this password in production!

## Running Tests

```bash
# Run all tests
npm run test

# Run frontend tests only
npm run test --workspace=frontend

# Run backend tests only
npm run test --workspace=backend
```

## Common Commands

### Development

```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only
```

### Database

```bash
cd backend
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database with initial data
```

### Code Quality

```bash
npm run lint             # Lint all workspaces
npm run format           # Format all files with Prettier
```

### Docker

```bash
# Start infrastructure services
docker-compose -f docker-compose.dev.yml up -d

# Stop infrastructure services
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Rebuild and start
docker-compose -f docker-compose.dev.yml up -d --build
```

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

**PostgreSQL (5432) or Redis (6379):**
If you get a "port already in use" error, you may have PostgreSQL or Redis already running locally.

Stop your local services:

```bash
# PostgreSQL
# Windows
net stop postgresql-x64-15
# macOS
brew services stop postgresql@15
# Linux
sudo systemctl stop postgresql

# Redis
# Windows
net stop Redis
# macOS
brew services stop redis
# Linux
sudo systemctl stop redis

# Or stop old Docker containers
docker ps  # List running containers
docker stop <container-id>  # Stop specific container
```

**Frontend (3000):**

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

**Backend (3001):**

```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3001   # Windows
```

### Database Connection Issues

Ensure PostgreSQL is running:

```bash
docker-compose -f docker-compose.dev.yml ps
```

If not running, start it:

```bash
docker-compose -f docker-compose.dev.yml up -d postgres
```

### Redis Connection Issues

Ensure Redis is running:

```bash
docker-compose -f docker-compose.dev.yml ps
```

If not running, start it:

```bash
docker-compose -f docker-compose.dev.yml up -d redis
```

### Module Not Found Errors

Reinstall dependencies:

```bash
rm -rf node_modules frontend/node_modules backend/node_modules shared/node_modules
npm install
```

### Prisma Client Issues

Regenerate Prisma client:

```bash
cd backend
npm run prisma:generate
```

## Next Steps

1. Read the [README.md](./README.md) for detailed information
2. Check out the [API Documentation](./DOCS/api/README.md)
3. Review the [Testing Documentation](./DOCS/testing/README.md)
4. Start implementing features from the [tasks.md](./.kiro/specs/worklamp-platform/tasks.md)

## Getting Help

- Check the documentation in the `/DOCS` directory
- Review the requirements in `.kiro/specs/worklamp-platform/requirements.md`
- Review the design in `.kiro/specs/worklamp-platform/design.md`

## Clean Up

To stop all services and clean up:

```bash
# Stop infrastructure services
docker-compose -f docker-compose.dev.yml down

# Remove volumes (WARNING: This deletes all data)
docker-compose -f docker-compose.dev.yml down -v
```
