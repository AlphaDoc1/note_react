import {
  Badge,
  Email,
  Lock,
  Person,
  Phone,
  Save
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { axiosApi } from '../api';
import React, { useEffect, useState } from 'react';

function UserProfile() {
  const [profile, setProfile] = useState({ username: '', fullName: '', email: '', phoneNumber: '' });
  const [message, setMessage] = useState('');
  const username = localStorage.getItem('username') || '';

  useEffect(() => {
    if (username) {
      axiosApi.get('/api/users/profile?username=' + encodeURIComponent(username))
        .then(response => setProfile(response.data))
        .catch(error => console.error('Error fetching profile', error));
    }
  }, [username]);

  const handleChange = (e) => {
    setProfile({...profile, [e.target.name]: e.target.value});
  };

  const handleUpdate = () => {
    axiosApi.put('/api/users/profile', profile)
      .then(response => {
        setProfile(response.data);
        setMessage('Profile updated successfully');
      })
      .catch(error => {
        console.error('Error updating profile', error);
        setMessage('Error updating profile');
      });
  };

  return (
    <Container maxWidth="sm" sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      py: 4 // Add padding top and bottom for better spacing
    }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', background: 'var(--card)', color: 'var(--card-foreground)', border: '1px solid var(--border)' }}>
        <Typography variant="h4" component="h2" gutterBottom 
          sx={{ 
            color: 'var(--foreground)',
            textAlign: 'center',
            mb: 3
          }}>
          <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
          User Profile
        </Typography>

        {message && (
          <Alert 
            severity={message.includes('Error') ? 'error' : 'success'} 
            sx={{ mb: 3 }}
          >
            {message}
          </Alert>
        )}

        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={profile.username}
              InputProps={{
                readOnly: true,
                startAdornment: <Badge sx={{ mr: 1, color: 'action.active' }} />
              }}
            />

            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={profile.fullName || ''}
              onChange={handleChange}
              InputProps={{
                startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
              }}
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={profile.email || ''}
              onChange={handleChange}
              InputProps={{
                startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
              }}
            />

            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={profile.phoneNumber || ''}
              onChange={handleChange}
              InputProps={{
                startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              placeholder="Update password"
              onChange={handleChange}
              InputProps={{
                startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />
              }}
            />

            <Button 
              type="submit" 
              variant="contained" 
              size="large"
              sx={{
                bgcolor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                '&:hover': {
                  filter: 'brightness(0.95)'
                }
              }}
              startIcon={<Save />}
            >
              Update Profile
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}

export default UserProfile;
