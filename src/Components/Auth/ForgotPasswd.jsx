import React, { useState } from "react";
import { auth } from "../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

const ForgotPasswd = () => {
  const [email, setEmail] = useState("");
  const [notification, setNotification] = useState("");

  const handleResetPassword = (e) => {
    e.preventDefault();

    // Send password reset email
    sendPasswordResetEmail(auth, email)
      .then(() => {
        // Reset email input and show success notification
        setEmail("");
        setNotification(
          `An email has been sent to ${email} for password reset.`
        );
        setTimeout(() => {
          setNotification("");
        }, 3000);
      })
      .catch((error) => {
        // Handle errors
        if (error.code === "auth/user-not-found") {
          setNotification("No user with that email exists.");
        } else {
          setNotification("An error occurred. Please try again later.");
        }
        setTimeout(() => {
          setNotification("");
        }, 3000);
      });
  };

  return (
    <div className="fullscreen">
      <section className="flex flex-col md:flex-row h-screen items-center">
        <div
          className="bg-white w-full md:max-w-md lg:max-w-full md:mx-auto md:mx-0 md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12
          flex items-center justify-center"
        >
          <div className="w-full h-100">
            <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12">
              Forgot Your Password?
            </h1>

            <form className="mt-6" onSubmit={handleResetPassword}>
              <div>
                <label className="block text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email Address"
                  className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
                  autoFocus
                  autoComplete="off"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full block bg-blue-500 hover:bg-blue-400 focus:bg-blue-400 text-white font-semibold rounded-lg
                px-4 py-3 mt-6"
              >
                Reset Password
              </button>
            </form>

            {/* Display notification */}
            {notification && (
              <div className="bg-green-500 text-white px-4 py-3 rounded mt-4">
                {notification}
              </div>
            )}

            <p className="mt-8">
              <a
                href="/Login"
                className="text-blue-500 hover:text-blue-700 font-semibold"
              >
                Back to Login
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPasswd;
