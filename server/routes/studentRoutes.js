const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const StudentProfile = require('../models/StudentProfile');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      user: req.user._id,
    }).populate('user', 'name email');
    res.json({ profile });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Could not load profile.' });
  }
});

router.put('/me', protect, async (req, res) => {
  try {
    const updates = req.body;
    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updates },
      { new: true, upsert: true }
    ).populate('user', 'name email');

    res.json({ profile });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Could not update profile.' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const applications = await Application.find({
      student: req.params.id,
    }).populate('job', 'employer');
    const canView = applications.some(
      (application) =>
        application.job?.employer?.toString() === req.user._id.toString()
    );

    if (!canView) {
      return res
        .status(403)
        .json({ message: 'You do not have access to this profile.' });
    }

    const profile = await StudentProfile.findOne({
      user: req.params.id,
    }).populate('user', 'name email');
    const jobs = await Job.find({ employer: req.user._id }).select('_id title');

    res.json({ profile, jobs });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Could not load student profile.' });
  }
});

module.exports = router;
