import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectContext';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { getProjectById } = useProjects();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [error, setError] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    type: 'bug',
    priority: 'medium',
    dueDate: ''
  });

  useEffect(() => {
    const loadProjectData = async () => {
      try {
        const projectData = await getProjectById(id);
        setProject(projectData);
        fetchProjectTasks();
      } catch (err) {
        setError('Failed to fetch project details');
      }
    };
    loadProjectData();
  }, [id, getProjectById]);



  const fetchProjectTasks = async () => {
    try {
      const response = await fetch(`/api/projects/${id}/tasks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setTasks(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch project tasks');
    }
  };

  const handleCreateTask = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...taskFormData,
          project: id
        })
      });
      const data = await response.json();
      if (response.ok) {
        setTasks([...tasks, data]);
        setOpenTaskDialog(false);
        setTaskFormData({
          title: '',
          description: '',
          assignedTo: '',
          type: 'bug',
          priority: 'medium',
          dueDate: ''
        });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (response.ok) {
        setTasks(tasks.map(task => task._id === taskId ? data : task));
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to update task status');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'success',
      medium: 'info',
      high: 'warning',
      urgent: 'error'
    };
    return colors[priority] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'default',
      in_progress: 'info',
      review: 'warning',
      completed: 'success'
    };
    return colors[status] || 'default';
  };

  if (!project) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4">{project.name}</Typography>
              {user?.role === 'admin' && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenTaskDialog(true)}
                >
                  Create Task
                </Button>
              )}
            </Box>

            <Typography variant="body1" paragraph>
              {project.description}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Tasks
            </Typography>

            <List>
              {tasks.map((task) => (
                <ListItem
                  key={task._id}
                  component={Paper}
                  variant="outlined"
                  sx={{ mb: 2, p: 2 }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">{task.title}</Typography>
                        <Chip
                          label={task.type}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                        <Chip
                          label={task.priority}
                          size="small"
                          color={getPriorityColor(task.priority)}
                        />
                        <Chip
                          label={task.status}
                          size="small"
                          color={getStatusColor(task.status)}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" paragraph>
                          {task.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Assigned to: {task.assignedTo?.name || 'Unassigned'}
                          {task.dueDate && ` • Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    {(user?.role === 'admin' || user?._id === task.assignedTo?._id) && (
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={task.status}
                          onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                          variant="outlined"
                        >
                          <MenuItem value="open">Open</MenuItem>
                          <MenuItem value="in_progress">In Progress</MenuItem>
                          <MenuItem value="review">Review</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Create Task Dialog */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            value={taskFormData.title}
            onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={taskFormData.description}
            onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Assign To</InputLabel>
            <Select
              value={taskFormData.assignedTo}
              onChange={(e) => setTaskFormData({ ...taskFormData, assignedTo: e.target.value })}
              label="Assign To"
            >
              {project.teamMembers.map((member) => (
                <MenuItem key={member._id} value={member._id}>
                  {member.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select
              value={taskFormData.type}
              onChange={(e) => setTaskFormData({ ...taskFormData, type: e.target.value })}
              label="Type"
            >
              <MenuItem value="bug">Bug</MenuItem>
              <MenuItem value="feature">Feature</MenuItem>
              <MenuItem value="improvement">Improvement</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select
              value={taskFormData.priority}
              onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={taskFormData.dueDate}
            onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectDetails;