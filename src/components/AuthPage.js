import {
  Badge,
  Email,
  Lock,
  Person,
  Phone,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Container,
  Fade,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phoneNumber: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const response = await axios.post('/api/auth/login', {
          username: form.username,
          password: form.password
        });
        setMessage(response.data);
        localStorage.setItem('username', form.username);
        navigate('/app');
      } else {
        const response = await axios.post('/api/auth/register', form);
        setMessage(response.data);
        setIsLogin(true);
      }
    } catch (error) {
      setMessage(error.response?.data || 'An error occurred');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background)',
        padding: 2
      }}
    >
      <Container component="main" maxWidth="xs">
        <Fade in={true} timeout={1000}>
          <Paper
            elevation={12}
            className={shake ? 'shake' : ''}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 3,
              background: 'var(--card)',
              color: 'var(--card-foreground)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden',
              '@keyframes shake': {
                '0%, 100%': {
                  transform: 'translateX(0)',
                },
                '10%, 30%, 50%, 70%, 90%': {
                  transform: 'translateX(-5px)',
                },
                '20%, 40%, 60%, 80%': {
                  transform: 'translateX(5px)',
                },
              },
              '&.shake': {
                animation: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
              },
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'var(--primary)'
              }
            }}
          >
            <Typography
              component="h1"
              variant="h4"
              sx={{
                mb: 4,
                color: 'var(--foreground)',
                fontWeight: 700,
                textAlign: 'center',
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60px',
                  height: '3px',
                  background: 'var(--primary)',
                  borderRadius: '2px'
                }
              }}
            >
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </Typography>

            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              sx={{ 
                mt: 1, 
                width: '100%',
                '& .MuiTextField-root': {
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'var(--ring)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--ring)',
                    }
                  }
                }
              }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                name="username"
                label="Username"
                value={form.username}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: 'var(--primary)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'var(--primary)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <Fade in={!isLogin} timeout={500}>
                <Box sx={{ display: !isLogin ? 'block' : 'none' }}>
                  <TextField
                    margin="normal"
                    fullWidth
                    name="fullName"
                    label="Full Name"
                    value={form.fullName}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Badge sx={{ color: 'var(--primary)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    margin="normal"
                    fullWidth
                    name="email"
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: 'var(--primary)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    margin="normal"
                    fullWidth
                    name="phoneNumber"
                    label="Phone Number"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: 'var(--primary)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                </Box>
              </Fade>

              {message && (
                <Fade in={true}>
                  <Alert 
                    severity={message.includes('success') ? 'success' : 'error'} 
                    sx={{ 
                      mb: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                  >
                    {message}
                  </Alert>
                </Fade>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  '&:hover': {
                    filter: 'brightness(0.95)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>

              <Button
                fullWidth
                onClick={() => setIsLogin(!isLogin)}
                sx={{
                  color: 'var(--muted-foreground)',
                  fontWeight: 500,
                  '&:hover': {
                    color: 'var(--foreground)',
                    background: 'var(--muted)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}

export default AuthPage;
