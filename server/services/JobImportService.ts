import Job from '../models/Job';
import ImportLog from '../models/ImportLog';
import { RawJob } from './JobFetcherService';

export interface ImportResult {
  totalImported: number;
  newJobs: number;
  updatedJobs: number;
  failedJobs: number;
  failedDetails: Array<{ sourceId: string; reason: string }>;
}

export class JobImportService {
  async importJobs(
    rawJobs: RawJob[],
    source: string,
    url: string
  ): Promise<ImportResult> {
    const result: ImportResult = {
      totalImported: 0,
      newJobs: 0,
      updatedJobs: 0,
      failedJobs: 0,
      failedDetails: [],
    };

    const startTime = Date.now();

    for (const rawJob of rawJobs) {
      try {
        const existingJob = await Job.findOne({ link: rawJob.link });

        if (existingJob) {
          // Update existing job
          await Job.updateOne(
            { _id: existingJob._id },
            {
              title: rawJob.title,
              description: rawJob.description,
              company: rawJob.company,
              location: rawJob.location,
              jobType: rawJob.jobType,
              category: rawJob.category,
              salary: rawJob.salary,
              postedDate: rawJob.postedDate,
            }
          );
          result.updatedJobs++;
        } else {
          // Create new job
          await Job.create({
            title: rawJob.title,
            description: rawJob.description,
            company: rawJob.company,
            location: rawJob.location,
            jobType: rawJob.jobType,
            category: rawJob.category,
            salary: rawJob.salary,
            link: rawJob.link,
            source,
            sourceId: rawJob.sourceId,
            postedDate: rawJob.postedDate,
            externalId: rawJob.sourceId,
          });
          result.newJobs++;
        }

        result.totalImported++;
      } catch (error) {
        result.failedJobs++;
        result.failedDetails.push({
          sourceId: rawJob.sourceId,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
        console.error(`❌ Error importing job ${rawJob.sourceId}:`, error);
      }
    }

    const duration = Date.now() - startTime;

    // Log the import
    await this.logImport({
      url,
      source,
      totalFetched: rawJobs.length,
      totalImported: result.totalImported,
      newJobs: result.newJobs,
      updatedJobs: result.updatedJobs,
      failedJobs: result.failedJobs,
      failedJobsDetails: result.failedDetails.map((f) => ({
        sourceId: f.sourceId,
        reason: f.reason,
      })),
      duration,
      status: result.failedJobs === 0 ? 'success' : result.totalImported > 0 ? 'partial' : 'failed',
    });

    return result;
  }

  private async logImport(logData: any) {
    try {
      await ImportLog.create(logData);
      console.log(`📊 Import logged for ${logData.source}`);
    } catch (error) {
      console.error('❌ Error logging import:', error);
    }
  }

  async getImportHistory(limit: number = 50, page: number = 1) {
    try {
      const skip = (page - 1) * limit;
      
      // Fetch logs with appropriate timeout
      const logs = await ImportLog.find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip)
        .lean()
        .exec()
        .then((result) => {
          if (!result) return [];
          return result;
        });

      // Count total documents separately for better performance
      const total = await ImportLog.countDocuments().exec();

      return {
        logs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('❌ Error fetching import history:', error);
      throw error;
    }
  }

  async getImportStats() {
    try {
      const stats = await ImportLog.aggregate([
        {
          $group: {
            _id: '$source',
            totalImports: { $sum: 1 },
            totalJobs: { $sum: '$totalImported' },
            newJobs: { $sum: '$newJobs' },
            updatedJobs: { $sum: '$updatedJobs' },
            failedJobs: { $sum: '$failedJobs' },
            avgDuration: { $avg: '$duration' },
          },
        },
        { $sort: { totalImports: -1 } },
      ]);

      return stats;
    } catch (error) {
      console.error('❌ Error fetching import stats:', error);
      throw error;
    }
  }
}

export default new JobImportService();
