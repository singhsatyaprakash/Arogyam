import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { PatientContext } from '../contexts/PatientContext'

const PatientProtectedWrapper = ({ children }) => {
  const { patient } = useContext(PatientContext);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  // console.log(patient);
  
  if (!patient && !(token && role === 'patient')) {
    return <Navigate to="/patient/login" replace />
  }
  
  return <>{children}</>
}

export default PatientProtectedWrapper
