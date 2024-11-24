import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Find the root DOM element in your HTML
const container = document.getElementById('root');

// Create a React root
const root = ReactDOM.createRoot(container);

// Render your app into the root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
