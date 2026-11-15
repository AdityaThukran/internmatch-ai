const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: true,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    matchedSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    matchDetails: {
      type: Object,
      default: {},
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index: one recommendation per user per internship
recommendationSchema.index({ userId: 1, internshipId: 1 }, { unique: true });
recommendationSchema.index({ userId: 1, matchScore: -1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);
