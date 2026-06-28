import mongoose from 'mongoose';

const CATEGORIES = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Customer Support',
  'Operations',
  'Finance',
  'Human Resources',
  'Other',
];

const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Executive'];

const JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Remote'];

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    salaryMin: {
      type: Number,
      default: null,
    },
    salaryMax: {
      type: Number,
      default: null,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      default: 'Other',
      index: true,
    },
    experienceLevel: {
      type: String,
      enum: EXPERIENCE_LEVELS,
      default: 'Entry Level',
      index: true,
    },
    jobType: {
      type: String,
      enum: JOB_TYPES,
      default: 'Full Time',
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'removed'],
      default: 'active',
      index: true,
    },
    applicationDeadline: {
      type: Date,
      default: null,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text' });

export const CATEGORY_VALUES = CATEGORIES;
export const EXPERIENCE_LEVEL_VALUES = EXPERIENCE_LEVELS;
export const JOB_TYPE_VALUES = JOB_TYPES;

const Job = mongoose.model('Job', jobSchema);

export default Job;
