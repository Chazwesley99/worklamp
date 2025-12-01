#!/bin/bash

# Script to set up environment variables for development

echo "Setting up environment variables..."

# Check if .env already exists
if [ -f "backend/.env" ]; then
  echo "backend/.env already exists. Skipping..."
else
  echo "Creating backend/.env from example..."
  cp backend/.env.example backend/.env
  
  # Generate random secrets
  JWT_SECRET=$(openssl rand -base64 32)
  JWT_REFRESH_SECRET=$(openssl rand -base64 32)
  SESSION_SECRET=$(openssl rand -base64 32)
  
  # Update secrets in .env file
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" backend/.env
    sed -i '' "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|" backend/.env
    sed -i '' "s|SESSION_SECRET=.*|SESSION_SECRET=$SESSION_SECRET|" backend/.env
  else
    # Linux
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" backend/.env
    sed -i "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|" backend/.env
    sed -i "s|SESSION_SECRET=.*|SESSION_SECRET=$SESSION_SECRET|" backend/.env
  fi
  
  echo "✓ Created backend/.env with generated secrets"
fi

echo "Environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your specific configuration (database, OAuth, etc.)"
echo "2. Run 'docker-compose -f docker-compose.dev.yml up -d' to start services"
echo "3. Run 'npm install' to install dependencies"
echo "4. Run 'npm run dev' to start the application"
