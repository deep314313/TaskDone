import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Dashboard = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1">
          Welcome to your project dashboard. Here you'll be able to view and manage your projects.
        </Typography>
      </Box>
    </Container>
  );
};

export default Dashboard;