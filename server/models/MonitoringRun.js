const mongoose = require('mongoose');

const monitoringRunSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      trim: true,
      default: 'weekly-cron',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['running', 'completed', 'failed'],
      default: 'running',
    },
    newListingCount: {
      type: Number,
      default: 0,
    },
    matchedStudentCount: {
      type: Number,
      default: 0,
    },
    errors: {
      type: [String],
      default: [],
    },
    duration: {
      type: Number, // in milliseconds
      default: 0,
    },
  },
  {
    timestamps: false,
  }
);

monitoringRunSchema.index({ startedAt: -1 });

module.exports = mongoose.model('MonitoringRun', monitoringRunSchema);
