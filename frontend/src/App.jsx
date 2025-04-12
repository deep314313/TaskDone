import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { TaskProvider } from './contexts/TaskContext';

// Layout Components
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

// App Router Component that uses auth context
const AppRouter = () => {
  const { loadUser } = useAuth();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/app/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetails />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/app/dashboard" />} />
      </Route>
    </Routes>
  );
};

// Main App component with providers
function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <TaskProvider>
          <AppRouter />
        </TaskProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;