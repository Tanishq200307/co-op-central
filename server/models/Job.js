const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      default: 'Remote',
      trim: true,
    },
    audienceType: {
      type: String,
      enum: ['public', 'all_universities', 'selected_universities'],
      required: true,
    },
    employmentType: {
      type: String,
      enum: ['coop', 'internship', 'part_time', 'full_time'],
      default: 'coop',
    },
    workMode: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite'],
      default: 'hybrid',
    },
    salaryMin: {
      type: Number,
      default: null,
    },
    salaryMax: {
      type: Number,
      default: null,
    },
    salaryCurrency: {
      type: String,
      default: 'CAD',
    },
    salaryPeriod: {
      type: String,
      enum: ['hourly', 'monthly', 'annual'],
      default: 'hourly',
    },
    workTerm: {
      type: String,
      default: '',
    },
    durationMonths: {
      type: Number,
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    skillsRequired: {
      type: [String],
      default: [],
    },
    skillsPreferred: {
      type: [String],
      default: [],
    },
    gpaRequirement: {
      type: Number,
      default: null,
    },
    selectedUniversities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University',
      },
    ],
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    applicantCount: {
      type: Number,
      default: 0,
    },
    isPromoted: {
      type: Boolean,
      default: false,
    },
    isEasyApply: {
      type: Boolean,
      default: true,
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
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

jobSchema.index({
  title: 'text',
  description: 'text',
  skillsRequired: 'text',
  location: 'text',
});
jobSchema.index({ postedAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
