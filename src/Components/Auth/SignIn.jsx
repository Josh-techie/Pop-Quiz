import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import QuoteImg from "../../Assets/Quote.jpg";
import { getUserByUsername, getUserProfile } from "../../services/firestoreService";
import { Eye, EyeOff } from "lucide-react";

const SignIn = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailOrUsernameError, setEmailOrUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    setEmailOrUsernameError("");
    setPasswordError("");
    setGeneralError("");

    if (!emailOrUsername) {
      setEmailOrUsernameError("Required");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Required");
      isValid = false;
    }

    return isValid;
  };

  const signIn = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setGeneralError("");

    try {
      let emailToUse = emailOrUsername;

      // Fast path: If it looks like an email, try signing in directly
      if (/\S+@\S+\.\S+/.test(emailOrUsername)) {
        await signInWithEmailAndPassword(auth, emailToUse, password);
        setLoading(false);
        navigate("/main");
        return;
      }

      // Slow path: It's a username, look up the email first
      const userResult = await getUserByUsername(emailOrUsername);
      if (!userResult.success) {
        setLoading(false);
        setEmailOrUsernameError("Not found");
        setPasswordError("Not found");
        setGeneralError("Invalid username or password. Please check your credentials and try again.");
        return;
      }

      emailToUse = userResult.data.email;
      await signInWithEmailAndPassword(auth, emailToUse, password);
      setLoading(false);
      navigate("/main");
    } catch (error) {
      console.error("Error signing in:", error);
      setLoading(false);
      setEmailOrUsernameError("Invalid");
      setPasswordError("Invalid");
      setGeneralError("Invalid username or password. Please check your credentials and try again.");
    }
  };

  // sign in with google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already has a profile with username
      const profileResult = await getUserProfile(user.uid);

      if (profileResult.success && profileResult.data.username) {
        // User already has username, go to main
        navigate("/main");
      } else {
        // New user, needs to set username
        navigate("/username-setup", { state: { fromOAuth: true } });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setLoading(false);
      setGeneralError("An error occurred while signing in with Google. Please try again.");
    }
  };

  return (
    <div className="fullscreen">
      <section className="flex flex-col md:flex-row h-screen items-center overflow-hidden">
        {/* Left Side - Quote Image (45% on desktop) - HIDDEN with display:none on mobile */}
        <div className="bg-blue-600 hidden lg:block lg:w-[45%] h-full relative">
          <img src={QuoteImg} alt="Quote" className="w-full h-full object-cover" />
          {/* Glassmorphism glow bleeding effect */}
          <div className="absolute top-0 right-0 w-6 h-full bg-gradient-to-r from-transparent via-blue-500/20 to-blue-400/30 blur-xl"></div>
        </div>

        {/* Right Side - Form (55% on desktop, full on mobile with true 100dvh) */}
        <div className="bg-white w-full lg:w-[55%] xl:w-1/3 min-h-screen lg:h-screen px-6 md:px-8 lg:px-12 xl:px-16 flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-md py-6 md:py-8">
            {/* Logo - Centered */}
            <img
              src={require("../../Assets/Logo.png")}
              alt="Pop Quiz Logo"
              className="mx-auto w-20 h-25 md:w-28 md:h-35"
            />

            <form className="mt-6 md:mt-8" onSubmit={signIn}>
              {/* General Error Message - Above inputs */}
              {generalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg mb-4 text-sm flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{generalError}</span>
                </div>
              )}

              {/* Email or Username input - Tightened spacing */}
              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-medium mb-1.5">
                  Email or Username
                </label>
                <input
                  type="text"
                  value={emailOrUsername}
                  onFocus={() => {
                    // Clear red borders when user focuses (hovers back)
                    setEmailOrUsernameError("");
                    setPasswordError("");
                    setGeneralError("");
                  }}
                  onChange={(e) => {
                    setEmailOrUsername(e.target.value);
                  }}
                  placeholder="Username or email address"
                  className={`w-full px-4 py-3 rounded-lg bg-gray-50 border-2 transition-all text-sm md:text-base ${
                    emailOrUsernameError
                      ? "border-red-400 focus:border-red-500 bg-red-50"
                      : "border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  } focus:outline-none`}
                  autoFocus
                  autoComplete="username"
                  disabled={loading}
                />
              </div>

              {/* Password input with visibility toggle - Tightened spacing */}
              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-medium mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onFocus={() => {
                      // Clear red borders when user focuses (hovers back)
                      setEmailOrUsernameError("");
                      setPasswordError("");
                      setGeneralError("");
                    }}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3 pr-12 rounded-lg bg-gray-50 border-2 transition-all text-sm md:text-base ${
                      passwordError
                        ? "border-red-400 focus:border-red-500 bg-red-50"
                        : "border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    } focus:outline-none`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot password link - Tightened spacing */}
              <div className="text-center mb-4">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs md:text-sm text-gray-600 transition-colors"
                >
                  Forgot password? <span className="font-semibold text-blue-600 hover:underline">Reset it now</span>
                </button>
              </div>

              {/* Sign in button with loading state */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-4 py-3 md:py-3.5 transition-all duration-200 relative text-sm md:text-base shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : (
                  "Log In"
                )}
              </button>
            </form>

            {/* Divider - Reduced spacing */}
            <div className="relative my-4 md:my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs md:text-sm">
                <span className="px-3 bg-white text-gray-500">or continue with</span>
              </div>
            </div>

            {/* Sign in with Google button - Reduced height */}
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 active:bg-gray-100 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 font-semibold rounded-lg px-4 py-3 border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 text-sm md:text-base"
            >
              <div className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  className="w-5 h-5"
                  viewBox="0 0 48 48"
                >
                  <defs>
                    <path
                      id="a"
                      d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
                    />
                  </defs>
                  <clipPath id="b">
                    <use xlinkHref="#a" overflow="visible" />
                  </clipPath>
                  <path clipPath="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z" />
                  <path
                    clipPath="url(#b)"
                    fill="#EA4335"
                    d="M0 11l17 13 7-6.1L48 14V0H0z"
                  />
                  <path
                    clipPath="url(#b)"
                    fill="#34A853"
                    d="M0 37l30-23 7.9 1L48 0v48H0z"
                  />
                  <path
                    clipPath="url(#b)"
                    fill="#4285F4"
                    d="M48 48L17 24l-4-3 35-10z"
                  />
                </svg>
                <span className="ml-3">Log in with Google</span>
              </div>
            </button>

            {/* Sign up link - Reduced spacing */}
            <div className="text-center mt-4 md:mt-5">
              <p className="text-xs md:text-sm text-gray-600">
                Need an account?{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SignIn;
