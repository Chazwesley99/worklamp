# Production Setup Guide

This guide will help you run Worklamp in production mode locally.

## Prerequisites

- Docker Desktop installed and running
- Node.js 20+ installed
- Git

## Quick Production Start

### Option 1: Using Docker Compose (Recommended)

1. **Start all services with Docker:**

   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL (main database) on port 5432
   - PostgreSQL Demo on port 5433
   - Redis on port 6379
   - Backend API on port 3001
   - Frontend on port 3000

2. **Run database migrations:**

   ```bash
   docker exec -it worklamp-backend npm run migrate
   ```

3. **Seed the database (optional):**

   ```bash
   docker exec -it worklamp-backend npm run seed
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

5. **View logs:**

   ```bash
   docker-compose logs -f
   ```

6. **Stop all services:**
   ```bash
   docker-compose down
   ```

### Option 2: Manual Production Build

If you want to run production builds locally without Docker:

#### 1. Start Infrastructure Services

Start only the databases and Redis:

```bash
docker-compose up -d postgres postgres_demo redis
```

#### 2. Build and Run Backend

```bash
cd backend

# Install dependencies
npm install

# Build the backend
npm run build

# Run migrations
npm run migrate

# Seed database (optional)
npm run seed

# Start in production mode
NODE_ENV=production npm start
```

The backend will run on http://localhost:3001

#### 3. Build and Run Frontend (in a new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Build the frontend
npm run build

# Start in production mode
npm start
```

The frontend will run on http://localhost:3000

## Environment Variables

### Backend (.env)

Make sure your `backend/.env` file has these settings:

```env
# Database
# NOTE: Set DB password below (worklamp_dev_password) and set in docker-compose.yml as well
DATABASE_URL=postgresql://worklamp:worklamp_dev_password@localhost:5432/worklamp
DATABASE_URL_DEMO=postgresql://worklamp:worklamp_dev_password@localhost:5433/worklamp_demo

# Redis
REDIS_URL=redis://localhost:6379

# Authentication (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-secure-jwt-secret-here
JWT_REFRESH_SECRET=your-secure-refresh-secret-here
SESSION_SECRET=your-secure-session-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://worklamp.com/api/auth/google/callback

# Admin
ADMIN_EMAIL=your-admin@email.com

# Email (configure your SMTP)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@worklamp.com

# Media Storage
MEDIA_STORAGE_LOCAL=local
LOCAL_STORAGE_PATH=./uploads

# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://worklamp.com
BACKEND_URL=https://worklamp.com
# BACKEND_URL is important for mapping the uploads directory for images and files
```

### Frontend (.env.local)

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://worklamp.com
NEXT_PUBLIC_BACKEND_URL=https://worklamp.com
```

## Troubleshooting

### Redis Connection Error

If you see `ECONNREFUSED ::1:6379`:

1. Check if Docker is running:

   ```bash
   docker ps
   ```

2. Start Redis:

   ```bash
   docker-compose up -d redis
   ```

3. Verify Redis is accessible:
   ```bash
   docker exec -it worklamp-redis redis-cli ping
   ```
   Should return: `PONG`

### Database Connection Error

1. Check if PostgreSQL is running:

   ```bash
   docker ps | grep postgres
   ```

2. Start PostgreSQL:

   ```bash
   docker-compose up -d postgres postgres_demo
   ```

3. Test connection:
   ```bash
   docker exec -it worklamp-postgres psql -U worklamp -d worklamp -c "SELECT 1;"
   ```

### Port Already in Use

If ports 3000, 3001, 5432, 5433, or 6379 are already in use:

1. Find what's using the port:

   ```bash
   # Windows
   netstat -ano | findstr :3000

   # Then kill the process
   taskkill /PID <process-id> /F
   ```

2. Or change the ports in docker-compose.yml and .env files

## Production Deployment Checklist

Before deploying to a real production server:

- [ ] Change all secrets in .env (JWT_SECRET, etc.)
- [ ] Use strong database passwords
- [ ] Configure proper SMTP for emails
- [ ] Set up SSL/HTTPS
- [ ] Configure proper domain names
- [ ] Set up backups for PostgreSQL
- [ ] Configure Redis persistence
- [ ] Set up monitoring and logging
- [ ] Review and update CORS settings
- [ ] Set up rate limiting
- [ ] Configure firewall rules
- [ ] Set NODE_ENV=production

## Useful Commands

### Docker Commands

```bash
# View all containers
docker ps -a

# View logs for a specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Rebuild and restart
docker-compose up -d --build backend

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# Access backend shell
docker exec -it worklamp-backend sh

# Access database
docker exec -it worklamp-postgres psql -U worklamp -d worklamp
```

### Database Commands

```bash
# Run migrations
cd backend
npm run migrate

# Create a new migration
npm run migrate:create

# Seed database
npm run seed

# Reset database (WARNING: deletes all data)
npm run migrate:reset
```

## Performance Tips

1. **Use production builds** - They are optimized and much faster
2. **Enable Redis persistence** - Add to docker-compose.yml:
   ```yaml
   redis:
     command: redis-server --appendonly yes
   ```
3. **Use connection pooling** - Already configured in Prisma
4. **Monitor resource usage** - Use `docker stats`

## Support

For issues or questions:

- Check the logs: `docker-compose logs -f`
- Review the error messages
- Check Docker Desktop is running
- Verify all environment variables are set correctly
