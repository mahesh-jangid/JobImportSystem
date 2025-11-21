import { connectDB, disconnectDB } from '@/server/config/database';
import JobImportService from '@/server/services/JobImportService';
import { RawJob } from '@/server/services/JobFetcherService';

/**
 * Script to import jobs with some intentional failures
 * Run with: npx tsx scripts/importWithFailures.ts
 */

function generateJobsWithDuplicates(): RawJob[] {
  const jobs: RawJob[] = [];

  // Add some valid jobs
  for (let i = 1; i <= 5; i++) {
    jobs.push({
      title: `Developer Position ${i}`,
      description: `Job description for position ${i}`,
      company: `Company ${i}`,
      location: `City ${i}`,
      jobType: 'Full-time',
      category: 'development',
      salary: `$${100000 + i * 10000}`,
      link: `https://example.com/job-failure-${i}`,
      postedDate: new Date(),
      sourceId: `fail-job-${i}`,
    });
  }

  // Add duplicate jobs (same link) - these will cause failures/updates
  for (let i = 1; i <= 3; i++) {
    jobs.push({
      title: `Duplicate Developer Position ${i}`,
      description: `Updated job description for position ${i}`,
      company: `Updated Company ${i}`,
      location: `Updated City ${i}`,
      jobType: 'Full-time',
      category: 'development',
      salary: `$${120000 + i * 10000}`,
      link: `https://example.com/job-failure-${i}`, // Same link - will be detected as duplicate
      postedDate: new Date(),
      sourceId: `fail-job-duplicate-${i}`,
    });
  }

  // Add jobs with missing required fields (these will cause failures)
  jobs.push({
    title: '', // Empty title - will cause validation error
    description: 'Job with no title',
    company: 'Company X',
    location: 'Location X',
    jobType: 'Full-time',
    category: 'development',
    link: `https://example.com/job-failure-invalid-1`,
    postedDate: new Date(),
    sourceId: 'fail-invalid-1',
  } as any);

  return jobs;
}

async function importWithFailures() {
  try {
    console.log('🚀 Starting import with intentional failures...\n');
    
    await connectDB();
    console.log('✅ Database connected\n');

    const jobs = generateJobsWithDuplicates();
    console.log(`📥 Importing ${jobs.length} jobs (some will fail)...\n`);

    const result = await JobImportService.importJobs(
      jobs,
      'failure-test-source',
      'https://example.com/jobs-with-failures'
    );

    console.log('\n📊 Import Results:');
    console.log(`  ✅ Total Imported: ${result.totalImported}`);
    console.log(`  🆕 New Jobs: ${result.newJobs}`);
    console.log(`  🔄 Updated Jobs: ${result.updatedJobs}`);
    console.log(`  ❌ Failed Jobs: ${result.failedJobs}`);
    
    if (result.failedDetails.length > 0) {
      console.log(`\n  📋 Failed Job Details:`);
      result.failedDetails.forEach(f => {
        console.log(`    - ${f.sourceId}: ${f.reason}`);
      });
    }

    console.log('\n✅ Import with failures completed!');
    console.log('📍 Check http://localhost:3000/api/jobs/import-history?page=1 for results\n');
    console.log('You should now see an import log with:');
    console.log('  - totalFetched: number of jobs attempted');
    console.log('  - totalImported: successfully imported');
    console.log('  - newJobs: newly created');
    console.log('  - updatedJobs: records updated');
    console.log('  - failedJobs: failed imports');
    console.log('  - failedJobsDetails: array with error reasons\n');

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

importWithFailures().catch(console.error);
