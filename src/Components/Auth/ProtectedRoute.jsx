import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import SessionTimeout from "./SessionTimeout";

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If auth is not initialized (demo mode), allow access
    if (!auth) {
      console.warn("Firebase auth not initialized - running in demo mode");
      setLoading(false);
      setUser({ demo: true }); // Mock user for demo mode
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If no user is authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, wrap with session timeout and render the protected component
  return <SessionTimeout>{children}</SessionTimeout>;
};

export default ProtectedRoute;
