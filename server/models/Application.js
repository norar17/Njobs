import mongoose from 'mongoose';

const STATUSES = ['Pending', 'Reviewed', 'Accepted', 'Rejected'];

const applicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    coverLetter: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'Pending',
      index: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

applicationSchema.index({ applicant: 1, job: 1 }, { unique: true });

export const APPLICATION_STATUS_VALUES = STATUSES;

const Application = mongoose.model('Application', applicationSchema);

export default Application;
