import { connectDB, disconnectDB } from '@/server/config/database';
import Job from '@/server/models/Job';
import ImportLog from '@/server/models/ImportLog';

/**
 * Debug script to check database contents
 * Run with: npx tsx scripts/debug.ts
 */

async function debug() {
  try {
    console.log('🔍 Connecting to database...\n');
    await connectDB();

    // Check Jobs collection
    const jobCount = await Job.countDocuments();
    console.log(`📊 Total Jobs in database: ${jobCount}`);
    
    if (jobCount > 0) {
      const sample = await Job.findOne().exec();
      console.log('Sample Job:');
      console.log(JSON.stringify(sample, null, 2));
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Check ImportLog collection
    const logCount = await ImportLog.countDocuments();
    console.log(`📊 Total ImportLogs in database: ${logCount}`);
    
    if (logCount > 0) {
      const logs = await ImportLog.find().sort({ timestamp: -1 }).limit(3).exec();
      console.log('Recent Import Logs:');
      console.log(JSON.stringify(logs, null, 2));
    }

    console.log('\n' + '='.repeat(50) + '\n');
    console.log('✅ Debug complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await disconnectDB();
  }
}

debug().catch(console.error);
