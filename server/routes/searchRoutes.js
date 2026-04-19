const express = require('express');
const Company = require('../models/Company');
const Job = require('../models/Job');

const router = express.Router();

router.get('/suggest', async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) {
      return res.json({ jobs: [], companies: [], skills: [] });
    }

    const regex = new RegExp(q, 'i');
    const [jobs, companies, skills] = await Promise.all([
      Job.find({ title: regex }).select('title _id').limit(5).lean(),
      Company.find({ name: regex }).select('name slug logoUrl').limit(5).lean(),
      Job.aggregate([
        {
          $project: {
            skills: { $concatArrays: ['$skillsRequired', '$skillsPreferred'] },
          },
        },
        { $unwind: '$skills' },
        { $match: { skills: regex } },
        { $group: { _id: '$skills' } },
        { $limit: 8 },
      ]),
    ]);

    res.json({
      jobs,
      companies,
      skills: skills.map((skill) => skill._id),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Could not load suggestions.' });
  }
});

module.exports = router;
