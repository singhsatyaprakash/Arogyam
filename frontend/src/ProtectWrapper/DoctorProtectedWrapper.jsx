import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { DoctorContext } from '../contexts/DoctorContext'

const DoctorProtectedWrapper = ({ children }) => {
  const { doctor } = useContext(DoctorContext);
  
  if (!doctor) {
    return <Navigate to="/doctor/login" replace />
  }
  
  return <>{children}</>
}

export default DoctorProtectedWrapper;
