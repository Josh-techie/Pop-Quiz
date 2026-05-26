import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import QuoteImg from "../../Assets/Quote.jpg";
import { getUserByUsername } from "../../services/firestoreService";

const ForgotPasswd = () => {
  const [identifier, setIdentifier] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [networkError, setNetworkError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateIdentifier = () => {
    setIdentifierError("");
    setNetworkError("");
    if (!identifier) {
      setIdentifierError("Username or email is required");
      return false;
    }
    return true;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!validateIdentifier()) {
      return;
    }

    setLoading(true);
    setIdentifierError("");
    setNetworkError("");
    setSuccessMessage("");

    try {
      let emailToUse = identifier;

      // Check if input is a username (not an email format)
      if (!/\S+@\S+\.\S+/.test(identifier)) {
        // It's a username, look up the email
        const userResult = await getUserByUsername(identifier);
        if (userResult.success) {
          emailToUse = userResult.data.email;
        }
        // If username not found, we still show success message for security
      }

      // Action code settings to keep user on platform
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, emailToUse, actionCodeSettings);
    } catch (error) {
      console.error("Password reset error:", error);

      // Handle rate limiting and network errors only
      if (error.code === "auth/too-many-requests") {
        setLoading(false);
        setIdentifierError("Too many attempts. Please try again in a few minutes.");
        return;
      }
      if (error.code === "auth/network-request-failed") {
        setLoading(false);
        setNetworkError(
          "We're having trouble reaching our email server right now. Your security is important to us—please refresh the page and try again, or contact support if the issue persists."
        );
        return;
      }
      // For all other errors (including user-not-found), show success message
      // This prevents email/username enumeration attacks
    }

    // Always show success message (security best practice)
    setLoading(false);
    setSuccessMessage(
      "Check your inbox! We've sent a secure password reset link to the email address associated with your account. If you don't see it within a few minutes, please check your spam folder."
    );
    // Clear identifier after success
    setTimeout(() => {
      setIdentifier("");
    }, 500);
  };

  return (
    <div className="fullscreen">
      <section className="flex flex-col md:flex-row h-screen items-center overflow-hidden">
        {/* Left Side - Quote Image - HIDDEN with display:none on mobile */}
        <div className="bg-blue-600 hidden lg:block lg:w-[45%] h-full relative">
          <img src={QuoteImg} alt="Quote" className="w-full h-full object-cover" />
          {/* Glassmorphism glow bleeding effect */}
          <div className="absolute top-0 right-0 w-6 h-full bg-gradient-to-r from-transparent via-blue-500/20 to-blue-400/30 blur-xl"></div>
        </div>

        {/* Right Side - Form (full on mobile with proper height) */}
        <div className="bg-white w-full lg:w-[55%] xl:w-1/3 min-h-screen lg:h-screen px-6 md:px-8 lg:px-12 xl:px-16 flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-md py-6 md:py-8">
            {/* Logo - Centered */}
            <img
              src={require("../../Assets/Logo.png")}
              alt="Pop Quiz Logo"
              className="mx-auto w-20 h-25 md:w-28 md:h-35"
            />

            {/* SUCCESS STATE - Email Sent Card (unmounts form) */}
            {successMessage ? (
              <div className="mt-6 md:mt-8 flex flex-col items-center text-center">
                {/* Email Icon */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 md:w-10 md:h-10 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                {/* Success Title */}
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Check Your Inbox!
                </h2>

                {/* Success Description */}
                <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-md px-4">
                  {successMessage}
                </p>

                {/* Primary CTA - Open Email Client */}
                <a
                  href="mailto:"
                  className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-lg px-4 py-3 md:py-3.5 mt-6 transition-all duration-200 flex items-center justify-center text-sm md:text-base shadow-sm hover:shadow-md"
                >
                  Open Email
                </a>

                {/* Secondary Button - Return to Sign In */}
                <button
                  type="button"
                  onClick={() => {
                    setSuccessMessage("");
                    setIdentifier("");
                    navigate("/login");
                  }}
                  className="w-full bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-semibold rounded-lg px-4 py-3 md:py-3.5 mt-3 transition-all duration-200 border-2 border-gray-300 hover:border-gray-400 text-sm md:text-base"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <>
                {/* FORM STATE - Default password reset form */}

                {/* Dynamic instructional text */}
                {!networkError && (
                  <p className="text-gray-600 text-sm md:text-base mt-5 md:mt-6 text-center">
                    No worries! Enter your username or email and we'll help you reset your password.
                  </p>
                )}

                {/* Network Error - Replaces instruction text with warning tone */}
                {networkError && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mt-4" role="alert">
                    <p className="font-semibold text-sm">Connection Issue</p>
                    <p className="text-sm mt-1.5 leading-relaxed">{networkError}</p>
                  </div>
                )}

                {/* Form */}
                <form className="mt-5 md:mt-6" onSubmit={handleResetPassword}>
                  {/* Username or Email Input */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Username or Email Address
                    </label>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        setIdentifierError("");
                        setNetworkError("");
                      }}
                      placeholder="Username or email address"
                      className={`w-full px-4 py-3 md:py-3.5 rounded-lg bg-gray-50 border-2 transition-all text-sm md:text-base ${
                        identifierError
                          ? "border-red-400 focus:border-red-500 bg-red-50"
                          : "border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      } focus:outline-none`}
                      autoFocus
                      autoComplete="off"
                      disabled={loading}
                    />
                    {identifierError && (
                      <p className="text-red-600 text-xs md:text-sm mt-2 flex items-start">
                        <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {identifierError}
                      </p>
                    )}
                  </div>

                  {/* Primary Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-4 py-3 md:py-3.5 mt-5 transition-all duration-200 flex items-center justify-center text-sm md:text-base shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <>
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
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </button>

                  {/* Secondary Button - Return to Sign In */}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="w-full bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-semibold rounded-lg px-4 py-3 md:py-3.5 mt-3 transition-all duration-200 border-2 border-gray-300 hover:border-gray-400 text-sm md:text-base"
                  >
                    Return to Sign In
                  </button>
                </form>

                {/* Sign Up Link */}
                <div className="text-center mt-5 md:mt-6">
                  <p className="text-xs md:text-sm text-gray-600">
                    Don't have an account?{" "}
                    <button
                      onClick={() => navigate("/signup")}
                      className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span className="hover:underline">Create an account</span>
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPasswd;
