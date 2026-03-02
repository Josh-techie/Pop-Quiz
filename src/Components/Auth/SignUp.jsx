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

        await sendEmailVerification(authInstance.currentUser);

        setLoading(false);
        setEmail("");
        setPassword("");
        setSuccessMessage(
          "Signed up successfully, please check your email for verification!"
        );
        setTimeout(() => {
          setSuccessMessage("");
        }, 4000);
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
      <section className="flex flex-col md:flex-row h-screen items-center">
        {/* first side */}
        <div
          className="bg-white w-full md:max-w-md lg:max-w-full md:mx-auto md:mx-0 md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12
          flex items-center justify-center"
        >
          <div className="w-full h-100">
            <img
              src={Logo}
              alt="Pop Quiz Logo"
              width={150}
              height={200}
              className="mx-auto"
            />

            <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12">
              Get Started with Pop Quiz 🚀
            </h1>

            <form className="mt-6" onSubmit={signUp}>
              <div>
                <label className="block text-gray-700">Email Address</label>
                <input
                  type="text"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  value={email}
                  placeholder="Enter Email Address"
                  className={`w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:bg-white focus:outline-none transition ${
                    emailError
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  autoFocus
                  autoComplete="off"
                  disabled={loading}
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">{emailError}</p>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-gray-700">Password</label>
                <input
                  type="password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                  value={password}
                  placeholder="Enter Password"
                  className={`w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:bg-white focus:outline-none transition ${
                    passwordError
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  disabled={loading}
                />
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
              </div>

              {successMessage && (
                <div
                  className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4"
                  role="alert"
                >
                  <span className="block sm:inline">{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full block bg-blue-500 hover:bg-blue-400 focus:bg-blue-400 disabled:bg-blue-300 text-white font-semibold rounded-lg px-4 py-3 mt-6 transition flex items-center justify-center"
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

            <hr className="my-6 border-gray-300 w-full" />

            <button
              type="button"
              className="w-full block bg-white hover:bg-gray-100 focus:bg-gray-100 disabled:bg-gray-50 text-gray-900 font-semibold rounded-lg px-4 py-3 border border-gray-300 transition"
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
                  className="w-6 h-6"
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
                <span className="ml-4">Sign Up with Google</span>
              </div>
            </button>

            <p className="mt-8">
              Already Have an account? {""}
              <a
                href="/Login"
                className="text-blue-500 hover:text-blue-700 font-semibold"
              >
                Log In
              </a>
            </p>

            <p className="text-sm text-gray-500 mt-12">
              &copy; Joe ALX 😑- All Rights Reserved.
            </p>
          </div>
        </div>
        {/* second side */}
        <div className="bg-blue-600 hidden lg:block w-full md:w-1/2">
          <img src={QuoteImg} alt="Quote" className="w-full h-full object-cover" />
        </div>
      </section>
    </div>
  );
};

export default SignUp;
