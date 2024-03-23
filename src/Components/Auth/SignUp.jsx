import React, { useState } from "react";
import { auth } from "../../firebase";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

// Move redirect_home function outside the component
function redirect_home(navigate) {
  navigate("/dashboard");
}

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState("");
  const navigate = useNavigate(); // Get navigate function from useNavigate

  // to sign up with google
  const provider = new GoogleAuthProvider();
  const authInstance = getAuth();

  const signUp = async (e) => {
    e.preventDefault();

    try {
      // Check if the email already exists
      const signInMethods = await fetchSignInMethodsForEmail(
        authInstance,
        email
      );

      if (signInMethods.length > 0) {
        // Email already exists, show notification
        setNotification("Email already exists in our database.");
        // Clear notification after 3 seconds
        setTimeout(() => {
          setNotification("");
        }, 3000);
      } else {
        // Email doesn't exist, proceed with sign up
        const userCredential = await createUserWithEmailAndPassword(
          authInstance,
          email,
          password
        );

        // Send email verification
        await sendEmailVerification(authInstance.currentUser);

        // Clear input fields
        setEmail("");
        setPassword("");

        // Set notification for successful sign-up
        setNotification(
          "Signed up successfully, please check your email for verification!"
        );
        // Clear notification after 3 seconds
        setTimeout(() => {
          setNotification("");
        }, 3000);
      }
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        // Error occurred, set notification accordingly
        setNotification("Email already exists in our database.");

        // Clear notification after 3 seconds
        setTimeout(() => {
          setNotification("");
        }, 3000);
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
              src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F029a1497-45bd-4b48-af71-c2ab8a918091%2F5f8b096b-a2b8-4b23-998e-0084f415fb2c%2FLogo.png?table=block&id=30fc8a2c-e3f9-4b99-868c-3690d70e7e59&spaceId=029a1497-45bd-4b48-af71-c2ab8a918091&width=2000&userId=9d08c749-75eb-439d-ad10-2a83e114a53b&cache=v2"
              alt="logo"
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
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  placeholder="Enter Email Address"
                  className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
                  autoFocus
                  autoComplete="off"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-gray-700">Password</label>
                <input
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  placeholder="Enter Password"
                  minLength="6"
                  className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500
                  focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full block bg-blue-500 hover:bg-blue-400 focus:bg-blue-400 text-white font-semibold rounded-lg
                px-4 py-3 mt-6"
              >
                Sign Up
              </button>
            </form>

            {/* Display notification */}
            {notification && (
              <div
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4"
                role="alert"
              >
                <span className="block sm:inline">{notification}</span>
              </div>
            )}

            <hr className="my-6 border-gray-300 w-full" />

            <button
              type="button"
              className="w-full block bg-white hover:bg-gray-100 focus:bg-gray-100 text-gray-900 font-semibold rounded-lg px-4 py-3 border border-gray-300"
              onClick={() => {
                signInWithPopup(authInstance, provider)
                  .then((result) => {
                    // Redirect to dashboard after successful authentication
                    redirect_home(navigate);
                  })
                  .catch((error) => {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    // The email of the user's account used.
                    var email = error.email;
                    // The firebase.auth.AuthCredential type that was used.
                    var credential = error.credential;
                    // ...
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
                <span className="ml-4">Log in with Google</span>
              </div>
            </button>

            <p className="mt-8">
              Already Have an account?{""}
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
        <div className="bg-blue-600 hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen">
          <img
            src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F029a1497-45bd-4b48-af71-c2ab8a918091%2F956aa46a-b180-4bff-92f8-3f525f478b13%2FQuote.png?table=block&id=f1945a54-8da6-40f5-9db5-8015f73f337b&spaceId=029a1497-45bd-4b48-af71-c2ab8a918091&width=2000&userId=9d08c749-75eb-439d-ad10-2a83e114a53b&cache=v2"
            alt="img of quote"
            className="w-full h-full object-cover"
          />
        </div>
      </section>
    </div>
  );
};

export default SignUp;

