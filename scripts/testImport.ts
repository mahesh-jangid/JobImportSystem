import { connectDB, disconnectDB } from '@/server/config/database';
import JobImportService from '@/server/services/JobImportService';
import JobFetcherService, { RawJob } from '@/server/services/JobFetcherService';
import Job from '@/server/models/Job';
import ImportLog from '@/server/models/ImportLog';

/**
 * Test script to manually import jobs and populate the database
 * Run with: npx tsx scripts/testImport.ts
 */

async function testImport() {
  try {
    console.log('🚀 Starting test import...\n');
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected');
    
    // Wait a moment for connection pool to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check initial state
    const initialJobCount = await Job.countDocuments();
    const initialLogCount = await ImportLog.countDocuments();
    console.log(`  Initial Jobs: ${initialJobCount}`);
    console.log(`  Initial Logs: ${initialLogCount}\n`);

    // Create sample jobs for testing
    const sampleJobs: RawJob[] = [
      {
        title: 'Senior React Developer',
        description: 'We are looking for an experienced React developer to join our team.',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        jobType: 'Full-time',
        category: 'development',
        salary: '$120,000 - $180,000',
        link: 'https://example.com/job1',
        postedDate: new Date(),
        sourceId: 'test-001',
      },
      {
        title: 'UX/UI Designer',
        description: 'Join our design team and create amazing user experiences.',
        company: 'Design Studio',
        location: 'New York, NY',
        jobType: 'Full-time',
        category: 'design',
        salary: '$90,000 - $130,000',
        link: 'https://example.com/job2',
        postedDate: new Date(),
        sourceId: 'test-002',
      },
      {
        title: 'Full Stack JavaScript Developer',
        description: 'Node.js and React experience required. Work on modern web applications.',
        company: 'StartUp Inc',
        location: 'Remote',
        jobType: 'Full-time',
        category: 'development',
        salary: '$100,000 - $150,000',
        link: 'https://example.com/job3',
        postedDate: new Date(Date.now() - 86400000),
        sourceId: 'test-003',
      },
      {
        title: 'Data Science Engineer',
        description: 'Help us build machine learning models at scale.',
        company: 'AI Solutions',
        location: 'Boston, MA',
        jobType: 'Full-time',
        category: 'data-science',
        salary: '$130,000 - $190,000',
        link: 'https://example.com/job4',
        postedDate: new Date(Date.now() - 172800000),
        sourceId: 'test-004',
      },
      {
        title: 'DevOps Engineer',
        description: 'Manage cloud infrastructure and CI/CD pipelines.',
        company: 'Cloud Systems',
        location: 'Austin, TX',
        jobType: 'Full-time',
        category: 'devops',
        salary: '$110,000 - $160,000',
        link: 'https://example.com/job5',
        postedDate: new Date(Date.now() - 259200000),
        sourceId: 'test-005',
      },
    ];

    // Import the sample jobs
    console.log(`📥 Importing ${sampleJobs.length} sample jobs...\n`);
    
    const result = await JobImportService.importJobs(
      sampleJobs,
      'test-source',
      'https://example.com/jobs'
    );

    console.log('\n📊 Import Results:');
    console.log(`  ✅ Total Imported: ${result.totalImported}`);
    console.log(`  🆕 New Jobs: ${result.newJobs}`);
    console.log(`  🔄 Updated Jobs: ${result.updatedJobs}`);
    console.log(`  ❌ Failed Jobs: ${result.failedJobs}`);
    
    if (result.failedDetails.length > 0) {
      console.log(`\n  Failed Details:`);
      result.failedDetails.forEach(f => {
        console.log(`    - ${f.sourceId}: ${f.reason}`);
      });
    }

    // Verify data was saved
    console.log('\n⏳ Verifying data...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const finalJobCount = await Job.countDocuments();
    const finalLogCount = await ImportLog.countDocuments();
    console.log(`  Final Jobs: ${finalJobCount}`);
    console.log(`  Final Logs: ${finalLogCount}`);
    
    // Show the import log
    const latestLog = await ImportLog.findOne().sort({ timestamp: -1 }).exec();
    if (latestLog) {
      console.log('\nLatest Import Log:');
      console.log(JSON.stringify(latestLog, null, 2));
    }

    console.log('\n✅ Test import completed successfully!');
    console.log('📍 Check http://localhost:3000/api/jobs/import-history?page=1 for results\n');

  } catch (error) {
    console.error('❌ Test import failed:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

// Run the test
testImport().catch(console.error);
