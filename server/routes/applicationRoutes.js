const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect, requireRole } = require('../middleware/authMiddleware');
const createNotification = require('../utils/createNotification');

const router = express.Router();

router.get('/mine', protect, requireRole('student'), async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate({
        path: 'job',
        populate: {
          path: 'company',
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ applications });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Could not load applications.' });
  }
});

router.patch(
  '/:id/status',
  protect,
  requireRole('employer'),
  async (req, res) => {
    try {
      const { status, note = '' } = req.body;
      const application = await Application.findById(req.params.id)
        .populate('job')
        .populate('student', 'name');

      if (
        !application ||
        application.job?.employer?.toString() !== req.user._id.toString()
      ) {
        return res.status(404).json({ message: 'Application not found.' });
      }

      application.status = status;
      application.statusHistory.push({ status, changedAt: new Date(), note });
      application.viewedByEmployerAt = new Date();
      await application.save();

      await createNotification({
        user: application.student._id,
        type: 'application_status',
        title: 'Application update',
        body: `Your application for ${application.job.title} is now ${status.replaceAll('_', ' ')}.`,
        link: '/applications',
      });

      res.json({ application });
    } catch (error) {
      res
        .status(500)
        .json({
          message: error.message || 'Could not update application status.',
        });
    }
  }
);

router.post(
  '/:id/withdraw',
  protect,
  requireRole('student'),
  async (req, res) => {
    try {
      const application = await Application.findById(req.params.id).populate(
        'job'
      );

      if (
        !application ||
        application.student.toString() !== req.user._id.toString()
      ) {
        return res.status(404).json({ message: 'Application not found.' });
      }

      application.status = 'withdrawn';
      application.statusHistory.push({
        status: 'withdrawn',
        changedAt: new Date(),
        note: 'Withdrawn by student.',
      });
      await application.save();

      await Job.findByIdAndUpdate(application.job._id, {
        $inc: { applicantCount: -1 },
      });

      res.json({ application });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || 'Could not withdraw application.' });
    }
  }
);

module.exports = router;
