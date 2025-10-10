#!/bin/bash

# Install Test Dependencies
echo "📦 Installing test dependencies..."

npm install --save-dev \
  jest \
  @types/jest \
  ts-node \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/react-hooks

echo "✅ Test dependencies installed!"
