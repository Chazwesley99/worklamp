# GIT COMMANDS

# Push Commit

git add .
git commit -m "What you changed"
git push

# Pull from repo

cd ~/worklamp
git pull

# Rebuild / Restart Backend

cd backend
npm install
npm run build
cd ..
pm2 restart worklamp-backend

# Check PM2 Status and Logs

pm2 status
pm2 logs worklamp-backend

# PRISMA STUDIO

cd backend/
npx prisma studio

# FULL UPDATE AFTER GIT PULL

# From the root:

git pull origin main
npm install

cd backend
npm install
npx prisma migrate deploy
npx prisma generate
npm run build

cd ../frontend
npm install
npm run build

pm2 restart backend
pm2 restart frontend

--- OR ---
docker-compose down
docker-compose up -d --build

# Single Line Command to do all of this:

git pull && npm install && cd backend && npm install && npx prisma migrate deploy && npx prisma generate && npm run build && cd ../frontend && npm install && npm run build && cd .. && pm2 restart all

# CHECH SERVER LOGS

pm2 logs backend --lines 50
pm2 logs frontend --lines 50
