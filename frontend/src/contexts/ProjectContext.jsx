import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const ProjectContext = createContext();

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProject = useCallback(async (name, description, teamMembers) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/projects',
        { name, description, teamMembers },
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        }
      );
      setProjects(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create project');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProjects(response.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch projects');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProjectById = useCallback(async (projectId) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCurrentProject(response.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch project');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProjectTeam = useCallback(async (projectId, teamMembers) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `/api/projects/${projectId}/team`,
        { teamMembers },
        {
          headers: {
            'x-auth-token': token
          }
        }
      );
      setCurrentProject(response.data);
      setProjects(prev =>
        prev.map(p => (p._id === response.data._id ? response.data : p))
      );
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update project team');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearProjectError = useCallback(() => {
    setError(null);
  }, []);

  const clearCurrentProject = useCallback(() => {
    setCurrentProject(null);
  }, []);

  const value = {
    projects,
    currentProject,
    loading,
    error,
    createProject,
    getProjects,
    getProjectById,
    updateProjectTeam,
    clearProjectError,
    clearCurrentProject
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};