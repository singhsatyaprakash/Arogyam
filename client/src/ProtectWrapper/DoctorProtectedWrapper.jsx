import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { DoctorContext } from '../contexts/DoctorContext'

const DoctorProtectedWrapper = ({ children }) => {
  const { doctor } = useContext(DoctorContext);
  const token = localStorage.getItem('token') || localStorage.getItem('doctorToken');
  const role = localStorage.getItem('role');
  
  if (!doctor && !(token && role === 'doctor')) {
    return <Navigate to="/doctor/login" replace />
  }
  
  return <>{children}</>
}

export default DoctorProtectedWrapper;
