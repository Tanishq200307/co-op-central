const express = require('express');
const StudentProfile = require('../models/StudentProfile');
const University = require('../models/University');
const Job = require('../models/Job');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/authMiddleware');
const { domainMatches, extractDomain } = require('../utils/extractDomain');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const universities = await University.find({}).sort({ name: 1 });
    res.json(universities);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch universities.' });
  }
});

router.get(
  '/dashboard',
  protect,
  requireRole('university'),
  async (req, res) => {
    try {
      const university = await University.findById(req.user.universityId);
      if (!university) {
        return res
          .status(404)
          .json({ message: 'University record not found.' });
      }

      const jobs = await Job.find({
        $or: [
          { audienceType: 'all_universities' },
          {
            audienceType: 'selected_universities',
            selectedUniversities: university._id,
          },
        ],
      })
        .populate('company')
        .populate('employer', 'name email')
        .populate('selectedUniversities', 'name')
        .sort({ postedAt: -1 })
        .lean();

      const studentUsers = await User.find({ role: 'student' })
        .select('_id name email')
        .lean();
      const matchedStudents = studentUsers.filter((student) =>
        domainMatches(extractDomain(student.email), university.domain)
      );

      const profiles = await StudentProfile.find({
        user: { $in: matchedStudents.map((student) => student._id) },
      }).lean();

      const profileMap = new Map(
        profiles.map((profile) => [profile.user.toString(), profile])
      );

      res.json({
        university,
        jobs,
        stats: {
          studentsRegistered: matchedStudents.length,
          jobsTargetingUniversity: jobs.length,
        },
        students: matchedStudents.map((student) => ({
          ...student,
          profile: profileMap.get(student._id.toString()) || null,
        })),
      });
    } catch (error) {
      res.status(500).json({ message: 'Could not load university dashboard.' });
    }
  }
);

module.exports = router;
