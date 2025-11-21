# Quick Start Guide - Job Import System

## 🚀 Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: 4.4+ (local or Atlas)
- **Redis**: 6.0+ (local or Redis Cloud)
- **npm**: 9.0.0 or higher

## 📋 Step-by-Step Setup

### Step 1: Install Dependencies
```bash
cd myapp
npm install
```

### Step 2: Configure Environment
```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local with your credentials
nano .env.local
```

**Important Variables:**
```
MONGODB_URI=mongodb://localhost:27017/job-import-system
REDIS_URL=redis://localhost:6379
```

### Step 3: Start Services

#### Option A: Local Services (Recommended for Development)

**Terminal 1 - MongoDB:**
```bash
mongod --dbpath ./data
# Output: waiting for connections on port 27017
```

**Terminal 2 - Redis:**
```bash
redis-server
# Output: Ready to accept connections
```

**Terminal 3 - Next.js Server:**
```bash
cd myapp
npm run dev
# Output: ▲ Next.js 14.0.0
# ▲ Local: http://localhost:3000
```

**Terminal 4 - Job Worker:**
```bash
cd myapp
npm run worker
# Output: 🚀 Worker started and listening for jobs...
```

**Terminal 5 - Cron Scheduler:**
```bash
cd myapp
npm run cron
# Output: ✅ Cron jobs initialized successfully!
```

#### Option B: Using Docker Compose (Recommended for Production)

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: job-import-system

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      MONGODB_URI: mongodb://mongodb:27017/job-import-system
      REDIS_URL: redis://redis:6379
    depends_on:
      - mongodb
      - redis

volumes:
  mongo_data:
```

**Start with Docker:**
```bash
docker-compose up -d
```

### Step 4: Verify Setup

#### Check MongoDB
```bash
mongosh
> show databases
job-import-system
> use job-import-system
> show collections
```

#### Check Redis
```bash
redis-cli
> ping
PONG
```

#### Check Next.js
Open browser: `http://localhost:3000`

#### Check Import History Dashboard
Open browser: `http://localhost:3000/import-history`

## 📊 First Import Run

### Automatic (Cron)
- Imports run automatically every 1 hour
- First run happens ~10 seconds after cron starts

### Manual Import (API)
```bash
# Trigger manual import via API
curl -X POST http://localhost:3000/api/jobs/import \
  -H "Content-Type: application/json" \
  -d '{
    "sources": ["jobicy_all", "higheredjobs"]
  }'
```

## 📈 Monitoring

### View Logs
```bash
# Terminal 1: Next.js logs
# Terminal 4: Worker logs
# Terminal 5: Cron logs
```

### Dashboard Access
```
URL: http://localhost:3000/import-history
```

### Queue Statistics
```bash
# Check queue status
curl http://localhost:3000/api/jobs/stats
```

### Database Queries
```bash
# Connect to MongoDB
mongosh job-import-system

# View import logs
db.importlogs.find().sort({timestamp: -1}).limit(5)

# View jobs
db.jobs.countDocuments()
db.jobs.find().limit(3)

# Check failed jobs
db.importlogs.find({failedJobs: {$gt: 0}})
```

## 🔧 Common Issues & Solutions

### Issue: MongoDB Connection Failed
```bash
# Solution 1: Ensure MongoDB is running
mongod --version  # Check installation
mongod --dbpath ./data  # Start MongoDB

# Solution 2: Check connection string in .env.local
MONGODB_URI=mongodb://localhost:27017/job-import-system
```

### Issue: Redis Connection Failed
```bash
# Solution 1: Ensure Redis is running
redis-cli ping  # Should return PONG

# Solution 2: Start Redis
redis-server

# Solution 3: Check Redis port
redis-cli -p 6379
```

### Issue: Worker Not Processing Jobs
```bash
# Solution 1: Check worker is running
ps aux | grep worker

# Solution 2: Restart worker
npm run worker

# Solution 3: Check Redis connection
redis-cli
> KEYS job-import:*
```

### Issue: Memory Issues
```bash
# Solution 1: Reduce worker concurrency
# In server/workers/jobWorker.ts
concurrency: 3  // Reduce from 5

# Solution 2: Check MongoDB size
db.stats()

# Solution 3: Clear old import logs
db.importlogs.deleteMany({timestamp: {$lt: new Date(Date.now() - 30*24*60*60*1000)}})
```

## 🎯 Next Steps

1. **Customize Job Sources**
   - Edit `server/services/JobFetcherService.ts`
   - Add or modify JOB_SOURCES

2. **Improve Data Extraction**
   - Enhance metadata extraction in `parseRSSItem()`
   - Add custom parsers for different API formats

3. **Add Notifications**
   - Email alerts on import failures
   - Slack integration for status updates

4. **Scale Up**
   - Add more workers (increase concurrency)
   - Implement Redis cluster
   - MongoDB sharding for large datasets

5. **Deployment**
   - Deploy to Vercel (frontend)
   - Deploy to Railway/Render (backend)
   - Use MongoDB Atlas (database)
   - Use Redis Cloud (cache)

## 📚 Useful Commands

```bash
# Development
npm run dev              # Start Next.js dev server
npm run worker           # Start job worker
npm run cron             # Start cron scheduler

# Production
npm run build            # Build for production
npm start                # Start production server

# Database
npm run seed             # Seed sample data (if implemented)
npm run migrate          # Run migrations (if implemented)

# Testing (if implemented)
npm test                 # Run tests
npm run test:watch       # Watch mode

# Linting
npm run lint             # Check code quality
npm run lint:fix         # Fix linting issues
```

## 📞 Support

For issues:
1. Check `.env.local` configuration
2. Verify all 5 services are running
3. Check browser console for frontend errors
4. Check terminal output for backend logs
5. Review MongoDB and Redis connections

## 🎉 Success Indicators

✅ Next.js server running on port 3000
✅ Worker listening for jobs
✅ Cron scheduler active (logs show "Every hour at minute 0")
✅ MongoDB connected
✅ Redis connected
✅ Import history shows up in dashboard
✅ Jobs appear in database after first run

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Redis Documentation](https://redis.io/docs)
- [BullMQ Documentation](https://docs.bullmq.io)
- [Node-cron Documentation](https://github.com/node-cron/node-cron)

---