@echo off
REM Script to set up environment variables for development on Windows

echo Setting up environment variables...

REM Check if .env already exists
if exist "backend\.env" (
  echo backend\.env already exists. Skipping...
) else (
  echo Creating backend\.env from example...
  copy "backend\.env.example" "backend\.env"
  echo.
  echo Created backend\.env
  echo Please update the file with your specific configuration
)

echo.
echo Environment setup complete!
echo.
echo Next steps:
echo 1. Update backend\.env with your specific configuration (database, OAuth, etc.)
echo 2. Run 'docker-compose -f docker-compose.dev.yml up -d' to start services
echo 3. Run 'npm install' to install dependencies
echo 4. Run 'npm run dev' to start the application
