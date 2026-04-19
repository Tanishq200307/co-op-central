const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    resumeOriginalName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'submitted',
        'in_review',
        'interview',
        'offer',
        'rejected',
        'withdrawn',
      ],
      default: 'submitted',
    },
    statusHistory: {
      type: [
        {
          status: {
            type: String,
            enum: [
              'submitted',
              'in_review',
              'interview',
              'offer',
              'rejected',
              'withdrawn',
            ],
          },
          changedAt: {
            type: Date,
            default: Date.now,
          },
          note: {
            type: String,
            default: '',
          },
        },
      ],
      default: () => [
        {
          status: 'submitted',
          changedAt: new Date(),
          note: 'Application received.',
        },
      ],
    },
    coverLetter: {
      type: String,
      default: '',
    },
    viewedByEmployerAt: {
      type: Date,
      default: null,
    },
    seedKey: {
      type: String,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
