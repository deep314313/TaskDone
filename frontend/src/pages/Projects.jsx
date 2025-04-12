import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';

const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, loading, error: projectError, getProjects, createProject, updateProjectTeam } = useProjects();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openTeamDialog, setOpenTeamDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teamMembers: []
  });

  useEffect(() => {
    getProjects();
    if (user?.role === 'admin') {
      fetchAvailableMembers();
    }
  }, [getProjects, user]);



  const fetchAvailableMembers = async () => {
    try {
      const response = await fetch('/api/users/team-members', {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        setAvailableMembers(data);
      } else {
        setError(data.message || 'Failed to fetch team members');
      }
    } catch (err) {
      setError('Failed to fetch team members');
      console.error('Error fetching team members:', err);
    }
  };

  const handleCreateProject = async () => {
    try {
      await createProject(formData.name, formData.description, formData.teamMembers);
      setOpenCreateDialog(false);
      setFormData({ name: '', description: '', teamMembers: [] });
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleUpdateTeam = async () => {
    try {
      await updateProjectTeam(selectedProject._id, formData.teamMembers);
      setOpenTeamDialog(false);
    } catch (err) {
      console.error('Failed to update team members:', err);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          setProjects(projects.filter(p => p._id !== projectId));
        } else {
          const data = await response.json();
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to delete project');
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">Projects</Typography>
            {user?.role === 'admin' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateDialog(true)}
              >
                Create Project
              </Button>
            )}
          </Box>

          {(error || projectError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || projectError}
            </Alert>
          )}

          <Grid container spacing={3}>
            {projects
              .filter(project => 
                user?.role === 'admin' || 
                project.teamMembers.some(member => member._id === user?._id)
              )
              .map((project) => (
              <Grid item xs={12} md={6} lg={4} key={project._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {project.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {project.description}
                    </Typography>
                    <Box display="flex" gap={1} mb={2}>
                      <Chip
                        label={`${project.teamMembers.length} Members`}
                        size="small"
                        icon={<PeopleIcon />}
                      />
                      <Chip
                        label={project.status}
                        size="small"
                        color={project.status === 'active' ? 'success' : 'default'}
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => navigate(`/app/projects/${project._id}`)}
                    >
                      View Details
                    </Button>
                    {user?.role === 'admin' && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedProject(project);
                            setFormData({ ...formData, teamMembers: project.teamMembers });
                            setOpenTeamDialog(true);
                          }}
                        >
                          <PeopleIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteProject(project._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Create Project Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Team Members</InputLabel>
            <Select
              multiple
              value={formData.teamMembers}
              onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
              label="Team Members"
            >
              {availableMembers.map((member) => (
                <MenuItem key={member._id} value={member._id}>
                  {member.name} ({member.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateProject} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Team Dialog */}
      <Dialog open={openTeamDialog} onClose={() => setOpenTeamDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Team Members</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Team Members</InputLabel>
            <Select
              multiple
              value={formData.teamMembers}
              onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
              label="Team Members"
            >
              {availableMembers.map((member) => (
                <MenuItem key={member._id} value={member._id}>
                  {member.name} ({member.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTeamDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateTeam} variant="contained">
            Update Team
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Projects;