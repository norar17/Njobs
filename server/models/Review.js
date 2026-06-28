import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      default: '',
      maxlength: 120,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: 2000,
    },
    jobTitleAtCompany: {
      type: String,
      trim: true,
      default: '',
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// One review per applicant per company
reviewSchema.index({ company: 1, author: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
