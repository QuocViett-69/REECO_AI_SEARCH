import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// Theme foundation loads ahead of every component stylesheet so page styles can refine it
import './styles/studio/base.css';
import App from './App';
// After App so it can restyle every page stylesheet that App's components import
import './styles/studio/cafe.css';
// Sky layer last: remaps the palette and puts every shop page on the sky
import './styles/studio/sky.css';
import './styles/studio/account-sky.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
