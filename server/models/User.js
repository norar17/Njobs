import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ROLES = ['applicant', 'employer', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
    },
    googleId: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'applicant',
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    // Applicant-specific
    resume: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      fileName: { type: String, default: '' },
    },
    headline: { type: String, default: '', trim: true },
    phone: { type: String, default: null, trim: true },
    skills: [{ type: String, trim: true }],
    bookmarkedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    recentlyViewedJobs: [
      {
        job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    
    isBanned: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: 'string' } } }
);

userSchema.pre('validate', function (next) {
  if (this.authProvider === 'local' && !this.password) {
    this.invalidate('password', 'Password is required');
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    authProvider: this.authProvider,
    hasPassword: !!this.password,
    avatar: this.avatar,
    resume: this.resume,
    headline: this.headline,
    phone: this.phone || '',
    skills: this.skills,
    bookmarkedJobs: this.bookmarkedJobs,
    isBanned: this.isBanned,
    isEmailVerified: this.isEmailVerified,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

export const ROLE_VALUES = ROLES;

const User = mongoose.model('User', userSchema);

export default User;
