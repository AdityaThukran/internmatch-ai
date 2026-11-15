const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['saved', 'applied', 'interviewing', 'offered', 'rejected'],
      default: 'saved',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
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
applicationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

applicationSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Compound index: one application per user per internship
applicationSchema.index({ userId: 1, internshipId: 1 }, { unique: true });
applicationSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
