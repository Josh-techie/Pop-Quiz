import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthDetails = () => {
  const [authUser, setAuthUser] = useState(null);
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
        navigate("/login"); // Redirect to the login page if not authenticated
      }
    });

    return () => {
      listen();
    };
  }, [location, navigate]);

  return null;
};

export default AuthDetails;
