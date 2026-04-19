const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      default: '',
    },
    headcountRange: {
      type: String,
      default: '',
    },
    headquarters: {
      type: String,
      default: '',
    },
    about: {
      type: String,
      default: '',
    },
    foundedYear: {
      type: Number,
      default: null,
    },
    specialties: {
      type: [String],
      default: [],
    },
    cultureTags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

companySchema.index({ name: 1 });

module.exports = mongoose.model('Company', companySchema);
