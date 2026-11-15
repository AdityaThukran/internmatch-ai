const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, trim: true },
    degree: { type: String, trim: true },
    fieldOfStudy: { type: String, trim: true },
    startYear: { type: Number },
    endYear: { type: Number },
    gpa: { type: Number },
  },
  { _id: false }
);

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    degree: {
      type: String,
      trim: true,
      default: '',
    },
    institution: {
      type: String,
      trim: true,
      default: '',
    },
    education: {
      type: [educationSchema],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    preferredMode: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid', 'any'],
      default: 'any',
    },
    resumeFile: {
      type: String,
      default: '',
    },
    extractedProfile: {
      type: Object,
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    github: {
      type: String,
      trim: true,
      default: '',
    },
    linkedin: {
      type: String,
      trim: true,
      default: '',
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Update the updatedAt field before save
studentProfileSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

studentProfileSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Index for userId lookup
studentProfileSchema.index({ userId: 1 });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
