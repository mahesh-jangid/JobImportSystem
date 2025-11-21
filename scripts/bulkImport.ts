import { connectDB, disconnectDB } from '@/server/config/database';
import JobImportService from '@/server/services/JobImportService';
import { RawJob } from '@/server/services/JobFetcherService';

/**
 * Bulk import script to populate database with lots of test data
 * Run with: npx tsx scripts/bulkImport.ts
 */

function generateSampleJobs(count: number): RawJob[] {
  const companies = [
    'Tech Corp', 'Design Studio', 'StartUp Inc', 'AI Solutions', 'Cloud Systems',
    'Data Analytics', 'Web Services', 'Mobile Innovations', 'DevOps Pro', 'Frontend Experts',
    'Backend Masters', 'Full Stack Labs', 'Machine Learning Co', 'Cloud Native Inc', 'Security First'
  ];

  const locations = [
    'San Francisco, CA', 'New York, NY', 'Remote', 'Austin, TX', 'Boston, MA',
    'Seattle, WA', 'Chicago, IL', 'Los Angeles, CA', 'Denver, CO', 'Portland, OR',
    'London, UK', 'Toronto, Canada', 'Berlin, Germany', 'Tokyo, Japan', 'Sydney, Australia'
  ];

  const titles = [
    'Senior React Developer', 'UX/UI Designer', 'Full Stack JavaScript Developer',
    'Data Science Engineer', 'DevOps Engineer', 'Python Backend Developer',
    'Mobile App Developer', 'Cloud Architect', 'Machine Learning Engineer',
    'Frontend Developer', 'Database Administrator', 'QA Engineer',
    'Product Manager', 'Technical Lead', 'Solutions Architect'
  ];

  const categories = [
    'development', 'design', 'data-science', 'devops', 'management',
    'sales', 'marketing', 'analytics', 'security', 'infrastructure'
  ];

  const jobs: RawJob[] = [];

  for (let i = 0; i < count; i++) {
    const company = companies[i % companies.length];
    const location = locations[i % locations.length];
    const title = titles[i % titles.length];
    const category = categories[i % categories.length];
    const salary = `$${80000 + (i * 1000) % 150000} - $${130000 + (i * 1000) % 150000}`;
    
    jobs.push({
      title: `${title} #${i + 1}`,
      description: `Join ${company} and make an impact! We're looking for talented professionals to join our team. ${title} role based in ${location}. Competitive salary and benefits package.`,
      company,
      location,
      jobType: 'Full-time',
      category,
      salary,
      link: `https://example.com/job-${i + 1}`,
      postedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      sourceId: `bulk-${i + 1}-${Date.now()}`,
    });
  }

  return jobs;
}

async function bulkImport() {
  try {
    console.log('🚀 Starting bulk import...\n');
    
    await connectDB();
    console.log('✅ Database connected\n');
    
    const batchSize = 50;
    const totalJobs = 500; // Import 500 jobs in 10 batches
    const numBatches = Math.ceil(totalJobs / batchSize);

    for (let batch = 0; batch < numBatches; batch++) {
      const startIdx = batch * batchSize;
      const endIdx = Math.min((batch + 1) * batchSize, totalJobs);
      const batchJobs = generateSampleJobs(endIdx - startIdx);

      console.log(`📥 Batch ${batch + 1}/${numBatches}: Importing ${batchJobs.length} jobs...`);

      const result = await JobImportService.importJobs(
        batchJobs,
        `bulk-source-${batch + 1}`,
        `https://example.com/jobs?batch=${batch + 1}`
      );

      console.log(`  ✅ Imported: ${result.totalImported}`);
      console.log(`  🆕 New: ${result.newJobs} | 🔄 Updated: ${result.updatedJobs} | ❌ Failed: ${result.failedJobs}\n`);

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('✅ Bulk import completed successfully!');
    console.log('📍 Check http://localhost:3000/api/jobs/import-history for results\n');

  } catch (error) {
    console.error('❌ Bulk import failed:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

bulkImport().catch(console.error);
