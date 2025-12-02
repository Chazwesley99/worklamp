# Database Safety for Testing

## ⚠️ CRITICAL: Test Database Configuration

**NEVER run tests against your development or production database!**

## What Happened

During the implementation of the real-time infrastructure, tests were run using `npm run test`. The test suite was configured to use `DATABASE_URL_TEST` environment variable, but this variable was not set in the `.env` file. As a fallback, the tests used the main `DATABASE_URL`, which pointed to the development database.

**Result**: Test cleanup code deleted all data from the development database.

## Prevention Measures Implemented

### 1. Mandatory Test Database Check

The test helpers now include a safety check that:

- **Requires** `DATABASE_URL_TEST` to be set
- **Prevents** tests from running if `DATABASE_URL_TEST` equals `DATABASE_URL`
- **Throws an error** before any tests run if these conditions aren't met

### 2. Environment Variable Configuration

Add this to your `backend/.env` file:

```bash
# Test Database (REQUIRED for running tests)
DATABASE_URL_TEST=postgresql://worklamp:worklamp_dev_password@localhost:5432/worklamp_test
```

### 3. Create Test Database

Before running tests, create a separate test database:

```bash
# Connect to PostgreSQL
psql -U worklamp -h localhost

# Create test database
CREATE DATABASE worklamp_test;

# Exit
\q
```

### 4. Run Migrations on Test Database

```bash
# Set the test database URL temporarily
DATABASE_URL=postgresql://worklamp:worklamp_dev_password@localhost:5432/worklamp_test npm run prisma:migrate
```

## How to Restore Data

If data was accidentally deleted, you can restore the basic structure:

```bash
cd backend
npm run prisma:seed
```

This will create:

- Admin user (using `ADMIN_EMAIL` from `.env`)
- Default tenant
- Tenant membership

**Note**: This only restores the basic admin user and tenant. Any projects, tasks, bugs, or other data you created will need to be recreated manually.

## Best Practices

1. **Always use a separate test database**
2. **Never set `DATABASE_URL_TEST` to the same value as `DATABASE_URL`**
3. **Use database backups** for important development data
4. **Consider using Docker** for isolated test databases
5. **Run tests in CI/CD** with ephemeral databases

## Test Database Lifecycle

Tests follow this pattern:

1. **Setup**: Connect to test database
2. **Test**: Create test data, run assertions
3. **Cleanup**: Delete all test data (this is why we need a separate database!)
4. **Teardown**: Disconnect from test database

The cleanup step is **essential** for test isolation but **destructive** to any database it runs against.

## Docker-Based Test Database (Recommended)

For better isolation, consider using Docker for test databases:

```yaml
# docker-compose.test.yml
version: '3.8'
services:
  test-db:
    image: postgres:15
    environment:
      POSTGRES_USER: worklamp
      POSTGRES_PASSWORD: worklamp_test_password
      POSTGRES_DB: worklamp_test
    ports:
      - '5433:5432'
```

Then update your `.env`:

```bash
DATABASE_URL_TEST=postgresql://worklamp:worklamp_test_password@localhost:5433/worklamp_test
```

## Verification

Before running tests, verify your configuration:

```bash
# Check that DATABASE_URL_TEST is set and different
echo $DATABASE_URL
echo $DATABASE_URL_TEST
```

They should be **different** values!

## Summary

- ✅ Safety checks added to prevent accidental data loss
- ✅ Test database configuration documented
- ✅ Basic data restoration completed
- ⚠️ Always configure `DATABASE_URL_TEST` before running tests
- ⚠️ Never use production/development database for tests
