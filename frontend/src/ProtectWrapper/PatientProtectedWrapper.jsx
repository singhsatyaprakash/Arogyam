import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { PatientContext } from '../contexts/PatientContext'

const PatientProtectedWrapper = ({ children }) => {
  const { patient } = useContext(PatientContext);
  
  if (!patient) {
    return <Navigate to="/patient/login" replace />
  }
  
  return <>{children}</>
}

export default PatientProtectedWrapper
