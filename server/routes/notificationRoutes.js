const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });
    res.json({ notifications, unreadCount });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Could not load notifications.' });
  }
});

router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { read: true } },
      { new: true }
    );

    res.json({ notification });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Could not update notification.' });
  }
});

router.post('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    res
      .status(500)
      .json({
        message: error.message || 'Could not mark notifications as read.',
      });
  }
});

module.exports = router;
