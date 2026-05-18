import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If auth is not initialized (demo mode), skip auth checks
    if (!auth) {
      console.warn("Firebase auth not initialized - running in demo mode");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Allow access to public routes
        const publicRoutes = ["/", "/login", "/signup", "/forgot-password", "/signin"];
        const isPublicRoute = publicRoutes.some(route => location.pathname === route || location.pathname.includes(route));

        if (!isPublicRoute) {
          navigate("/");
        }
      }
    });

    return () => unsubscribe();
  }, [location, navigate]);

  return null;
};

export default AuthDetails;
