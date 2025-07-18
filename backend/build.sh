#!/usr/bin/env bash
# build.sh

set -e  # Exit on any error

echo "🔧 Installing dependencies..."
npm ci --production=false

echo "🗄️  Generating Prisma client..."
npx prisma generate

echo "📦 Building TypeScript..."
npm run build

echo "🚀 Running database migrations..."
npx prisma migrate deploy

echo "✅ Build completed successfully!"