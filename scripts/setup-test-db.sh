#!/bin/bash

# Setup Test Database Script
# This script creates and initializes the test database

set -e  # Exit on error

echo "🔧 Setting up test database..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
if ! pg_isready > /dev/null 2>&1; then
  echo -e "${RED}❌ PostgreSQL is not running${NC}"
  echo "Please start PostgreSQL first"
  exit 1
fi

# Database name
DB_NAME="transpayra_test"

# Check if database already exists
if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  echo -e "${YELLOW}⚠️  Database '$DB_NAME' already exists${NC}"
  read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Dropping existing database..."
    dropdb "$DB_NAME"
  else
    echo "Keeping existing database"
    exit 0
  fi
fi

# Create database
echo "Creating database '$DB_NAME'..."
createdb "$DB_NAME"
echo -e "${GREEN}✅ Database created${NC}"

# Check if .env.test exists
if [ ! -f .env.test ]; then
  echo -e "${RED}❌ .env.test file not found${NC}"
  echo "Creating .env.test from template..."

  # Create .env.test if it doesn't exist
  cat > .env.test << EOL
DATABASE_URL=postgresql://localhost:5432/transpayra_test
ANONYMOUS_TOKEN_SALT=test-4f8a9d2b6c1e7f3a5d8b9c2e4f6a8d1b2c3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a
NODE_ENV=test
EOL

  echo -e "${GREEN}✅ .env.test created${NC}"
fi

# Run migrations
echo "Running migrations..."
NODE_ENV=test npm run db:push
echo -e "${GREEN}✅ Migrations applied${NC}"

echo ""
echo -e "${GREEN}✨ Test database setup complete!${NC}"
echo ""
echo "You can now run tests with:"
echo "  npm test"
echo ""
echo "To connect to the test database:"
echo "  psql transpayra_test"