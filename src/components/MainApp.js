// react-notes-app/src/components/MainApp.js
import { Apps, Chat, Dashboard, Download, Edit, Logout, Person, Search, Upload } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './MainApp.css';

function MainApp() {
  const [note, setNote] = useState('');
  const navigate = useNavigate();

  // On mount, ensure any legacy persisted quick note is removed and start with empty note
  useEffect(() => {
    try { localStorage.removeItem('quickNote'); } catch (_) {}
    setNote('');
  }, []);

  // Removed explicit save; notes are not persisted to avoid cross-account visibility

  const handleDownloadNote = () => {
    const blob = new Blob([note], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-notes.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleLogout = () => {
    // Clear in-memory state so next user doesn't see previous content
    setNote('');
    // nothing persisted
    try { localStorage.removeItem('quickNote'); } catch (_) {}
    localStorage.removeItem('username');
    navigate('/auth');
  };

  return (
    <div className="main-container">
      <div className="header" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        fontFamily: 'inherit',
        background: 'var(--primary)',
        padding: '16px 24px',
        color: 'var(--primary-foreground)',
        borderRadius: '0 0 16px 16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}>
        <Apps sx={{ fontSize: 28 }} />
        <h2 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: '600',
        }}>Dashboard</h2>
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              background: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}
          >
            <Logout sx={{ fontSize: 18 }} />
            Logout
          </button>
        </div>
      </div>
      
      <div className="content-wrapper" style={{
        background: '#f5f7fa',
        minHeight: '100vh',
        padding: '20px'
      }}>
        <nav className="sidebar" style={{
          background: 'var(--card)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          margin: '0 0 20px 0',
          padding: '20px',
        }}>
          <div className="options-section">
            <div className="options-header" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <Dashboard sx={{ 
                fontSize: 24, 
                color: 'var(--primary)',
              }} />
              <h4 style={{ 
                fontFamily: 'inherit', 
                fontSize: '18px', 
                fontWeight: '600',
                color: 'var(--foreground)',
                margin: 0
              }}>Quick Access</h4>
            </div>
            
            <div className="options-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px'
            }}>
              {[
                { to: "upload", icon: <Upload sx={{ fontSize: 24 }} />, text: "File Upload", description: "Upload your documents" },
                { to: "search", icon: <Search sx={{ fontSize: 24 }} />, text: "File Search", description: "Search through files" },
                { to: "chatbot", icon: <Chat sx={{ fontSize: 24 }} />, text: "Chatbot", description: "AI Assistant" },
                { to: "/profile", icon: <Person sx={{ fontSize: 24 }} />, text: "User Profile", description: "Manage account" }
              ].map((item) => (
                <Link to={item.to} key={item.to} className="option-card" style={{
                  background: 'var(--card)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                  color: 'inherit',
                  border: '1px solid var(--border)',
                }}>
                  <div className="option-icon" style={{
                    background: 'var(--primary)',
                    borderRadius: '8px',
                    padding: '10px',
                    color: 'var(--primary-foreground)',
                  }}>
                    {item.icon}
                  </div>
                  <div className="option-details">
                    <h5 style={{ 
                      fontFamily: 'inherit', 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      margin: '0 0 4px 0',
                      color: 'var(--foreground)'
                    }}>{item.text}</h5>
                    <p style={{ 
                      fontFamily: 'inherit', 
                      fontSize: '14px', 
                      margin: 0, 
                      color: 'var(--muted-foreground)' 
                    }}>{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </nav>
        
        <div className="content-container">
          <div className="main-content-area" style={{
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}>
            <main className="main-content">
              <Outlet />
            </main>
          </div>

          <div className="quick-notes" style={{
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            height: 'calc(100vh - 140px)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h3 style={{
                fontFamily: 'inherit',
                fontSize: '20px',
                fontWeight: '600',
                margin: 0,
                color: 'var(--foreground)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Edit sx={{ fontSize: 24 }} />
                Quick Notes
              </h3>
              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <button
                  onClick={handleDownloadNote}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: 'var(--secondary)',
                    color: 'var(--secondary-foreground)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  <Download sx={{ fontSize: 18 }} />
                  Download
                </button>
              </div>
            </div>
            
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write your notes here..."
              style={{
                width: '100%',
                flex: 1,
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '15px',
                lineHeight: '1.6',
                resize: 'none',
                fontFamily: 'inherit',
                backgroundColor: 'var(--muted)',
                marginBottom: '12px'
              }}
            />
            
            {/* Removed unsaved changes indicator to avoid persistence features */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainApp;
