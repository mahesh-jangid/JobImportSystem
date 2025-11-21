import { Queue, Worker } from 'bullmq';
import { getRedisClient } from '../config/redis';

export class QueueManager {
  private queue: Queue | null = null;
  private worker: Worker | null = null;
  async initializeQueue(queueName: string = 'job-import') {
    try {
      const redisClient = getRedisClient();

      // Create queue
      this.queue = new Queue(queueName, {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
      });

      console.log(`✅ Queue '${queueName}' initialized`);
      return this.queue;
    } catch (error) {
      console.error('❌ Error initializing queue:', error);
      throw error;
    }
  }

  async addJob(data: any, options: any = {}) {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }

    try {
      const job = await this.queue.add('import-job', data, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
        ...options,
      });

      console.log(`📌 Job added to queue: ${job.id}`);
      return job;
    } catch (error) {
      console.error('❌ Error adding job to queue:', error);
      throw error;
    }
  }

  async getQueue() {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }
    return this.queue;
  }

  async closeQueue() {
    if (this.worker) await this.worker.close();
    console.log('✅ Queue closed');
  }

  async getQueueStats() {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }

    const counts = await this.queue.getJobCounts();
    return {
      active: counts.active,
      waiting: counts.waiting,
      completed: counts.completed,
      failed: counts.failed,
      delayed: counts.delayed,
    };
  }
}

export default new QueueManager();
