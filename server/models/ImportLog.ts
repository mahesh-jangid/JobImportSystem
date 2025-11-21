import mongoose, { Schema, Document } from 'mongoose';

interface IFailedJob {
  sourceId: string;
  reason: string;
  jobData?: Record<string, any>;
}

export interface IImportLog extends Document {
  url: string;
  source: string;
  timestamp: Date;
  totalFetched: number;
  totalImported: number;
  newJobs: number;
  updatedJobs: number;
  failedJobs: number;
  failedJobsDetails: IFailedJob[];
  duration: number;
  status: 'success' | 'partial' | 'failed';
  errorMessage?: string;
}

const importLogSchema = new Schema<IImportLog>(
  {
    url: { type: String, required: true, index: true },
    source: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    totalFetched: { type: Number, default: 0 },
    totalImported: { type: Number, default: 0 },
    newJobs: { type: Number, default: 0 },
    updatedJobs: { type: Number, default: 0 },
    failedJobs: { type: Number, default: 0 },
    failedJobsDetails: [
      {
        sourceId: String,
        reason: String,
        jobData: Schema.Types.Mixed,
      },
    ],
    duration: { type: Number, default: 0 },
    status: { type: String, enum: ['success', 'partial', 'failed'], default: 'success' },
    errorMessage: String,
  },
  { timestamps: true }
);

export default mongoose.models.ImportLog || mongoose.model<IImportLog>('ImportLog', importLogSchema);
