const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    university: String,
    program: String,
    credential: String,
    startYear: Number,
    endYear: Number,
    gpa: Number,
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    company: String,
    title: String,
    startDate: Date,
    endDate: Date,
    description: String,
    current: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    link: String,
    techStack: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    headline: {
      type: String,
      default: '',
    },
    about: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    education: {
      type: [educationSchema],
      default: [],
    },
    experience: {
      type: [experienceSchema],
      default: [],
    },
    projects: {
      type: [projectSchema],
      default: [],
    },
    links: {
      linkedin: {
        type: String,
        default: '',
      },
      github: {
        type: String,
        default: '',
      },
      portfolio: {
        type: String,
        default: '',
      },
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    workPreference: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite', 'any'],
      default: 'any',
    },
    availability: {
      workTerm: {
        type: String,
        default: '',
      },
      startDate: {
        type: Date,
        default: null,
      },
      durationMonths: {
        type: Number,
        default: null,
      },
    },
    defaultResumeUrl: {
      type: String,
      default: '',
    },
    defaultResumeOriginalName: {
      type: String,
      default: '',
    },
    seedKey: {
      type: String,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
