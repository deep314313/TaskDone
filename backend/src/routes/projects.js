import express from 'express';
import { check, validationResult } from 'express-validator';
import Project from '../models/Project.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateProject = [
  check('name', 'Project name is required').not().isEmpty(),
  check('description', 'Project description is required').not().isEmpty()
];

// Create a new project (Admin only)
router.post('/', [auth, validateProject], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create projects' });
    }

    const { name, description, teamMembers } = req.body;

    const project = new Project({
      name,
      description,
      admin: req.user.id,
      teamMembers: teamMembers || []
    });

    await project.save();

    // Update team members' projects array
    if (teamMembers && teamMembers.length > 0) {
      await User.updateMany(
        { _id: { $in: teamMembers } },
        { $push: { projects: project._id } }
      );
    }

    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all projects (filtered by role)
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let projects;

    if (user.role === 'admin') {
      // Admins can see all projects they created
      projects = await Project.find({ admin: req.user.id })
        .populate('teamMembers', 'name email')
        .populate('admin', 'name email');
    } else {
      // Members can see projects they're part of
      projects = await Project.find({ teamMembers: req.user.id })
        .populate('teamMembers', 'name email')
        .populate('admin', 'name email');
    }

    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update project team members (Admin only)
router.put('/:id/team', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is admin and owns the project
    if (project.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const { teamMembers } = req.body;

    // Remove project from old team members' projects array
    await User.updateMany(
      { _id: { $in: project.teamMembers } },
      { $pull: { projects: project._id } }
    );

    // Add project to new team members' projects array
    await User.updateMany(
      { _id: { $in: teamMembers } },
      { $push: { projects: project._id } }
    );

    project.teamMembers = teamMembers;
    await project.save();

    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get project by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('teamMembers', 'name email')
      .populate('admin', 'name email')
      .populate('tasks');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to the project
    if (
      project.admin.toString() !== req.user.id &&
      !project.teamMembers.some(member => member._id.toString() === req.user.id)
    ) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;