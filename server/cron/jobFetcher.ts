import cron from 'node-cron';
import { connectDB, disconnectDB } from '../config/database';
import { connectRedis } from '../config/redis';
import { JOB_SOURCES } from '../services/JobFetcherService';
import QueueManager from '../services/QueueManager';

async function startCronJobs() {
  try {
    // Initialize connections
    await connectDB();
    await connectRedis();
    await QueueManager.initializeQueue();

    console.log('🕐 Initializing cron jobs...');

    // Schedule job fetching every 1 hour
    cron.schedule('0 * * * *', async () => {
      console.log('\n⏰ Running scheduled job fetch at:', new Date());

      try {
        for (const [sourceKey, url] of Object.entries(JOB_SOURCES)) {
          try {
            // Add job to queue
            await QueueManager.addJob({
              url,
              source: sourceKey,
              timestamp: new Date(),
            });

            console.log(`📌 Queued import job for ${sourceKey}`);
          } catch (error) {
            console.error(`❌ Error queueing ${sourceKey}:`, error);
          }
        }

        // Get queue stats
        const stats = await QueueManager.getQueueStats();
        console.log('📊 Queue Stats:', stats);
      } catch (error) {
        console.error('❌ Error in cron job execution:', error);
      }
    });

    // Optionally, run immediately on startup
    console.log('🚀 Scheduling first job fetch in 10 seconds...');
    setTimeout(async () => {
      console.log('\n⏰ Running initial job fetch');

      for (const [sourceKey, url] of Object.entries(JOB_SOURCES)) {
        try {
          await QueueManager.addJob({
            url,
            source: sourceKey,
            timestamp: new Date(),
          });
          console.log(`📌 Queued import job for ${sourceKey}`);
        } catch (error) {
          console.error(`❌ Error queueing ${sourceKey}:`, error);
        }
      }
    }, 10000);

    console.log('✅ Cron jobs initialized successfully!');
    console.log('📅 Schedule: Every hour at minute 0');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n📛 Shutting down cron scheduler...');
      cron.getTasks().forEach((task) => task.stop());
      await QueueManager.closeQueue();
      await disconnectDB();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error starting cron jobs:', error);
    process.exit(1);
  }
}

// Start cron scheduler
startCronJobs();
