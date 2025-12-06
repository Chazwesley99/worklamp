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
