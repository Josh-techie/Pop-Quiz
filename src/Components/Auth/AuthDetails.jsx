import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthDetails = () => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true); // State for loading indicator
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
      } else if (
        !location.pathname.includes("/login") &&
        !location.pathname.includes("/signup") &&
        !location.pathname.includes("/forgot-password")
      ) {
        // Redirect to the login page if not authenticated
        navigate("/login");
      }
      setLoading(false); // Set loading to false once authentication state is determined
    });

    return () => {
      listen();
    };
  }, [location, navigate]);

  // Render loading image if loading is true
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <img
          src="https://user-images.githubusercontent.com/47600906/92342363-50f71f00-f0de-11ea-85cf-d0af41acc6c8.png"
          alt="Loading"
        />
      </div>
    );
  }

  return null; // Return null once loading is complete
};

export default AuthDetails;
