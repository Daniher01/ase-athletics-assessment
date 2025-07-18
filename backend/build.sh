#!/usr/bin/env bash
set -e

echo "🔧 Installing dependencies..."
npm ci --production=false

echo "🗄️  Generating Prisma client..."
npx prisma generate

echo "📦 Building TypeScript..."
npm run build

echo "🚀 Running database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npm run db:seed:prod

echo "✅ Build completed successfully!"