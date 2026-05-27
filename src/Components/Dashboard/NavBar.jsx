import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useNotifications } from "../../contexts/NotificationContext";
import Logo from "../../Assets/Logo.png";

import {
  Bell,
  Trophy,
  ClipboardEdit,
  User,
  LogOut,
  Home,
} from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const auth = getAuth();
  const location = useLocation();
  const { unreadCount } = useNotifications();

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

  return (
    <>
      {/* Desktop Sidebar - Fixed 240px width */}
      <div className="hidden md:flex w-60 h-screen flex-col bg-white border-r border-gray-200">
        {/* Logo Section - Official Logo */}
        <div className="flex items-center justify-center px-6 py-6 border-b border-gray-100">
          <img
            src={Logo}
            alt="Pop Quiz"
            className="w-full h-auto max-w-[180px] object-contain"
          />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {/* Section: Workspace */}
          <div className="px-3 mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Workspace
            </p>
          </div>

          <Link
            to="/main"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              location.pathname === "/main"
                ? "bg-gray-100 text-[#494E52] font-medium"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">Dashboard</span>
          </Link>

          <Link
            to="/makequiz"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              location.pathname === "/makequiz"
                ? "bg-gray-100 text-[#494E52] font-medium"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ClipboardEdit className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">Make a Quiz</span>
          </Link>

          <Link
            to="/leaderboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              location.pathname === "/leaderboard"
                ? "bg-gray-100 text-[#494E52] font-medium"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Trophy className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">Leaderboard</span>
          </Link>

          {/* Section: Account */}
          <div className="px-3 mt-6 mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Account
            </p>
          </div>

          <Link
            to="/notification"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              location.pathname === "/notification"
                ? "bg-gray-100 text-[#494E52] font-medium"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="relative flex-shrink-0">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span className="text-sm">Notifications</span>
          </Link>

          <Link
            to="/account"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              location.pathname === "/account"
                ? "bg-gray-100 text-[#494E52] font-medium"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">Profile</span>
          </Link>
        </nav>

        {/* Logout Button - Pushed to bottom */}
        <div className="px-4 pb-6 border-t border-gray-100 pt-4">
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 z-50 pb-safe">
        <nav className="flex items-center justify-around h-16 px-2">
          <Link
            to="/main"
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px] ${
              location.pathname === "/main"
                ? "text-[#494E52]"
                : "text-gray-500"
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          <Link
            to="/makequiz"
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px] ${
              location.pathname === "/makequiz"
                ? "text-[#494E52]"
                : "text-gray-500"
            }`}
          >
            <ClipboardEdit className="w-6 h-6" />
            <span className="text-[10px] font-medium">Quiz</span>
          </Link>

          <Link
            to="/leaderboard"
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px] ${
              location.pathname === "/leaderboard"
                ? "text-[#494E52]"
                : "text-gray-500"
            }`}
          >
            <Trophy className="w-6 h-6" />
            <span className="text-[10px] font-medium">Board</span>
          </Link>

          <Link
            to="/notification"
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px] relative ${
              location.pathname === "/notification"
                ? "text-[#494E52]"
                : "text-gray-500"
            }`}
          >
            <div className="relative">
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center text-[9px]">
                  {unreadCount > 9 ? '9' : unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Alerts</span>
          </Link>

          <Link
            to="/account"
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px] ${
              location.pathname === "/account"
                ? "text-[#494E52]"
                : "text-gray-500"
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </nav>
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
    </>
  );
}

export default Navbar;
