import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthDetails = () => {
  // authUser state removed because it's not used in this component
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        if (
          !location.pathname.includes("/login") &&
          !location.pathname.includes("/signup") &&
          !location.pathname.includes("/forgot-password")
        ) {
          navigate("/login");
        }
      }
      // If user exists, do nothing here; this component only enforces redirect
    });

    return () => unsubscribe();
  }, [location, navigate]);

  return null;
};

export default AuthDetails;
