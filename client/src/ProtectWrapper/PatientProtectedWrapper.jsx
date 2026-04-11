import React, { useContext, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { PatientContext } from '../contexts/PatientContext'
import axios from 'axios';

const PatientProtectedWrapper = ({ children }) => {
  const { patient, setPatient } = useContext(PatientContext);
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const clearAuth = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      setPatient(null);
    };

    const verifySession = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      if (!token || role !== 'patient') {
        clearAuth();
        if (!isMounted) return;
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/patients/validate`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!isMounted) return;

        if (!response?.data?.success) {
          throw new Error('Session validation failed');
        }

        setPatient((prev) => prev || { patient: response.data?.data?.patient, token });
        setIsAuthorized(true);
      } catch (error) {
        clearAuth();
        if (!isMounted) return;
        setRedirectMessage('Session expired. Please login again.');
        setIsAuthorized(false);
      } finally {
        if (isMounted) setIsChecking(false);
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [setPatient]);

  if (isChecking) {
    return null;
  }

  if (!patient && !isAuthorized) {
    return <Navigate to="/" replace state={redirectMessage ? { authMessage: redirectMessage } : undefined} />
  }
  
  return <>{children}</>
}

export default PatientProtectedWrapper
