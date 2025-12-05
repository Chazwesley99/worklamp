#!/bin/bash

# Quick fix for TypeScript type errors before building

echo "Fixing TypeScript type errors..."

cd backend

# Regenerate Prisma Client
echo "Regenerating Prisma Client..."
npx prisma generate

echo "Type fixes applied! Now run: npm run build"
