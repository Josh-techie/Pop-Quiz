import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { getUserStats } from "../../services/firestoreService";
import defaultAvatar from "../../Assets/avatar.png";
import { Flame, Trophy, Target, LogOut } from "lucide-react";

const DashboardHeader = ({
  toggleDropdown,
  showDropdown,
  avatar = defaultAvatar,
}) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [greeting, setGreeting] = useState("Good morning");
  const [stats, setStats] = useState({
    streak: 0,
    quizzesCompleted: 0,
    totalPoints: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);

  // Click-away listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDropdown &&
        dropdownRef.current &&
        avatarRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !avatarRef.current.contains(event.target)
      ) {
        toggleDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown, toggleDropdown]);

  useEffect(() => {
    const fetchUserData = async () => {
      // Get user first name
      if (auth.currentUser?.displayName) {
        // Extract first name (everything before first space)
        const firstName = auth.currentUser.displayName.split(' ')[0];
        setUserName(firstName);
      } else if (auth.currentUser?.email) {
        // Fallback to email username (before @), capitalize first letter
        const emailUser = auth.currentUser.email.split('@')[0];
        // Handle cases like "youssef.abouyahia" -> "Youssef"
        const firstName = emailUser.split('.')[0];
        setUserName(firstName.charAt(0).toUpperCase() + firstName.slice(1));
      }

      // Set time-based greeting
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting("Good morning");
      } else if (hour >= 12 && hour < 18) {
        setGreeting("Good afternoon");
      } else {
        setGreeting("Good evening");
      }

      // Fetch user stats from Firestore
      if (auth.currentUser?.uid) {
        setLoadingStats(true);
        const result = await getUserStats(auth.currentUser.uid);
        if (result.success) {
          setStats(result.data);
        }
        setLoadingStats(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    toggleDropdown(); // Close dropdown
    setShowLogoutModal(true); // Show confirmation modal
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

  const handleSettingsProfilClick = () => {
    navigate("/account");
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
      {/* Left: Greeting - Responsive Text */}
      <h2 className="text-xl font-semibold text-gray-800 w-full sm:w-auto">
        {/* Desktop: "Good morning, Youssef!" */}
        <span className="hidden lg:inline">
          {greeting}, {userName}!
        </span>
        {/* Tablet: "Hello, Youssef!" */}
        <span className="hidden sm:inline lg:hidden">
          Hello, {userName}!
        </span>
        {/* Mobile: "Youssef" */}
        <span className="sm:hidden">
          {userName}
        </span>
      </h2>

      {/* Right: User Utility Zone (Stats + Avatar) */}
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto justify-end">
        {/* Stats Cluster */}
        {loadingStats ? (
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm animate-pulse">
            <div className="w-8 h-4 bg-gray-200 rounded"></div>
            <div className="w-px h-4 bg-gray-200 hidden sm:block"></div>
            <div className="w-8 h-4 bg-gray-200 rounded"></div>
            <div className="w-px h-4 bg-gray-200 hidden sm:block"></div>
            <div className="w-8 h-4 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm select-none">
            {/* Streak */}
            <div className="relative group flex items-center gap-1.5 px-1.5 sm:px-2 py-1 rounded-lg transition-all duration-200 hover:bg-orange-50 cursor-default">
              <Flame className="w-4 h-4 text-orange-500 transition-transform duration-200 group-hover:scale-110" />
              {/* Desktop/Tablet: Show number */}
              <span className="hidden sm:inline text-sm font-bold text-orange-600">
                {stats.streak}
              </span>
              {/* Mobile: Number hidden (icon-only badge) */}
              {/* Tooltip */}
              <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <span className="sm:hidden">Streak: {stats.streak}</span>
                <span className="hidden sm:inline">Day Streak</span>
              </div>
            </div>

            {/* Divider - Hidden on Mobile */}
            <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>

            {/* Quizzes */}
            <div className="relative group flex items-center gap-1.5 px-1.5 sm:px-2 py-1 rounded-lg transition-all duration-200 hover:bg-blue-50 cursor-default">
              <Target className="w-4 h-4 text-blue-500 transition-transform duration-200 group-hover:scale-110" />
              {/* Desktop/Tablet: Show number */}
              <span className="hidden sm:inline text-sm font-bold text-gray-700">
                {stats.quizzesCompleted}
              </span>
              {/* Mobile: Number hidden (icon-only badge) */}
              {/* Tooltip */}
              <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <span className="sm:hidden">Quizzes: {stats.quizzesCompleted}</span>
                <span className="hidden sm:inline">Quizzes Completed</span>
              </div>
            </div>

            {/* Divider - Hidden on Mobile */}
            <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>

            {/* Points */}
            <div className="relative group flex items-center gap-1.5 px-1.5 sm:px-2 py-1 rounded-lg transition-all duration-200 hover:bg-purple-50 cursor-default">
              <Trophy className="w-4 h-4 text-purple-500 transition-transform duration-200 group-hover:scale-110" />
              {/* Desktop/Tablet: Show number */}
              <span className="hidden sm:inline text-sm font-bold text-gray-700">
                {stats.totalPoints}
              </span>
              {/* Mobile: Number hidden (icon-only badge) */}
              {/* Tooltip */}
              <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <span className="sm:hidden">Points: {stats.totalPoints}</span>
                <span className="hidden sm:inline">Total Points</span>
              </div>
            </div>
          </div>
        )}

        {/* Avatar Dropdown */}
        <div className="relative">
          <div
            ref={avatarRef}
            className="h-10 w-10 rounded-full bg-gray-300 cursor-pointer hover:ring-2 hover:ring-[#6B7A8F] transition-all hover:scale-105 active:scale-95 select-none"
            onClick={toggleDropdown}
            style={{
              transition: "transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55), box-shadow 0.2s ease",
            }}
          >
            <img
              src={avatar}
              alt="Avatar"
              className="w-full h-full rounded-full pointer-events-none"
            />
          </div>
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute top-12 right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px] animate-dropdown-entry"
              style={{
                animation: "dropdownEntry 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards",
              }}
            >
              <ul className="select-none">
                <li
                  className="py-2 px-4 hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors text-sm"
                  onClick={handleSettingsProfilClick}
                >
                  Profile
                </li>
                <li
                  className="py-2 px-4 hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors text-sm"
                  onClick={handleSettingsProfilClick}
                >
                  Settings
                </li>
                <hr className="my-1 border-gray-200" />
                <li
                  className="py-2 px-4 hover:bg-gray-50 cursor-pointer text-red-600 transition-colors text-sm font-medium"
                  onClick={handleLogout}
                >
                  Logout
                </li>
              </ul>
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
    </div>
  );
};

DashboardHeader.propTypes = {
  toggleDropdown: PropTypes.func.isRequired,
  showDropdown: PropTypes.bool.isRequired,
  avatar: PropTypes.string,
};

export default DashboardHeader;
