import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import AppProviders from './components/providers/AppProviders';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProviders>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </AppProviders>
    </BrowserRouter>
  </React.StrictMode>
);
