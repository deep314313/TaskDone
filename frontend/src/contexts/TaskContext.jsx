import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const TaskContext = createContext();

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [projectTasks, setProjectTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createTask = useCallback(async (taskData) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/tasks',
        taskData,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        }
      );
      setTasks(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create task');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProjectTasks = useCallback(async (projectId) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/tasks/project/${projectId}`, {
        headers: {
          'x-auth-token': token
        }
      });
      setProjectTasks(response.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch project tasks');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMyTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/tasks/my-tasks', {
        headers: {
          'x-auth-token': token
        }
      });
      setTasks(response.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch your tasks');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/tasks', {
        headers: {
          'x-auth-token': token
        }
      });
      setTasks(response.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch all tasks');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTaskStatus = useCallback(async (taskId, status) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `/api/tasks/${taskId}/status`,
        { status },
        {
          headers: {
            'x-auth-token': token
          }
        }
      );
      const updatedTask = response.data;

      setProjectTasks(prev =>
        prev.map(t => (t._id === updatedTask._id ? updatedTask : t))
      );
      setTasks(prev =>
        prev.map(t => (t._id === updatedTask._id ? updatedTask : t))
      );

      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update task status');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const addTaskComment = useCallback(async (taskId, content) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/tasks/${taskId}/comments`,
        { content },
        {
          headers: {
            'x-auth-token': token
          }
        }
      );
      const updatedTask = response.data;

      setProjectTasks(prev =>
        prev.map(t => (t._id === updatedTask._id ? updatedTask : t))
      );
      setTasks(prev =>
        prev.map(t => (t._id === updatedTask._id ? updatedTask : t))
      );

      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add comment');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearTaskError = useCallback(() => {
    setError(null);
  }, []);

  const clearTasks = useCallback(() => {
    setTasks([]);
    setProjectTasks([]);
  }, []);

  const value = {
    tasks,
    projectTasks,
    loading,
    error,
    createTask,
    getProjectTasks,
    getMyTasks,
    getAllTasks,
    updateTaskStatus,
    addTaskComment,
    clearTaskError,
    clearTasks
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};