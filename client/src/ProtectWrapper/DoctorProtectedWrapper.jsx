import React, { useContext, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { DoctorContext } from '../contexts/DoctorContext'
import axios from 'axios';

const DoctorProtectedWrapper = ({ children }) => {
  const { doctor } = useContext(DoctorContext);
  const { setDoctor } = useContext(DoctorContext);
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const clearAuth = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('doctorToken');
      localStorage.removeItem('role');
      setDoctor(null);
    };

    const verifySession = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('doctorToken');
      const role = localStorage.getItem('role');

      if (!token || role !== 'doctor') {
        clearAuth();
        if (!isMounted) return;
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/doctors/validate`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!isMounted) return;

        if (!response?.data?.success) {
          throw new Error('Session validation failed');
        }

        setDoctor((prev) => prev || { doctor: response.data?.data?.doctor, token });
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
  }, [setDoctor]);

  if (isChecking) {
    return null;
  }

  if (!doctor && !isAuthorized) {
    return <Navigate to="/" replace state={redirectMessage ? { authMessage: redirectMessage } : undefined} />
  }
  
  return <>{children}</>
}

export default DoctorProtectedWrapper;
