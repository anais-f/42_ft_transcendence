#!/bin/bash

# Script to run auth service tests

echo "Running Auth Service Tests..."
echo "=============================="

cd "$(dirname "$0")/../services/auth/app"

# Set environment variables needed for tests
export JWT_SECRET="test-secret-key-for-jwt"
export INTERNAL_API_SECRET="test-api-secret"
export GOOGLE_CLIENT_ID="test-client-id"
export GOOGLE_CLIENT_SECRET="test-client-secret"
export PORT="3001"
export LOGIN_ADMIN="admin"
export PASSWORD_ADMIN="adminpass"

# Run tests with npx to avoid module resolution issues
npx --yes jest --config ./jest.config.ts --verbose

echo ""
echo "Tests completed!"
