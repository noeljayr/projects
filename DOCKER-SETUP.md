# Docker Setup Guide

## Overview

This setup uses Docker Compose to run both the Next.js application and MongoDB in separate containers with persistent data storage.

## Prerequisites

- Docker and Docker Compose installed
- Your local MongoDB data (if you want to migrate it)

## Quick Start

### 1. Environment Setup

Create a `.env` file (or update your existing one):

```bash
# For Docker deployment
MONGODB_URI=mongodb://mongodb:27017/vom_sauterhof
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 2. Build and Run

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services (data persists)
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v
```

## Data Persistence

MongoDB data is stored in Docker volumes:

- `mongodb_data` - Database files
- `mongodb_config` - MongoDB configuration

**Data persists even when containers are stopped or removed** (unless you use `docker-compose down -v`).

## Migrating Existing Data

If you have existing MongoDB data locally, you can migrate it:

### Option 1: Export/Import (Recommended)

```bash
# Export from local MongoDB
mongodump --uri="mongodb://127.0.0.1:27017/vom_sauterhof" --out=./backup

# Start Docker containers
docker-compose up -d mongodb

# Wait for MongoDB to be ready, then import
mongorestore --uri="mongodb://localhost:27017/vom_sauterhof" ./backup/vom_sauterhof
```

### Option 2: Copy Data Directory

```bash
# Stop local MongoDB first
# Find your local MongoDB data directory (usually /data/db or C:\data\db on Windows)

# Start only MongoDB container
docker-compose up -d mongodb

# Copy data into the container
docker cp /path/to/local/data/db/. vom_sauterhof_mongodb:/data/db/

# Restart MongoDB
docker-compose restart mongodb
```

## Development Workflow

### Local Development (without Docker)

```bash
# Use local MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/vom_sauterhof

npm run dev
```

### Docker Development

```bash
# Use Docker MongoDB
MONGODB_URI=mongodb://mongodb:27017/vom_sauterhof

docker-compose up
```

## Accessing MongoDB

### From Host Machine

```bash
# MongoDB is exposed on localhost:27017
mongosh mongodb://localhost:27017/vom_sauterhof
```

### From Docker Container

```bash
# Execute commands inside the container
docker exec -it vom_sauterhof_mongodb mongosh vom_sauterhof
```

## Troubleshooting

### App can't connect to MongoDB

- Check if MongoDB is healthy: `docker-compose ps`
- View MongoDB logs: `docker-compose logs mongodb`
- Ensure MONGODB_URI uses `mongodb://mongodb:27017` (not 127.0.0.1)

### Data not persisting

- Don't use `docker-compose down -v` (this deletes volumes)
- Check volumes exist: `docker volume ls`

### Port conflicts

- If port 27017 or 3000 is in use, modify ports in docker-compose.yml:
  ```yaml
  ports:
    - "27018:27017" # Use different host port
  ```

## Production Deployment

For production, consider:

1. Use environment-specific `.env` files
2. Set strong NEXTAUTH_SECRET
3. Configure MongoDB authentication
4. Use proper backup strategies
5. Consider managed MongoDB services (MongoDB Atlas)
