import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TaskContext';
import { useProjects } from '../contexts/ProjectContext';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

const Tasks = () => {
  const { user } = useAuth();
  const { tasks, loading, error: taskError, getMyTasks, getAllTasks, createTask, updateTaskStatus, addTaskComment } = useTasks();
  const { projects, getProjects } = useProjects();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'bug',
    priority: 'medium',
    project: '',
    assignedTo: '',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending'
  });
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (user?.role === 'admin') {
      getAllTasks();
    } else {
      getMyTasks();
    }
    getProjects();
  }, [getMyTasks, getAllTasks, getProjects, user]);

  const handleCreateTask = async () => {
    try {
      await createTask({
        ...formData,
        projectId: formData.project
      });
      setOpenCreateDialog(false);
      setFormData({
        title: '',
        description: '',
        type: 'bug',
        priority: 'medium',
        project: '',
        assignedTo: '',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      });
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`/api/tasks/${taskId}`, {
          headers: {
            'x-auth-token': token
          }
        });
        if (response.status === 200) {
          if (user?.role === 'admin') {
            getAllTasks();
          } else {
            getMyTasks();
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete task');
        console.error('Error deleting task:', err);
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'review': return 'warning';
      case 'open': return 'default';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">Tasks</Typography>
            {user?.role === 'admin' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateDialog(true)}
              >
                Create Task
              </Button>
            )}
          </Box>

          {(error || taskError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || taskError}
            </Alert>
          )}

          <Box display="flex" gap={2} mb={3}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filterPriority}
                label="Priority"
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Grid container spacing={3}>
            {tasks
              .filter(task => 
                (filterPriority === 'all' || task.priority === filterPriority) &&
                (filterStatus === 'all' || task.status === filterStatus)
              )
              .map((task) => (
                <Grid item xs={12} md={6} lg={4} key={task._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {task.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {task.description}
                      </Typography>
                      <Box display="flex" gap={1} mb={2}>
                        <Chip
                          label={task.priority}
                          size="small"
                          color={getPriorityColor(task.priority)}
                        />
                        <Chip
                          label={task.status.replace('_', ' ')}
                          size="small"
                          color={getStatusColor(task.status)}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Project: {projects.find(p => p._id === task.projectId)?.name || 'N/A'}
                      </Typography>
                      {task.assignedTo && (
                        <Typography variant="body2" color="text.secondary">
                          Assigned to: {task.assignedTo.name || 'N/A'}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={task.status || ''}
                          onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                          size="small"
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="in_progress">In Progress</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedTask(task);
                          setOpenCommentDialog(true);
                        }}
                      >
                        <CommentIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteTask(task._id)}
                        sx={{ ml: 'auto' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Grid>
      </Grid>

      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Task Type</InputLabel>
            <Select
              value={formData.type}
              label="Task Type"
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <MenuItem value="bug">Bug</MenuItem>
              <MenuItem value="feature">Feature</MenuItem>
              <MenuItem value="improvement">Improvement</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              label="Priority"
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Project</InputLabel>
            <Select
              value={formData.project}
              label="Project"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  project: e.target.value,
                  assignedTo: ''
                });
              }}
            >
              {projects.map((project) => (
                <MenuItem key={project._id} value={project._id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {formData.project && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Assign To</InputLabel>
              <Select
                value={formData.assignedTo}
                label="Assign To"
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                {projects
                  .find(p => p._id === formData.project)?.teamMembers
                  .map((member) => (
                    <MenuItem key={member._id} value={member._id}>
                      {member.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            type="date"
            label="Due Date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openCommentDialog}
        onClose={() => setOpenCommentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Task Comments</DialogTitle>
        <DialogContent>
          {selectedTask?.comments && selectedTask.comments.map((comment, index) => (
            <Box key={index} sx={{ mb: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {comment.user.name} - {new Date(comment.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body2">{comment.content}</Typography>
            </Box>
          ))}
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={async () => {
                if (commentText.trim() && selectedTask) {
                  try {
                    await addTaskComment(selectedTask._id, commentText.trim());
                    setCommentText('');
                    if (user?.role === 'admin') {
                      getAllTasks();
                    } else {
                      getMyTasks();
                    }
                  } catch (err) {
                    console.error('Error adding comment:', err);
                  }
                }
              }}
              disabled={!commentText.trim()}
              startIcon={<SendIcon />}
            >
              Send
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCommentDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Tasks;