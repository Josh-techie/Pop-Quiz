import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useLocation } from "react-router-dom";
import { useNotifications } from "../../contexts/NotificationContext";

import {
  Bell,
  Trophy,
  ClipboardEdit,
  User,
  LogOut,
  Home,
} from "lucide-react";
import { motion } from "framer-motion";

import RightArrowIcon from "../../Assets/icons/rightArrow.svg";

const variants = {
  expanded: {
    width: "20%",
    transition: {
      duration: 0.35,
      ease: [0.4, 0, 0.2, 1] // cubic-bezier for smooth deceleration
    }
  },
  nonexpanded: {
    width: "80px",
    transition: {
      duration: 0.35,
      ease: [0.4, 0, 0.2, 1]
    }
  },
};

function Navbar({ activeRoute }) {
  const navigate = useNavigate();
  const auth = getAuth();
  const { unreadCount } = useNotifications();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const location = useLocation();

  return (
    <motion.div
      animate={isExpanded ? "expanded" : "nonexpanded"}
      variants={variants}
      className={
        "py-10 h-screen flex flex-col border border-r-1 bg-[#FDFDFD] relative" +
        (isExpanded ? " px-10" : " px-6")
      }
    >
      {/* Toggle Button */}
      <div
        onClick={toggleExpanded}
        className="cursor-pointer absolute -right-3 top-10 rounded-full w-6 h-6 bg-[#494E52] flex justify-center items-center hover:bg-gray-600 transition-colors"
      >
        <img
          src={RightArrowIcon}
          className={`w-2 transition-transform duration-300 ${
            isExpanded ? "" : "rotate-180"
          }`}
          alt="toggle"
        />
      </div>

      {/* Branding Zone - Logo (only show when expanded) */}
      <div
        className={`flex items-center gap-3 mb-8 h-12 transition-all duration-300 select-none ${
          isExpanded ? 'opacity-100' : 'opacity-0 h-0 mb-0 pointer-events-none'
        }`}
      >
        {/* Logo Mark */}
        <div className="w-10 h-10 bg-[#494E52] rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xl">Q</span>
        </div>
        {/* Logo Text */}
        <span className="font-bold text-xl text-[#494E52] whitespace-nowrap">
          POP QUIZ
        </span>
      </div>

      {/* Navigation Zone */}
      <div className={`flex flex-col space-y-4 transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] select-none ${isExpanded ? '' : 'mt-16 items-center'}`}>
        {/* Home/Dashboard */}
        <div className="w-full relative group">
          <Link
            to="/main"
            className={`flex items-center rounded-xl transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
              location.pathname === "/main" ? "bg-[#494E52] text-white" : "hover:bg-gray-100"
            } ${
              !isExpanded
                ? "justify-center w-12 h-12 p-0"
                : "gap-3 w-full p-3"
            }`}
          >
            <Home className="w-6 h-6 flex-shrink-0" />
            <span
              className={`whitespace-nowrap select-none ${
                isExpanded
                  ? 'opacity-100 translate-x-0 transition-all duration-[250ms] ease-in-out delay-100'
                  : 'opacity-0 -translate-x-3 w-0 transition-all duration-[250ms] ease-in-out'
              }`}
            >
              Dashboard
            </span>
          </Link>
          {/* Tooltip */}
          {!isExpanded && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
              Dashboard
            </div>
          )}
        </div>

        {/* Make a Quiz */}
        <div className="w-full relative group">
          <Link
            to="/makequiz"
            className={`flex items-center rounded-xl transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
              location.pathname === "/makequiz" ? "bg-[#494E52] text-white" : "hover:bg-gray-100"
            } ${
              !isExpanded
                ? "justify-center w-12 h-12 p-0"
                : "gap-3 w-full p-3"
            }`}
          >
            <ClipboardEdit className="w-6 h-6 flex-shrink-0" />
            <span
              className={`whitespace-nowrap select-none ${
                isExpanded
                  ? 'opacity-100 translate-x-0 transition-all duration-[250ms] ease-in-out delay-100'
                  : 'opacity-0 -translate-x-3 w-0 transition-all duration-[250ms] ease-in-out'
              }`}
            >
              Make a Quiz
            </span>
          </Link>
          {/* Tooltip */}
          {!isExpanded && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
              Make a Quiz
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="w-full relative group">
          <Link
            to="/leaderboard"
            className={`flex items-center rounded-xl transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
              location.pathname === "/leaderboard"
                ? "bg-[#494E52] text-white"
                : "hover:bg-gray-100"
            } ${
              !isExpanded
                ? "justify-center w-12 h-12 p-0"
                : "gap-3 w-full p-3"
            }`}
          >
            <Trophy className="w-6 h-6 flex-shrink-0" />
            <span
              className={`whitespace-nowrap select-none ${
                isExpanded
                  ? 'opacity-100 translate-x-0 transition-all duration-[250ms] ease-in-out delay-100'
                  : 'opacity-0 -translate-x-3 w-0 transition-all duration-[250ms] ease-in-out'
              }`}
            >
              Leaderboard
            </span>
          </Link>
          {/* Tooltip */}
          {!isExpanded && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
              Leaderboard
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="w-full relative group">
          <Link
            to="/notification"
            className={`flex items-center rounded-xl transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] relative ${
              location.pathname === "/notification"
                ? "bg-[#494E52] text-white"
                : "hover:bg-gray-100"
            } ${
              !isExpanded
                ? "justify-center w-12 h-12 p-0"
                : "gap-3 w-full p-3"
            }`}
          >
            <div className="relative flex-shrink-0">
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span
              className={`whitespace-nowrap select-none ${
                isExpanded
                  ? 'opacity-100 translate-x-0 transition-all duration-[250ms] ease-in-out delay-100'
                  : 'opacity-0 -translate-x-3 w-0 transition-all duration-[250ms] ease-in-out'
              }`}
            >
              Notifications
            </span>
          </Link>
          {/* Tooltip */}
          {!isExpanded && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
              Notifications
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="w-full relative group">
          <Link
            to="/account"
            className={`flex items-center rounded-xl transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
              location.pathname === "/account" ? "bg-[#494E52] text-white" : "hover:bg-gray-100"
            } ${
              !isExpanded
                ? "justify-center w-12 h-12 p-0"
                : "gap-3 w-full p-3"
            }`}
          >
            <User className="w-6 h-6 flex-shrink-0" />
            <span
              className={`whitespace-nowrap select-none ${
                isExpanded
                  ? 'opacity-100 translate-x-0 transition-all duration-[250ms] ease-in-out delay-100'
                  : 'opacity-0 -translate-x-3 w-0 transition-all duration-[250ms] ease-in-out'
              }`}
            >
              Profile
            </span>
          </Link>
          {/* Tooltip */}
          {!isExpanded && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
              Profile
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="w-full relative group">
          <button
            onClick={handleLogoutClick}
            className={`flex items-center rounded-xl transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-gray-100 ${
              !isExpanded
                ? "justify-center w-12 h-12 p-0"
                : "gap-3 w-full p-3"
            }`}
          >
            <LogOut className="w-6 h-6 flex-shrink-0" />
            <span
              className={`whitespace-nowrap select-none ${
                isExpanded
                  ? 'opacity-100 translate-x-0 transition-all duration-[250ms] ease-in-out delay-100'
                  : 'opacity-0 -translate-x-3 w-0 transition-all duration-[250ms] ease-in-out'
              }`}
            >
              Logout
            </span>
          </button>
          {/* Tooltip */}
          {!isExpanded && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              confirmLogout();
            } else if (e.key === 'Escape') {
              setShowLogoutModal(false);
            }
          }}
        >
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowLogoutModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="relative inline-block w-full max-w-md p-6 my-8 text-center align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100">
                <LogOut className="w-6 h-6 text-[#494E52]" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Sign Out?
              </h3>

              {/* Message */}
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to log out? You'll need to sign in again to access your quizzes and progress.
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Stay Logged In
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#494E52] rounded-lg hover:bg-[#3a3f42] transition-colors"
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default Navbar;
