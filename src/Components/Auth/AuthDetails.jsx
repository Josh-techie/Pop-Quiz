import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const AuthDetails = () => {
  const [authUser, setAuthUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        setAuthUser(user);
      } else {
        setAuthUser(null);
        navigate("/login"); // Redirect to the sign-in page if not authenticated or email not verified
      }
    });

    return () => {
      listen();
    };
  }, [navigate]);

  return null;
};

export default AuthDetails;
