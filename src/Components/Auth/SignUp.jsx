import React, { useState } from "react";
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

// Move redirect_home function outside the component
function redirect_home(navigate) {
  navigate("/login");
}

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const provider = new GoogleAuthProvider();
  const authInstance = getAuth();

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
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
        setEmailError("Email already exists in our database.");
      } else {
        await createUserWithEmailAndPassword(authInstance, email, password);

        // Custom action code settings for better email
        const actionCodeSettings = {
          url: `${window.location.origin}/login?verified=true`,
          handleCodeInApp: false,
        };

        await sendEmailVerification(authInstance.currentUser, actionCodeSettings);

        setLoading(false);
        setEmail("");
        setPassword("");
        setSuccessMessage(
          "Account created! Please check your email to verify your account."
        );
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      }
    } catch (error) {
      setLoading(false);
      if (error.code === "auth/email-already-in-use") {
        setEmailError("Email already exists in our database.");
      } else {
        setPasswordError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="fullscreen">
      <section className="flex flex-col md:flex-row h-screen items-center overflow-hidden">
        {/* first side */}
        <div
          className="bg-white w-full md:max-w-md lg:max-w-full md:mx-auto md:mx-0 md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-12 xl:px-16
          flex items-center justify-center overflow-y-auto"
        >
          <div className="w-full py-4 md:py-6">
            <img
              src={Logo}
              alt="Pop Quiz Logo"
              width={120}
              height={150}
              className="mx-auto"
            />

            <h1 className="text-base md:text-lg font-bold leading-tight mt-4 md:mt-6">
              Get Started with Pop Quiz 🚀
            </h1>

            <form className="mt-3" onSubmit={signUp}>
              <div>
                <label className="block text-gray-700 text-sm">Email Address</label>
                <input
                  type="text"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  value={email}
                  placeholder="Enter Email Address"
                  className={`w-full px-3 py-2 md:py-2.5 rounded-lg bg-gray-200 mt-1.5 border focus:bg-white focus:outline-none transition text-sm ${
                    emailError
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  autoFocus
                  autoComplete="off"
                  disabled={loading}
                />
                {emailError && (
                  <p className="text-red-500 text-xs mt-1">{emailError}</p>
                )}
              </div>

              <div className="mt-2.5">
                <label className="block text-gray-700 text-sm">Password</label>
                <input
                  type="password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                  value={password}
                  placeholder="Enter Password"
                  className={`w-full px-3 py-2 md:py-2.5 rounded-lg bg-gray-200 mt-1.5 border focus:bg-white focus:outline-none transition text-sm ${
                    passwordError
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  disabled={loading}
                />
                {passwordError && (
                  <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                )}
              </div>

              {successMessage && (
                <div
                  className="bg-green-100 border border-green-400 text-green-700 px-2.5 py-1.5 rounded relative mt-2.5 text-xs"
                  role="alert"
                >
                  <span className="block sm:inline">{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
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
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>

            <hr className="my-2.5 border-gray-300 w-full" />

            <button
              type="button"
              className="w-full block bg-white hover:bg-gray-100 focus:bg-gray-100 disabled:bg-gray-50 text-gray-900 font-semibold rounded-lg px-4 py-2 border border-gray-300 transition text-sm"
              disabled={loading}
              onClick={() => {
                setLoading(true);
                signInWithPopup(authInstance, provider)
                  .then((result) => {
                    setLoading(false);
                    redirect_home(navigate);
                  })
                  .catch((error) => {
                    setLoading(false);
                    setPasswordError("Google sign up failed. Please try again.");
                  });
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

            <p className="mt-3 text-xs md:text-sm text-center">
              Already Have an account? {""}
              <a
                href="/Login"
                className="text-blue-500 hover:text-blue-700 font-semibold"
              >
                Log In
              </a>
            </p>
          </div>
        </div>
        {/* second side */}
        <div className="bg-blue-600 hidden lg:block w-full md:w-1/2 h-full">
          <img src={QuoteImg} alt="Quote" className="w-full h-full object-cover" />
        </div>
      </section>
    </div>
  );
};

export default SignUp;
