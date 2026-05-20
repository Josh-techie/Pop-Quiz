import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import QuoteImg from "../../Assets/Quote.jpg";

const ForgotPasswd = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = () => {
    setEmailError("");
    if (!email) {
      setEmailError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email");
      return false;
    }
    return true;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setLoading(true);
    setEmailError("");
    setSuccessMessage("");

    try {
      // Action code settings to keep user on platform
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setLoading(false);
      setSuccessMessage(
        `Password reset email sent to ${email}. Please check your inbox.`
      );
      // Clear email after success
      setTimeout(() => {
        setEmail("");
      }, 500);
    } catch (error) {
      setLoading(false);
      console.error("Password reset error:", error);

      // Better error handling
      switch (error.code) {
        case "auth/user-not-found":
          setEmailError("No account found with this email address.");
          break;
        case "auth/invalid-email":
          setEmailError("Invalid email address format.");
          break;
        case "auth/too-many-requests":
          setEmailError("Too many attempts. Please try again later.");
          break;
        case "auth/network-request-failed":
          setEmailError("Network error. Please check your connection.");
          break;
        default:
          setEmailError("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <div className="fullscreen">
      <section className="flex flex-col md:flex-row h-screen items-center overflow-hidden">
        {/* Left Side - Quote Image */}
        <div className="bg-blue-600 hidden lg:block w-full md:w-1/2 h-full">
          <img src={QuoteImg} alt="Quote" className="w-full h-full object-cover" />
        </div>

        {/* Right Side - Form */}
        <div className="bg-white w-full md:max-w-md lg:max-w-full md:mx-auto md:mx-0 md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-12 xl:px-16 flex items-center justify-center overflow-y-auto">
          <div className="w-full py-6 md:py-8">
            {/* Logo */}
            <img
              src={require("../../Assets/Logo.png")}
              alt="Pop Quiz Logo"
              width={120}
              height={150}
              className="mx-auto"
            />

            {/* Header */}
            <h1 className="text-lg md:text-xl font-bold leading-tight mt-6 md:mt-8">
              Forgot Your Password?
            </h1>
            <p className="text-gray-600 text-xs md:text-sm mt-2">
              No worries! Enter your email and we'll send you reset instructions.
            </p>

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mt-4 text-xs" role="alert">
                <p className="font-medium">Email Sent Successfully!</p>
                <p className="text-xs mt-1">{successMessage}</p>
              </div>
            )}

            {/* Form */}
            <form className="mt-4" onSubmit={handleResetPassword}>
              {/* Email Input */}
              <div>
                <label className="block text-gray-700 text-sm">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  placeholder="Enter Email Address"
                  className={`w-full px-3 py-2 md:py-2.5 rounded-lg bg-gray-200 mt-1.5 border focus:bg-white focus:outline-none transition text-sm ${
                    emailError
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  autoFocus
                  autoComplete="email"
                  disabled={loading || successMessage}
                />
                {emailError && (
                  <p className="text-red-500 text-xs mt-1">{emailError}</p>
                )}
                {!emailError && !successMessage && (
                  <p className="text-gray-500 text-xs mt-1.5">
                    Check your spam folder if you don't see the email.
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || successMessage}
                className="w-full block bg-blue-500 hover:bg-blue-400 focus:bg-blue-400 disabled:bg-blue-300 text-white font-semibold rounded-lg px-4 py-2.5 mt-4 transition flex items-center justify-center text-sm"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Sending...
                  </>
                ) : successMessage ? (
                  "Email Sent!"
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="text-center mt-4 md:mt-6">
              <Link
                to="/"
                className="text-blue-500 hover:text-blue-700 font-semibold text-xs md:text-sm"
              >
                ← Back to Login
              </Link>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-3 md:mt-4">
              <p className="text-xs md:text-sm">
                <span className="text-gray-500 mr-1">Don't have an account?</span>
                <Link
                  to="/signup"
                  className="text-xs md:text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPasswd;
