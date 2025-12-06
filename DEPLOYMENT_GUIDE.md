# Worklamp Deployment Guide - Ubuntu Server (Digital Ocean)

Complete guide to deploy Worklamp on a fresh Ubuntu server.

## Prerequisites

- Ubuntu 22.04 LTS server (Digital Ocean Droplet)
- Domain name pointed to your server's IP
- SSH access to your server
- At least 2GB RAM recommended

## Step 1: Initial Server Setup

### Connect to your server

```bash
ssh root@your-server-ip
```

### Update system packages

```bash
apt update && apt upgrade -y
```

### Create a non-root user (recommended)

```bash
# Create user
    adduser worklamp

# Add to sudo group
usermod -aG sudo worklamp

# Switch to new user
su - worklamp
```

### Set up firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5555/tcp (optioanl for Prisma Access)
sudo ufw enable
sudo ufw status
```

## Step 2: Install Required Software

### Install Docker

```bash
# Install prerequisites
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Add your user to docker group
sudo usermod -aG docker $USER

# Apply group changes (or logout/login)
newgrp docker

# Verify Docker installation
docker --version
```

### Install Docker Compose

```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### Install Node.js 20 (for building)

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Install Git

```bash
sudo apt install -y git
git --version
```

### Install Nginx (reverse proxy)

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 3: Clone and Setup Application

### Clone your repository

```bash
cd ~
git clone https://github.com/your-username/worklamp.git
cd worklamp
```

### Create production environment file

```bash
# Create backend .env file
cat > backend/.env << 'EOF'
# Database
DATABASE_URL=postgresql://worklamp:CHANGE_THIS_PASSWORD@localhost:5432/worklamp
DATABASE_URL_DEMO=postgresql://worklamp:CHANGE_THIS_PASSWORD@localhost:5433/worklamp_demo

# Redis
REDIS_URL=redis://localhost:6379

# Authentication - CHANGE THESE!
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
SKIP_EMAIL_VERIFICATION=true

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://worklamp.com/api/auth/google/callback

# Admin
ADMIN_EMAIL=admin@yourdomain.com

# Email - Configure your SMTP provider
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Media Storage
MEDIA_STORAGE_LOCAL=local
LOCAL_STORAGE_PATH=./uploads

# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://worklamp.com
BACKEND_URL=https://worklamp.com
EOF

# Create frontend .env.local file
cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://worklamp.com
NEXT_PUBLIC_BACKEND_URL=https://worklamp.com
EOF
```

Set the DB password set above in docker-compose.yml

### Generate secure secrets

```bash
# Generate and update secrets in backend/.env
echo "JWT_SECRET=$(openssl rand -base64 32)" >> backend/.env
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 32)" >> backend/.env
echo "SESSION_SECRET=$(openssl rand -base64 32)" >> backend/.env
```

**Important:** Edit `backend/.env` and replace:

- `CHANGE_THIS_PASSWORD` with a strong database password
- `yourdomain.com` with your actual domain
- Google OAuth credentials
- SMTP settings

```bash
nano backend/.env
```

## Step 4: Build the Application

### Install dependencies and build

```bash
# Install root dependencies
npm install

# Build backend
cd backend
npm install

# Generate Prisma Client
npx prisma generate

# Build TypeScript
npm run build
cd ..

# Build frontend
cd frontend
npm install
npm run build
cd ..
```

## Step 5: Start Infrastructure Services

### Start Docker services (PostgreSQL and Redis)

```bash
# Start only infrastructure services
docker-compose up -d postgres postgres_demo redis

# Verify services are running
docker ps

# Check logs if needed
docker-compose logs -f
```

### Run database migrations

```bash
cd backend

# Apply migrations (production mode - no prompts)
npx prisma migrate deploy

# OR for development with prompts:
# npm run prisma:migrate

# Seed initial data (optional)
npm run prisma:seed

cd ..
```

## Step 6: Set Up Process Manager (PM2)

### Install PM2

```bash
sudo npm install -g pm2
```

### Create PM2 ecosystem file

```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'worklamp-backend',
      cwd: './backend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'worklamp-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};
EOF
```

### Create logs directory

```bash
mkdir -p logs
```

### Start applications with PM2

```bash
# Start both applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup

# Follow the command output by PM2 startup (it will give you a command to run)
```

### Verify applications are running

```bash
pm2 status
pm2 logs
```

## Step 7: Configure Nginx Reverse Proxy

### Create Nginx configuration

```bash
sudo nano /etc/nginx/sites-available/worklamp
```

Add this **HTTP-only** configuration (Certbot will automatically add HTTPS):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name worklamp.com www.worklamp.com;

    # Client body size (for file uploads)
    client_max_body_size 100M;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # WebSocket support
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Static files (uploads)
    location /uploads {
        proxy_pass http://localhost:3001/uploads;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Replace `yourdomain.com` with your actual domain!**

### Enable the site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/worklamp.com /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Step 8: Set Up SSL with Let's Encrypt

### Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain SSL certificate

Certbot will automatically:

- Obtain SSL certificates
- Update your Nginx configuration
- Add HTTPS redirect
- Configure SSL settings

```bash
# Get certificate and auto-configure Nginx (replace with your domain and email)
sudo certbot --nginx -d worklamp.com -d www.worklamp.com --email your-email@example.com --agree-tos --no-eff-email

# Test automatic renewal
sudo certbot renew --dry-run
```

That's it! Certbot has automatically:

- ✅ Added SSL certificates
- ✅ Created HTTPS server block
- ✅ Added HTTP to HTTPS redirect
- ✅ Configured secure SSL settings

### Verify HTTPS is working

```bash
# Check Nginx configuration
sudo nginx -t

# Your site should now be accessible at https://yourdomain.com
```

## Step 9: Verify Deployment

### Check all services

```bash
# Check Docker containers
docker ps

# Check PM2 processes
pm2 status

# Check Nginx
sudo systemctl status nginx

# View application logs
pm2 logs
```

### Test the application

1. Open your browser and go to `https://yourdomain.com`
2. You should see the Worklamp application
3. Try signing up and logging in
4. Check that all features work

## Step 10: Set Up Monitoring and Backups

### Set up PM2 monitoring

```bash
# Install PM2 monitoring (optional)
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Set up database backups

Create a backup script:

```bash
cat > ~/backup-database.sh << 'EOF'
#!/bin/bash

# Configuration
BACKUP_DIR="/home/worklamp/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="worklamp"
DB_USER="worklamp"
DB_PASSWORD="YOUR_DB_PASSWORD"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup main database
docker exec worklamp-postgres pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/worklamp_$DATE.sql.gz

# Backup demo database
docker exec worklamp-postgres-demo pg_dump -U $DB_USER worklamp_demo | gzip > $BACKUP_DIR/worklamp_demo_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x ~/backup-database.sh
```

### Set up daily backups with cron

```bash
# Edit crontab
crontab -e

# Add this line to run backup daily at 2 AM
0 2 * * * /home/worklamp/backup-database.sh >> /home/worklamp/logs/backup.log 2>&1
```

## Maintenance Commands

### Update application

```bash
cd ~/worklamp

# Pull latest changes
git pull

# Rebuild backend
cd backend
npm install
npm run build
cd ..

# Rebuild frontend
cd frontend
npm install
npm run build
cd ..

# Restart applications
pm2 restart all

# Check status
pm2 status
```

### View logs

```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Docker logs
docker-compose logs -f
```

### Restart services

```bash
# Restart applications
pm2 restart all

# Restart Docker services
docker-compose restart

# Restart Nginx
sudo systemctl restart nginx
```

### Database operations

```bash
# Run migrations
cd ~/worklamp/backend
npm run migrate

# Access database
docker exec -it worklamp-postgres psql -U worklamp -d worklamp

# Restore from backup
gunzip < /home/worklamp/backups/worklamp_20231205_020000.sql.gz | docker exec -i worklamp-postgres psql -U worklamp -d worklamp
```

## Troubleshooting

### Application not starting

```bash
# Check PM2 logs
pm2 logs

# Check if ports are in use
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001

# Restart everything
pm2 restart all
docker-compose restart
```

### Database connection issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker exec -it worklamp-postgres psql -U worklamp -d worklamp -c "SELECT 1;"
```

### Nginx issues

```bash
# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### SSL certificate issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

## Security Checklist

- [ ] Changed all default passwords in `.env`
- [ ] Generated strong JWT secrets
- [ ] Configured firewall (UFW)
- [ ] Set up SSL/HTTPS
- [ ] Configured secure SMTP
- [ ] Set up regular database backups
- [ ] Enabled PM2 log rotation
- [ ] Reviewed Nginx security headers
- [ ] Set up monitoring/alerts
- [ ] Documented admin credentials securely

## Performance Optimization

### Enable Redis persistence

Edit `docker-compose.yml`:

```yaml
redis:
  command: redis-server --appendonly yes
```

### Optimize Nginx

Add to Nginx config:

```nginx
# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

# Enable caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Support

For issues:

1. Check logs: `pm2 logs` and `docker-compose logs`
2. Verify all services are running: `pm2 status` and `docker ps`
3. Check Nginx configuration: `sudo nginx -t`
4. Review environment variables in `backend/.env`

## Estimated Costs (Digital Ocean)

- **Basic Droplet** (2GB RAM, 1 CPU): $12/month
- **Standard Droplet** (4GB RAM, 2 CPU): $24/month (recommended)
- **Domain**: ~$12/year
- **Backups**: Optional, ~20% of droplet cost

Total: ~$24-30/month for production-ready setup
