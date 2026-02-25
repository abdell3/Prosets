#!/bin/sh
set -e

echo "🚀 Starting ProSets Backend..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until nc -z postgres 5432 2>/dev/null; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done
echo "✅ PostgreSQL is ready!"

# Run Prisma migrations
echo "📦 Running Prisma migrations..."
npx prisma migrate deploy || echo "⚠️  Migrations may have already been applied"

# Start the application
echo "🎯 Starting NestJS..."
exec "$@"
