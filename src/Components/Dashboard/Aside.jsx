import React from "react";
import { Link } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Aside = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const userSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <aside className="bg-gray-200 text-gray-600 w-64 h-screen fixed left-0 top-0 overflow-y-auto">
      {/* Sidebar header */}
      <div className="p-4 flex items-center justify-between bg-gray-700 text-white">
        <div className="flex items-center">
          <img src="logo.png" alt="Logo" className="h-8 w-auto mr-2" />
        </div>
      </div>

      {/* Sidebar navigation */}
      <nav className="px-4 py-2">
        <ul>
          <li className="mb-2">
            <Link
              to="/dashboard"
              className="block p-2 rounded flex items-center hover:bg-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 7a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H4a1 1 0 01-1-1V7zm1-2a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H4z"
                  clipRule="evenodd"
                />
              </svg>
              Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/create-quiz"
              className="block p-2 rounded flex items-center hover:bg-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12zm3-7a1 1 0 00-1-1H6a1 1 0 100 2h6a1 1 0 001-1z"
                  clipRule="evenodd"
                />
              </svg>
              Create Quiz
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/profile"
              className="block p-2 rounded flex items-center hover:bg-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a3 3 0 00-3 3v4a3 3 0 00-3 3v6h18v-6a3 3 0 00-3-3V5a3 3 0 00-3-3H6zm-3 6a1 1 0 011-1h16a1 1 0 011 1v4a1 1 0 01-1 1h-3.5l-1.5 1h-5l-1.5-1H3a1 1 0 01-1-1V8zm5-1a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              Profile
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/notifications"
              className="block p-2 rounded flex items-center hover:bg-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a2 2 0 00-2 2v1H5a1 1 0 00-1 1v10a2 2 0 002 2h6a2 2 0 002-2V6a1 1 0 00-1-1h-3V4a2 2 0 00-2-2zm1 14a1 1 0 01-1 1H6a1 1 0 01-1-1V8h6v8zm-2-9a1 1 0 011-1h2a1 1 0 010 2h-2a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Notifications
            </Link>
          </li>
        </ul>
      </nav>

      {/* Sidebar footer */}
      <div className="absolute bottom-0 w-full p-4">
        <Link
          onClick={userSignOut}
          to="/logout"
          className="block p-2 rounded flex items-center hover:bg-gray-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 2a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2h-1v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8H5a2 2 0 01-2-2V2zm10 1a1 1 0 00-1 1v5a1 1 0 001 1h1V3h-1zm-8 9a1 1 0 00-1-1H4a1 1 0 100 2h1a1 1 0 001-1v-3h2v3zm10 4a1 1 0 01-1 1H7a1 1 0 001-1 011-1V8zm5 0a1 1 0 011-1h2a1 1 0 010 2h-2a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Log out
        </Link>
      </div>
    </aside>
  );
};

export default Aside;


