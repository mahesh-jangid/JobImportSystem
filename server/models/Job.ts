import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  company: string;
  location: string;
  jobType: string;
  category: string;
  salary?: string;
  link: string;
  source: string;
  sourceId: string;
  postedDate: Date;
  externalId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, required: true },
    company: { type: String, required: true, index: true },
    location: { type: String, required: true },
    jobType: { type: String, required: true },
    category: { type: String, required: true, index: true },
    salary: { type: String },
    link: { type: String, required: true, unique: true },
    source: { type: String, required: true, index: true },
    sourceId: { type: String, required: true, index: true },
    postedDate: { type: Date, required: true },
    externalId: { type: String, required: true, unique: true, sparse: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema);
