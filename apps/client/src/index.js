import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// Theme foundation loads ahead of every component stylesheet so page styles can refine it
import './styles/studio/base.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
