import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all team members (for admin)
router.get('/team-members', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view team members' });
    }

    const teamMembers = await User.find(
      { role: 'member' },
      'name email projects assignedTasks'
    );
    res.json(teamMembers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('projects')
      .populate('assignedTasks');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get specific user by ID (admin only)
router.get('/:id', auth, async (req, res) => {
  try {
    const requestingUser = await User.findById(req.user.id);
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view user details' });
    }

    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('projects')
      .populate('assignedTasks');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;