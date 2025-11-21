# Job Import System - Complete Documentation

## 📋 Overview

This is a **scalable, enterprise-grade job import system** that fetches job data from multiple external APIs, processes them asynchronously using Redis queues, stores them in MongoDB, and provides a comprehensive admin dashboard for monitoring import history.

## 🏗️ Architecture

### System Components

```
┌─────────────────┐
│  External APIs  │
│  (Jobicy, etc)  │
└────────┬────────┘
         │
    ┌────▼─────┐
    │   Cron   │ (Every 1 hour)
    │ Scheduler│
    └────┬─────┘
         │
    ┌────▼─────────────┐
    │   Queue Manager  │ (BullMQ)
    │   (Redis Queue)  │
    └────┬─────────────┘
         │
    ┌────▼──────────┐
    │  Job Workers  │ (Concurrency: 5)
    │ (Processing)  │
    └────┬──────────┘
         │
    ┌────▼─────────┐
    │   MongoDB    │
    │  (Job Store) │
    └──────────────┘
```

## 📁 Project Structure

```
myapp/
├── server/
│   ├── config/
│   │   ├── database.ts          # MongoDB connection
│   │   └── redis.ts             # Redis connection
│   ├── models/
│   │   ├── Job.ts               # Job schema
│   │   └── ImportLog.ts         # Import history schema
│   ├── services/
│   │   ├── JobFetcherService.ts # Fetch from external APIs
│   │   ├── QueueManager.ts      # BullMQ queue management
│   │   └── JobImportService.ts  # Import jobs to DB
│   ├── workers/
│   │   └── jobWorker.ts         # Background job processor
│   ├── cron/
│   │   └── jobFetcher.ts        # Cron scheduler (every 1 hour)
│   └── utils/
│       └── logger.ts            # Logging utilities
├── app/
│   ├── api/
│   │   └── jobs/
│   │       ├── route.ts                  # GET jobs
│   │       ├── import-history/route.ts   # GET import history
│   │       └── stats/route.ts            # GET import stats
│   └── import-history/
│       └── page.tsx             # Admin dashboard
├── .env.local                   # Environment variables
└── package.json
```

## 🚀 Key Features

### 1. **Multi-Source Job Fetching**
- Supports 9 different job sources:
  - Jobicy (All jobs, SMM, Seller, Design, Data Science, Copywriting, Business, Management)
  - Higher Ed Jobs

### 2. **Queue-Based Processing**
- Uses **BullMQ** for reliable job queue management
- **Exponential backoff** for failed jobs (3 retry attempts)
- **Concurrency control** (5 jobs processed simultaneously)
- **Dead-letter queue** support for permanently failed jobs

### 3. **Automatic Scheduling**
- **Cron jobs** every 1 hour
- Fetches from all sources automatically
- Adds to queue for background processing

### 4. **Comprehensive Tracking**
- Tracks for each import:
  - **Total Fetched**: Number of jobs fetched from API
  - **Total Imported**: Successfully processed jobs
  - **New Jobs**: Newly created records
  - **Updated Jobs**: Existing records updated
  - **Failed Jobs**: Records that failed with reasons
  - **Duration**: Processing time in milliseconds
  - **Status**: success | partial | failed

### 5. **Admin Dashboard**
- View import history with pagination
- Statistics per source
- Real-time job counts
- Filter and search capabilities

## 🔧 Technologies Used

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS |
| **Backend** | Node.js, Express (via Next.js API routes) |
| **Database** | MongoDB with Mongoose |
| **Queue** | BullMQ (Redis-backed) |
| **Cache/Queue Store** | Redis |
| **Scheduling** | node-cron |
| **XML Parsing** | xml2js |
| **HTTP Client** | Axios |

## 📊 Data Models

### Job Model
```typescript
{
  title: string;
  description: string;
  company: string;
  location: string;
  jobType: string;
  category: string;
  salary?: string;
  link: string;              // Unique identifier
  source: string;            // Source name
  sourceId: string;
  postedDate: Date;
  externalId: string;        // External API ID
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### ImportLog Model
```typescript
{
  url: string;               // Source URL
  source: string;            // Source name
  timestamp: Date;
  totalFetched: number;
  totalImported: number;
  newJobs: number;
  updatedJobs: number;
  failedJobs: number;
  failedJobsDetails: [
    {
      sourceId: string;
      reason: string;
      jobData?: any;
    }
  ];
  duration: number;          // In milliseconds
  status: 'success' | 'partial' | 'failed';
  errorMessage?: string;
}
```

## 🔌 API Endpoints

### GET `/api/jobs`
Fetch jobs with filtering and pagination
```typescript
Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- category: string (optional)
- source: string (optional)
- search: string (optional)

Response:
{
  success: boolean;
  data: {
    jobs: Job[];
    total: number;
    page: number;
    totalPages: number;
  }
}
```

### GET `/api/jobs/import-history`
Fetch import history with pagination
```typescript
Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)

Response:
{
  success: boolean;
  data: {
    logs: ImportLog[];
    total: number;
    page: number;
    totalPages: number;
  }
}
```

### GET `/api/jobs/stats`
Fetch import statistics per source
```typescript
Response:
{
  success: boolean;
  data: [
    {
      _id: string;          // Source name
      totalImports: number;
      totalJobs: number;
      newJobs: number;
      updatedJobs: number;
      failedJobs: number;
      avgDuration: number;
    }
  ]
}
```

## 🔄 Data Flow

### 1. Fetch Phase (Cron - Every 1 Hour)
```
Cron Job Triggered
  ↓
For each JOB_SOURCES URL:
  ↓
Add to Queue: { url, source, timestamp }
```

### 2. Queue Phase (BullMQ)
```
Job Added to Queue
  ↓
Worker picks up job
  ↓
If success: Process next job
If fails: Retry (exponential backoff, max 3 attempts)
```

### 3. Import Phase (Worker)
```
Fetch XML from API
  ↓
Parse XML → Convert to JSON
  ↓
For each job:
  - Check if exists (by link)
  - If exists: UPDATE
  - If new: CREATE
  ↓
Log Import with statistics
```

### 4. Tracking Phase
```
After import completion:
  ↓
Create ImportLog entry with:
  - Total/New/Updated/Failed counts
  - Failed job details
  - Processing duration
  - Status (success/partial/failed)
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or cloud)

### Installation Steps

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local file
cat > .env.local << EOF
MONGODB_URI=mongodb://localhost:27017/job-import-system
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
NODE_ENV=development
EOF

# 3. Start MongoDB
mongod --dbpath ./data

# 4. Start Redis
redis-server

# 5. Run the application (3 processes)

# Terminal 1: Next.js server
npm run dev

# Terminal 2: Job worker
npm run worker

# Terminal 3: Cron scheduler
npm run cron
```

## 📈 Monitoring

### View Import History
Navigate to: `http://localhost:3000/import-history`

### Queue Statistics
Access queue stats via API:
```bash
GET /api/jobs/stats
```

### Logs
Check terminal output for:
- Fetch operations
- Queue events
- Import results
- Error details

## 🔒 Error Handling

### Retry Strategy
- **Automatic retries**: 3 attempts with exponential backoff
- **Dead-letter queue**: After max retries, job moves to DLQ
- **Error logging**: All errors logged in ImportLog

### Validation
- XML parsing validation
- Required field validation
- Duplicate detection (by link)
- Database transaction rollback on failure

## 📊 Performance Considerations

### Scalability Features
1. **Horizontal Scaling**: Add more workers without code changes
2. **Queue-based**: Decouples fetching from processing
3. **Batch Processing**: Process multiple jobs concurrently (5 default)
4. **Pagination**: Handle large datasets efficiently
5. **Indexing**: MongoDB indexes on frequently queried fields

### Optimization Tips
```javascript
// Increase concurrency for faster processing
// In jobWorker.ts
concurrency: 10  // Increase from 5

// Add database indexes
// In Job.ts - indexes already added:
// - title, company, location
// - source, sourceId, category

// Cache frequently accessed data
// Implement Redis caching for stats
```

## 🚀 Deployment

### Docker Support (Optional)
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
REDIS_URL=redis://:password@host:port
NODE_ENV=production
```

## 📚 API Sources

1. **Jobicy** - Remote job feed
   - Base: `https://jobicy.com/?feed=job_feed`
   - Categories: smm, seller, design-multimedia, data-science, copywriting, business, management

2. **Higher Ed Jobs** - Academic jobs
   - URL: `https://www.higheredjobs.com/rss/articleFeed.cfm`

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Solution: Ensure MongoDB is running
$ mongod --dbpath ./data
```

### Redis Connection Error
```
Solution: Ensure Redis is running
$ redis-server
```

### Queue Not Processing
```
Solution: Check worker is running
$ npm run worker

Verify queue name matches in:
- cron/jobFetcher.ts
- workers/jobWorker.ts
- services/QueueManager.ts
```

### Memory Issues
```
Solution: Implement pagination and batch processing
- Reduce concurrency
- Add monitoring
- Implement cleanup jobs
```

## 📞 Support

For issues or questions:
1. Check logs in terminal
2. Verify all services running (Next.js, Worker, Cron)
3. Check MongoDB and Redis connections
4. Review data in import_logs collection

## 📝 Future Enhancements

- [ ] WebSocket for real-time updates
- [ ] Dashboard with charts (Chart.js)
- [ ] Email notifications on import failures
- [ ] Advanced filtering and search
- [ ] Job recommendations based on user preferences
- [ ] Rate limiting for API endpoints
- [ ] Data encryption for sensitive fields
- [ ] Microservices architecture split
- [ ] Kubernetes deployment
- [ ] GraphQL API alternative

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**License**: MIT
