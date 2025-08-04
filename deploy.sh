#!/bin/bash

# Brain Bytes AI Assistant Deployment Script

set -e

echo "🚀 Starting deployment process..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  Warning: .env.production not found. Creating from .env.example..."
    cp .env.example .env.production
    echo "❗ Please edit .env.production with your production values before running this script again."
    exit 1
fi

# Load environment variables
source .env.production

echo "📦 Installing dependencies..."
npm ci --only=production

echo "🔍 Running linting..."
npm run lint

echo "🏗️  Building application..."
npm run build

echo "🧪 Running type check..."
npm run typecheck

echo "🎯 Starting production servers..."
NODE_ENV=production npm start

echo "✅ Deployment completed successfully!"
echo "🌐 Frontend: http://localhost:8081"
echo "🔐 OAuth Server: http://localhost:8082"