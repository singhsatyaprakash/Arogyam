// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/animations.css';
import App from './App';
import PatientContextProvider from './contexts/PatientContext';
import DoctorContextProvider from './contexts/DoctorContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PatientContextProvider>
      <DoctorContextProvider>
        <App />
      </DoctorContextProvider>
    </PatientContextProvider>
  </React.StrictMode>
);