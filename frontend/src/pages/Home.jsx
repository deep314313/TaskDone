import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper
} from '@mui/material';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Typography component="h1" variant="h3" sx={{ mb: 3 }}>
            Welcome to Issue Tracker
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, textAlign: 'center' }}>
            Streamline your project management and task tracking
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
            >
              Sign Up
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Home;