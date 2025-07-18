#!/usr/bin/env bash
# build.sh

echo "🔧 Installing dependencies..."
npm ci

echo "📦 Building TypeScript..."
npm run build

echo "🗄️  Generating Prisma client..."
npx prisma generate

echo "🚀 Running database migrations..."
npx prisma migrate deploy

echo "✅ Build completed successfully!"