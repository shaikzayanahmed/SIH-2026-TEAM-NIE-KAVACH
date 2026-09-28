import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AtmosphericProvider } from './context/AtmosphericContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AtmosphericProvider>
      <App />
    </AtmosphericProvider>
  </React.StrictMode>
);
