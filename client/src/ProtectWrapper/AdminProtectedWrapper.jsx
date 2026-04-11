import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

const AdminProtectedWrapper = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const clearAdminAuth = () => {
      localStorage.removeItem("adminToken");
      if (localStorage.getItem("role") === "admin") {
        localStorage.removeItem("role");
      }
    };

    const verifyAdminSession = async () => {
      const token = localStorage.getItem("adminToken");
      const role = localStorage.getItem("role");

      if (!token || role !== "admin") {
        clearAdminAuth();
        if (!isMounted) return;
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admins/validate`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!isMounted) return;

        if (!response?.data?.success) {
          throw new Error("Invalid admin session");
        }

        setIsAuthorized(true);
      } catch {
        clearAdminAuth();
        if (!isMounted) return;
        setIsAuthorized(false);
      } finally {
        if (isMounted) setIsChecking(false);
      }
    };

    verifyAdminSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isChecking) return null;

  if (!isAuthorized) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedWrapper;
