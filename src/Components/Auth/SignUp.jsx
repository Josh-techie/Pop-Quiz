import React, { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Logo from "../../Assets/Logo.png";
import QuoteImg from "../../Assets/Quote.jpg";
import { createUserProfile, checkUsernameAvailability, getUserProfile } from "../../services/firestoreService";
import { Eye, EyeOff, Check, X } from "lucide-react";

// Move redirect_home function outside the component
function redirect_home(navigate) {
  navigate("/login");
}

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({ level: 0, label: "", color: "" });
  const navigate = useNavigate();

  const provider = new GoogleAuthProvider();
  const authInstance = getAuth();

  // Password strength checker
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ level: 0, label: "", color: "", segments: 0 });
      return;
    }

    let strength = 0;
    let label = "";
    let color = "";
    let segments = 0;

    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Character variety checks
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    // Set label, color, and segments based on strength
    if (password.length < 8) {
      label = "Too weak";
      color = "text-red-600";
      segments = 1;
    } else if (strength <= 2) {
      label = "Medium strength";
      color = "text-orange-500";
      segments = 2;
    } else if (strength <= 4) {
      label = "Good password";
      color = "text-blue-600";
      segments = 3;
    } else {
      label = "Strong password!";
      color = "text-green-600";
      segments = 4;
    }

    setPasswordStrength({ level: strength, label, color, segments });
  }, [password]);

  const validateUsername = (value) => {
    if (!value) {
      return "This field is required";
    }

    // Length validation
    if (value.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (value.length > 20) {
      return "Username must be less than 20 characters";
    }

    // Character validation - only lowercase letters, numbers, and underscores
    if (!/^[a-z0-9_]+$/.test(value)) {
      return "Only lowercase letters, numbers, and underscores allowed";
    }

    // Must start with a letter
    if (!/^[a-z]/.test(value)) {
      return "Username must start with a letter";
    }

    // Cannot end with underscore
    if (value.endsWith('_')) {
      return "Username cannot end with an underscore";
    }

    // Cannot have consecutive underscores
    if (value.includes('__')) {
      return "Cannot have consecutive underscores";
    }

    // Cannot be only numbers (must have at least one letter)
    if (/^\d+$/.test(value)) {
      return "Username must contain at least one letter";
    }

    // Reserved words check
    const reservedWords = [
      'admin', 'root', 'system', 'moderator', 'mod', 'support',
      'popquiz', 'pop_quiz', 'quiz', 'user', 'guest', 'anonymous',
      'null', 'undefined', 'test', 'demo', 'official'
    ];
    if (reservedWords.includes(value.toLowerCase())) {
      return "This username is reserved";
    }

    return null;
  };

  const handleUsernameChange = async (value) => {
    setUsername(value);
    setUsernameError("");
    setUsernameAvailable(null);

    const error = validateUsername(value);
    if (error) {
      setUsernameError(error);
      return;
    }

    // Check availability with 300ms debouncing (fast)
    setCheckingUsername(true);
    setTimeout(async () => {
      const result = await checkUsernameAvailability(value);
      setCheckingUsername(false);
      if (result.success && !result.available) {
        setUsernameError("This username is already taken");
        setUsernameAvailable(false);
      } else if (result.success && result.available) {
        setUsernameAvailable(true);
      }
    }, 300);
  };

  const validateForm = () => {
    let isValid = true;
    setUsernameError("");
    setEmailError("");
    setPasswordError("");

    const usernameValidation = validateUsername(username);
    if (usernameValidation) {
      setUsernameError(usernameValidation);
      isValid = false;
    }

    if (!email) {
      setEmailError("This field is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    }

    if (!password) {
      setPasswordError("This field is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    return isValid;
  };

  const signUp = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const signInMethods = await fetchSignInMethodsForEmail(
        authInstance,
        email
      );

      if (signInMethods.length > 0) {
        setLoading(false);
        setEmailError("Email already exists in our database");
      } else {
        // Create Firebase Auth account
        const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
        const user = userCredential.user;

        // Create Firestore user profile with username
        const profileResult = await createUserProfile(user.uid, {
          username,
          email,
          displayName: username,
        });

        if (!profileResult.success) {
          setLoading(false);
          setUsernameError(profileResult.error || "Failed to create profile");
          return;
        }

        // Custom action code settings for better email
        const actionCodeSettings = {
          url: `${window.location.origin}/login?verified=true`,
          handleCodeInApp: false,
        };

        await sendEmailVerification(authInstance.currentUser, actionCodeSettings);

        setLoading(false);
        setSuccessMessage(
          "Account created successfully! Please check your email to verify your account before logging in."
        );
      }
    } catch (error) {
      setLoading(false);
      if (error.code === "auth/email-already-in-use") {
        setEmailError("Email already exists in our database");
      } else {
        setPasswordError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="fullscreen">
      <section className="flex flex-col md:flex-row h-screen items-center overflow-hidden">
        {/* Left side - Form (full on mobile with proper height) */}
        <div
          className="bg-white w-full lg:w-[55%] xl:w-1/3 min-h-screen lg:h-screen px-6 md:px-8 lg:px-12 xl:px-16
          flex items-center justify-center overflow-y-auto"
        >
          <div className="w-full max-w-md py-6 md:py-8">
            {/* Logo - Centered */}
            <img
              src={Logo}
              alt="Pop Quiz Logo"
              className="mx-auto w-20 h-25 md:w-28 md:h-35"
            />

            {/* SUCCESS STATE - Account Created */}
            {successMessage ? (
              <div className="mt-6 md:mt-8 flex flex-col items-center text-center">
                {/* Success Icon */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
                </div>

                {/* Success Title */}
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Account Created!
                </h2>

                {/* Success Description */}
                <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-md px-4 mb-6">
                  {successMessage}
                </p>

                {/* Primary CTA - Go to Login */}
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-lg px-4 py-3 md:py-3.5 transition-all duration-200 flex items-center justify-center text-sm md:text-base shadow-sm hover:shadow-md"
                >
                  Continue to Login
                </button>
              </div>
            ) : (
              <>
              <form className="mt-5 md:mt-6" onSubmit={signUp}>
              {/* Username input - First field */}
              <div className="mb-2.5">
                <label className="block text-gray-700 text-sm font-medium mb-1.5">Username</label>
                <input
                  type="text"
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  value={username}
                  placeholder="Choose a unique username"
                  className={`w-full px-4 py-2.5 md:py-3 rounded-lg bg-gray-50 border-2 transition-all text-sm md:text-base ${
                    usernameError
                      ? "border-red-400 focus:border-red-500 bg-red-50"
                      : usernameAvailable
                      ? "border-green-400 focus:border-green-500 bg-green-50"
                      : "border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  } focus:outline-none`}
                  autoFocus
                  autoComplete="off"
                  disabled={loading}
                />
                {/* Active Context Guide */}
                {!username && !checkingUsername && !usernameError && !usernameAvailable && (
                  <p className="text-gray-400 text-xs mt-1">
                    Start with a letter • 3-20 characters • Lowercase only
                  </p>
                )}
                {checkingUsername && (
                  <p className="text-blue-500 text-xs mt-1 flex items-center">
                    <svg className="animate-spin h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking availability...
                  </p>
                )}
                {usernameError && !checkingUsername && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <X className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                    {usernameError}
                  </p>
                )}
                {usernameAvailable && !checkingUsername && !usernameError && (
                  <p className="text-green-600 text-xs mt-1 flex items-center">
                    <Check className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                    Great handle! This username is available.
                  </p>
                )}
              </div>

              {/* Email input */}
              <div className="mb-2.5">
                <label className="block text-gray-700 text-sm font-medium mb-1.5">Email Address</label>
                <input
                  type="text"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  value={email}
                  placeholder="Enter your email address"
                  className={`w-full px-4 py-2.5 md:py-3 rounded-lg bg-gray-50 border-2 transition-all text-sm md:text-base ${
                    emailError
                      ? "border-red-400 focus:border-red-500 bg-red-50"
                      : "border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  } focus:outline-none`}
                  autoComplete="email"
                  disabled={loading}
                />
                {emailError && (
                  <p className="text-red-600 text-xs mt-1.5 flex items-center">
                    <X className="w-3.5 h-3.5 mr-1" />
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password input with visibility toggle */}
              <div className="mb-2.5">
                <label className="block text-gray-700 text-sm font-medium mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError("");
                    }}
                    value={password}
                    placeholder="Create a strong password"
                    className={`w-full px-4 py-2.5 md:py-3 pr-12 rounded-lg bg-gray-50 border-2 transition-all text-sm md:text-base ${
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

                {/* Visual Password Complexity Gauge */}
                {password && !passwordError && (
                  <div className="mt-1.5">
                    {/* Horizontal bar with segments */}
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((segment) => (
                        <div
                          key={segment}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            segment <= passwordStrength.segments
                              ? passwordStrength.segments === 1
                                ? "bg-red-500"
                                : passwordStrength.segments === 2
                                ? "bg-orange-500"
                                : passwordStrength.segments === 3
                                ? "bg-blue-500"
                                : "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    {/* Label */}
                    <p className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </p>
                  </div>
                )}

                {passwordError && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <X className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Success message */}
              {successMessage && (
                <div
                  className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg mb-3 text-xs md:text-sm"
                  role="alert"
                >
                  <span className="font-medium">{successMessage}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || checkingUsername}
                className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-4 py-2.5 md:py-3 mt-3 transition-all duration-200 text-sm md:text-base shadow-sm hover:shadow-md"
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
                  "Sign Up"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-3 md:my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs md:text-sm">
                <span className="px-3 bg-white text-gray-500">or continue with</span>
              </div>
            </div>

            {/* Google Sign Up button */}
            <button
              type="button"
              className="w-full bg-white hover:bg-gray-50 active:bg-gray-100 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 font-semibold rounded-lg px-4 py-2.5 md:py-3 border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 text-sm md:text-base"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  const result = await signInWithPopup(authInstance, provider);
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
                  console.error("Google sign up error:", error);
                  setLoading(false);
                  setPasswordError("Google sign up failed. Please try again.");
                }
              }}
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
                <span className="ml-3">Sign Up with Google</span>
              </div>
            </button>

            {/* Login link */}
            <p className="mt-3 md:mt-4 text-xs md:text-sm text-center text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Log In
              </button>
            </p>
            </>
            )}
          </div>
        </div>

        {/* Right side - Quote image - HIDDEN with display:none on mobile */}
        <div className="bg-blue-600 hidden lg:block lg:w-[45%] h-full relative">
          <img src={QuoteImg} alt="Quote" className="w-full h-full object-cover" />
          {/* Glassmorphism glow bleeding from left */}
          <div className="absolute top-0 left-0 w-6 h-full bg-gradient-to-l from-transparent via-blue-500/20 to-blue-400/30 blur-xl"></div>
        </div>
      </section>
    </div>
  );
};

export default SignUp;
