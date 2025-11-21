import { Worker, Job } from 'bullmq';
import { connectDB, disconnectDB } from '../config/database';
import { connectRedis, getRedisClient } from '../config/redis';
import JobFetcherService from '../services/JobFetcherService';
import JobImportService from '../services/JobImportService';

async function setupWorker() {
  try {
    // Initialize connections
    await connectDB();
    const redis = await connectRedis();

    const worker = new Worker(
      'job-import',
      async (job: Job) => {
        console.log(`🔄 Processing job ${job.id}:`, job.data);

        try {
          const { url, source } = job.data;

          // Fetch jobs from API
          const rawJobs = await JobFetcherService.fetchJobs(url, source);

          // Import jobs to database
          const result = await JobImportService.importJobs(rawJobs, source, url);

          return {
            success: true,
            result,
          };
        } catch (error) {
          console.error(`❌ Error processing job ${job.id}:`, error);
          throw error;
        }
      },
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
        concurrency: 5, // Process 5 jobs concurrently
      }
    );

    // Event handlers
    worker.on('completed', (job: Job) => {
      console.log(`✅ Job ${job.id} completed`);
    });

    worker.on('failed', (job: Job | undefined, err: Error) => {
      console.error(`❌ Job ${job?.id} failed:`, err.message);
    });

    console.log('🚀 Worker started and listening for jobs...');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n📛 Shutting down worker...');
      await worker.close();
      await disconnectDB();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error setting up worker:', error);
    process.exit(1);
  }
}

// Start worker
setupWorker();
