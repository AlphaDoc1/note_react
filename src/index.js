import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css'; // optional global styles
import './theme.css';
import './api';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
