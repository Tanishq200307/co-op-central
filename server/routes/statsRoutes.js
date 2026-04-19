const express = require('express');
const Company = require('../models/Company');
const Job = require('../models/Job');
const University = require('../models/University');
const User = require('../models/User');

const router = express.Router();

router.get('/home', async (_req, res) => {
  try {
    const [openJobs, hiringCompanies, universityPartners, students] =
      await Promise.all([
        Job.countDocuments({}),
        Company.countDocuments({}),
        University.countDocuments({}),
        User.countDocuments({ role: 'student' }),
      ]);

    res.json({
      openJobs,
      hiringCompanies,
      universityPartners,
      students,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Could not load home stats.',
    });
  }
});

module.exports = router;
