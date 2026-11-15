const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'recruiter'],
      default: 'student',
    },
    preferences: {
      type: Object,
      default: {},
    },
    notificationSettings: {
      emailEnabled: {
        type: Boolean,
        default: true,
      },
      weeklyDigest: {
        type: Boolean,
        default: true,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Index for email lookup
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
