import {
  Box,
  Button,
  Card, CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slide,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showScrollIcon, setShowScrollIcon] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const heroRef = useRef(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollIcon(false);
      } else {
        setShowScrollIcon(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToFeatures = () => {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleMouseMove = (e) => {
    const rect = heroRef.current?.getBoundingClientRect?.();
    if (!rect) return;
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Fixed Navbar */}
      <Box 
        sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'var(--card)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Container maxWidth={false} disableGutters>
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              py: 1.5,
              minHeight: 72
            }}
          >
            {/* Logo Section */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer',
                gridColumn: 1,
                justifySelf: 'start',
                pl: 2
              }}
              onClick={() => navigate('/')}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  color: 'var(--foreground)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  lineHeight: 1
                }}
              >
                <img
                  src={`${process.env.PUBLIC_URL}/mvj-college.png`}
                  alt="MVJ College Logo"
                  style={{
                    height: 64,
                    width: 'auto',
                    objectFit: 'contain',
                    background: 'transparent',
                    borderRadius: 0,
                    mixBlendMode: 'darken',
                    display: 'block'
                  }}
                />
                MVJ NEXTGEN EDUCLOUD
              </Typography>
            </Box>

            {/* Navigation Links */}
            <Box 
              sx={{ 
                display: 'flex',
                gap: 3,
                alignItems: 'center',
                gridColumn: 2,
                justifyContent: 'center'
              }}
            >
              <Typography 
                sx={{ 
                  cursor: 'pointer',
                  color: 'var(--muted-foreground)',
                  fontFamily: 'inherit',
                  '&:hover': { color: 'var(--foreground)' }
                }}
                onClick={scrollToFeatures}
              >
                Features
              </Typography>
              <Typography 
                sx={{ 
                  cursor: 'pointer',
                  color: 'var(--muted-foreground)',
                  fontFamily: 'inherit',
                  '&:hover': { color: 'var(--foreground)' }
                }}
                onClick={() => setShowAbout(true)}
              >
                About
              </Typography>
             
            </Box>

            {/* Auth Buttons */}
            <Box 
              sx={{ 
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                gridColumn: 3,
                justifyContent: 'end',
                pr: 2
              }}
            >
              <Button 
                variant="text"
                onClick={() => navigate('/auth')}
                sx={{ 
                  color: 'var(--muted-foreground)',
                  fontFamily: 'inherit',
                  textTransform: 'none',
                  '&:hover': { color: 'var(--foreground)' }
                }}
              >
                Sign In
              </Button>
              <Button 
                variant="contained"
                onClick={() => navigate('/auth')}
                sx={{ 
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  fontFamily: 'inherit',
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    filter: 'brightness(0.95)'
                  }
                }}
              >
                Get Started
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'var(--background)',
          color: 'var(--foreground)',
          position: 'relative',
          padding: 4,
          fontFamily: 'inherit',
          mt: 8
        }}
        ref={heroRef}
        onMouseMove={handleMouseMove}
      >
        {/* Animated background layer */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          {/* Conic gradient aurora swirls */}
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '30%',
            width: 1200,
            height: 1200,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            backgroundImage: 'conic-gradient(from 0deg at 50% 50%, var(--primary), var(--accent), var(--secondary), var(--primary))',
            filter: 'blur(100px)',
            opacity: 0.18,
            animation: 'spin 60s linear infinite'
          }} />
          <Box sx={{
            position: 'absolute',
            top: '40%',
            right: '-10%',
            width: 1000,
            height: 1000,
            transform: 'translate(0, -50%)',
            borderRadius: '50%',
            backgroundImage: 'conic-gradient(from 180deg at 50% 50%, var(--secondary), var(--primary), var(--accent), var(--secondary))',
            filter: 'blur(120px)',
            opacity: 0.16,
            animation: 'spinReverse 80s linear infinite'
          }} />
          {/* Subtle animated hatch overlay */}
          <Box sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'repeating-linear-gradient(135deg, rgba(0,0,0,0.035) 0px, rgba(0,0,0,0.035) 1px, transparent 1px, transparent 14px)',
            opacity: 0.35,
            animation: 'bgShift 50s linear infinite'
          }} />
          <Box sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(240px circle at ${cursorPos.x}px ${cursorPos.y}px, color-mix(in oklch, var(--foreground) 14%, transparent), transparent 65%)`
          }} />
        </Box>
        <style>{`
          @keyframes spin { from { transform: translate(-50%, -50%) rotate(0deg);} to { transform: translate(-50%, -50%) rotate(360deg);} }
          @keyframes spinReverse { from { transform: translate(0, -50%) rotate(0deg);} to { transform: translate(0, -50%) rotate(-360deg);} }
          @keyframes bgShift { 0% { background-position: 0 0; } 100% { background-position: 1000px 700px; } }
        `}</style>
        <Slide direction="down" in={true} timeout={1000}>
          <Box sx={{ textAlign: 'center', maxWidth: '800px', position: 'relative', zIndex: 1 }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              mb: 2
            }}>
              <Box
                sx={{
                  width: 84,
                  height: 84,
                  borderRadius: '24px',
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 42,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  animation: 'floatPulse 3s ease-in-out infinite',
                }}
              >
                🏫
              </Box>
              <style>{`@keyframes floatPulse { 0%, 100% { transform: translateY(0); box-shadow: 0 10px 30px rgba(0,0,0,0.15);} 50% { transform: translateY(-8px); box-shadow: 0 18px 34px rgba(0,0,0,0.18);} }`}</style>
            </Box>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                color: 'var(--foreground)',
                mb: 3,
                letterSpacing: '-0.02em'
              }}
            >
              WELCOME TO MVJ NEXTGEN EDUCLOUD:AI-BASED ACADEMIC RESOURCE MANAGER
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ mb: 4, opacity: 0.9 }}
            >
              Organize your thoughts, boost your productivity, and never forget important ideas again.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/auth')}
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: 2,
                fontSize: '1.1rem',
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                '&:hover': {
                  filter: 'brightness(0.95)'
                }
              }}
            >
              Get Started Now
            </Button>
          </Box>
        </Slide>
        
        <Fade in={showScrollIcon} timeout={1000}>
          <IconButton 
            sx={{ 
              position: 'absolute', 
              bottom: 20, 
              color: 'var(--foreground)',
              animation: 'bounce 2s infinite'
            }}
            onClick={scrollToFeatures}
          >
            <Typography variant="h4">↓</Typography>
          </IconButton>
        </Fade>
      </Box>

      {/* Features Section */}
      <Box 
        id="features"
        sx={{ 
          py: 8, 
          px: 2,
          background: 'var(--muted)',
          color: 'var(--foreground)'
        }}
      >
        <Container maxWidth="lg">
          <Fade in={true} timeout={1000}>
            <Typography 
              variant="h3" 
              component="h2" 
              align="center" 
              gutterBottom
              sx={{ 
                mb: 6, 
                fontWeight: 700,
                color: 'var(--foreground)',
                fontFamily: 'inherit',
                fontSize: { xs: '2rem', md: '2.75rem' },
                letterSpacing: '-0.02em'
              }}
            >
              Powerful Features
            </Typography>
          </Fade>
          
          <Grid container spacing={4}>
            {[
              { 
                icon: '☁️', 
                title: 'AWS Cloud Storage', 
                description: 'Securely upload and store your notes in AWS cloud storage with enterprise-level security and reliability.',
                gradient: 'linear-gradient(135deg, #63B3ED 0%, #4299E1 100%)',
                shadowColor: 'rgba(99, 179, 237, 0.3)'
              },
              { 
                icon: '��', 
                title: 'Smart Search & Download', 
                description: 'Instantly search through your notes and download them directly from AWS cloud storage.',
                gradient: 'linear-gradient(135deg, #9F7AEA 0%, #805AD5 100%)',
                shadowColor: 'rgba(159, 122, 234, 0.3)'
              },
              { 
                icon: '🤖', 
                title: 'AI-Powered Chatbot', 
                description: 'Interact with our intelligent chatbot for quick answers and assistance with your notes.',
                gradient: 'linear-gradient(135deg, #4FD1C5 0%, #38B2AC 100%)',
                shadowColor: 'rgba(79, 209, 197, 0.3)'
              }
            ].map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade in={true} timeout={1000 + (index * 500)}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%',
                      background: 'var(--card)',
                      borderRadius: '16px',
                      border: '1px solid var(--border)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        boxShadow: `0 20px 30px rgba(0,0,0,0.08)`
                      }
                    }}
                  >
                    <CardContent 
                      sx={{ 
                        flexGrow: 1, 
                        textAlign: 'center', 
                        p: 4
                      }}
                    >
                      <Box 
                        sx={{ 
                          mb: 3, 
                          fontSize: '4rem',
                          background: 'var(--primary)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography 
                        variant="h5" 
                        component="h3" 
                        gutterBottom
                        sx={{ 
                          fontWeight: 600,
                          fontFamily: 'inherit',
                          mb: 2,
                          color: 'var(--foreground)',
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: 'var(--muted-foreground)',
                          lineHeight: 1.7,
                          fontFamily: 'inherit',
                          fontSize: '1rem'
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box 
        sx={{ 
          py: 8,
          background: 'var(--muted)',
          color: 'var(--foreground)',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Slide direction="up" in={true} timeout={1000}>
            <Box>
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{ 
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  letterSpacing: '-0.02em',
                  color: 'var(--foreground)'
                }}
              >
                Ready to organize your notes?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Join thousands of users who have transformed their note-taking experience.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/auth')}
                sx={{ 
                  px: 4, 
                  py: 1.5, 
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  textTransform: 'none',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  '&:hover': {
                    filter: 'brightness(0.95)'
                  }
                }}
              >
                Get Started Now
              </Button>
            </Box>
          </Slide>
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        sx={{ 
          py: 4,
          backgroundColor: '#F8FAFC',
          color: '#4A5568',
          borderTop: '1px solid #E2E8F0',
          fontFamily: '"Inter", sans-serif'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2} justifyContent="space-between" alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="body2">
                © 2025 vvv NEXTGEN EDUCLOUD:AI-BASED ACADEMIC RESOURCE MANAGER. All rights reserved.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="body2">
                Privacy Policy | Terms of Service | Contact Us
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CSS for bounce animation */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-20px);
          }
          60% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      {/* About Dialog */}
      <Dialog 
        open={showAbout} 
        onClose={() => setShowAbout(false)}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 3,
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            border: '1px solid var(--border)'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            fontFamily: 'inherit',
            fontWeight: 700,
            color: 'var(--foreground)',
            fontSize: '1.75rem'
          }}
        >
          About MVJ NEXTGEN EDUCLOUD:AI-BASED ACADEMIC RESOURCE MANAGER
        </DialogTitle>
        <DialogContent>
          <Typography 
            sx={{ 
              fontFamily: 'inherit',
              color: 'var(--muted-foreground)',
              lineHeight: 1.8,
              mb: 3
            }}
          >
            MVJ NEXTGEN EDUCLOUD:AI-BASED ACADEMIC RESOURCE MANAGER is a cutting-edge platform designed to revolutionize how you organize and access academic resources. Our platform leverages the power of AWS cloud storage to provide secure, reliable, and accessible note-taking and resource management solutions.
          </Typography>
          
          <Typography 
            variant="h6"
            sx={{ 
              fontFamily: 'inherit',
              color: 'var(--foreground)',
              mb: 2,
              fontWeight: 600
            }}
          >
            Our Mission
          </Typography>
          <Typography 
            sx={{ 
              fontFamily: 'inherit',
              color: 'var(--muted-foreground)',
              lineHeight: 1.8,
              mb: 3
            }}
          >
            We strive to provide a seamless and intuitive note-taking experience that helps students, professionals, and creative minds capture, organize, and access their ideas effortlessly. Our commitment to innovation and user experience drives us to continuously improve and enhance our platform.
          </Typography>

          <Typography 
            variant="h6"
            sx={{ 
              fontFamily: 'inherit',
              color: 'var(--foreground)',
              mb: 2,
              fontWeight: 600
            }}
          >
            Technology Stack
          </Typography>
          <List sx={{ mb: 3 }}>
            {[
              'Frontend: React.js with Material-UI for a modern, responsive interface',
              'Backend: Node.js and Express for robust server-side operations',
              'Database: MongoDB for flexible and scalable data storage',
              'Cloud Storage: AWS S3 for secure file storage and management',
              'Authentication: JWT-based secure user authentication',
              'AI Integration: Advanced chatbot powered by machine learning'
            ].map((tech, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Box sx={{ color: 'var(--primary)', fontSize: '1.2rem' }}>⚡</Box>
                </ListItemIcon>
                <ListItemText 
                  primary={tech} 
                  sx={{ 
                    '& .MuiListItemText-primary': { 
                      fontFamily: 'inherit',
                      color: 'var(--muted-foreground)'
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>

          <Typography 
            variant="h6"
            sx={{ 
              fontFamily: 'inherit',
              color: 'var(--foreground)',
              mb: 2,
              fontWeight: 600
            }}
          >
            Key Benefits
          </Typography>
          <List>
            {[
              'Secure cloud storage powered by AWS with automatic backups',
              'Advanced search capabilities with tags and categories',
              'AI-powered chatbot for smart note organization and retrieval',
              'Cross-platform accessibility across all devices',
              'Real-time synchronization and collaboration features',
              'Markdown support for rich text formatting',
              'Customizable templates and organization systems'
            ].map((benefit, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Box sx={{ color: 'var(--primary)', fontSize: '1.2rem' }}>✓</Box>
                </ListItemIcon>
                <ListItemText 
                  primary={benefit} 
                  sx={{ 
                    '& .MuiListItemText-primary': { 
                      fontFamily: 'inherit',
                      color: 'var(--muted-foreground)'
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowAbout(false)}
            sx={{ 
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              fontFamily: 'inherit',
              textTransform: 'none',
              px: 3,
              py: 1,
              borderRadius: 2,
              '&:hover': { filter: 'brightness(0.95)' }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default LandingPage;
