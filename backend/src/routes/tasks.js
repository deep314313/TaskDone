import express from 'express';
import { check, validationResult } from 'express-validator';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateTask = [
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('project', 'Project ID is required').not().isEmpty(),
  check('assignedTo', 'Assigned user ID is required').not().isEmpty(),
  check('type', 'Task type is required').isIn(['bug', 'feature', 'improvement']),
  check('priority', 'Priority is required').isIn(['low', 'medium', 'high', 'urgent'])
];

// Create a new task (Admin only)
router.post('/', [auth, validateTask], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      project: projectId,
      assignedTo,
      type,
      priority,
      dueDate
    } = req.body;

    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create tasks' });
    }

    // Check if project exists and user is admin of the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create tasks for this project' });
    }

    // Check if assigned user is a team member
    if (!project.teamMembers.includes(assignedTo)) {
      return res.status(400).json({ message: 'Assigned user must be a team member' });
    }

    const task = new Task({
      title,
      description,
      project: projectId,
      assignedTo,
      assignedBy: req.user.id,
      type,
      priority,
      dueDate
    });

    await task.save();

    // Update project and user
    await Project.findByIdAndUpdate(projectId, { $push: { tasks: task._id } });
    await User.findByIdAndUpdate(assignedTo, { $push: { assignedTasks: task._id } });

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update task status (Team member)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['open', 'in_progress', 'review', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is assigned to the task
    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.status = status;
    await task.save();

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add comment to task
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is involved with the task
    const project = await Project.findById(task.project);
    if (
      task.assignedTo.toString() !== req.user.id &&
      project.admin.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized to comment on this task' });
    }

    task.comments.push({
      user: req.user.id,
      content
    });

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get tasks by project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to the project
    if (
      project.admin.toString() !== req.user.id &&
      !project.teamMembers.includes(req.user.id)
    ) {
      return res.status(403).json({ message: 'Not authorized to view these tasks' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('comments.user', 'name email');

    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get tasks assigned to user
router.get('/my-tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate('project', 'name')
      .populate('assignedBy', 'name email')
      .populate('comments.user', 'name email');

    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all tasks (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view all tasks' });
    }

    const tasks = await Task.find()
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('comments.user', 'name email');

    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;