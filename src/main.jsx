import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'  // <--- IMPORTANTE: Debe decir .jsx
import './index.css'

// [AUTO-RELOAD ON UPDATE]
// Detects when a lazy-loaded chunk is missing (404) due to a new deployment and reloads the page.
window.addEventListener('error', (e) => {
  const msg = e.message || '';
  if (/Loading chunk|Failed to fetch dynamically imported module/.test(msg)) {
    window.location.reload();
  }
});

// Also catch unhandled rejections (promices)
window.addEventListener('unhandledrejection', (e) => {
  const msg = e.reason ? e.reason.message : '';
  if (/Loading chunk|Failed to fetch dynamically imported module/.test(msg)) {
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)