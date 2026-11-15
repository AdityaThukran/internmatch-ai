const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    organization: {
      type: String,
      required: [true, 'Organization is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    eligibility: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    mode: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid'],
      default: 'onsite',
    },
    stipend: {
      type: String,
      trim: true,
      default: '',
    },
    duration: {
      type: String,
      trim: true,
      default: '',
    },
    source: {
      type: String,
      trim: true,
      default: '',
    },
    applyUrl: {
      type: String,
      trim: true,
      default: '',
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: false,
  }
);

// Text index for search
internshipSchema.index({
  title: 'text',
  organization: 'text',
  description: 'text',
});

// Compound index for common queries
internshipSchema.index({ isActive: 1, postedAt: -1 });
internshipSchema.index({ skills: 1 });
internshipSchema.index({ location: 1 });
internshipSchema.index({ mode: 1 });

module.exports = mongoose.model('Internship', internshipSchema);
