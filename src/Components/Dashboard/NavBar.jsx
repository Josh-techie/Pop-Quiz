import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useLocation } from "react-router-dom";
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
import { motion } from "framer-motion";

import RightArrowIcon from "../../Assets/icons/rightArrow.svg";

const variants = {
  expanded: { width: "20%" },
  nonexpanded: { width: "80px" },
};

function Navbar({ activeRoute }) {
  const navigate = useNavigate();
  const auth = getAuth();
  const { unreadCount } = useNotifications();

  const userSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const [isExpanded, setIsExpanded] = useState(false); // Closed by default

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
      <div
        onClick={toggleExpanded}
        className="cursor-pointer absolute -right-3 top-10 rounded-full w-6 h-6 bg-[#494E52] flex justify-center items-center"
      >
        <img src={RightArrowIcon} className="w-2" alt="arrow" />
      </div>

      <div className={`logo-div flex space-x-4 items-center mb-4 ${!isExpanded ? "justify-center" : ""}`}>
        <Link to="/main" className="flex items-center">
          {isExpanded ? (
            <img src={Logo} alt="Pop Quiz Logo" width={170} className="h-auto" />
          ) : (
            <div className="w-12 h-12 bg-[#494E52] rounded-lg flex items-center justify-center shadow-md hover:bg-gray-600 transition-colors">
              <Home className="w-6 h-6 text-white" />
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-col space-y-8 mt-12">

        {/* Make a Quiz */}
        <div className="nav-links w-full relative group">
          <Link
            to="/makequiz"
            className={`flex space-x-3 w-full p-2 rounded transition-all ${
              location.pathname === "/makequiz" ? "bg-[#494E52] text-white" : "hover:bg-gray-100"
            } ${!isExpanded ? "justify-center" : ""}`}
          >
            <ClipboardEdit className="w-6 h-6 flex-shrink-0" />
            <span className={!isExpanded ? "hidden" : "block whitespace-nowrap"}>
              Make a Quiz
            </span>
          </Link>
          {/* Tooltip - only show when collapsed */}
          {!isExpanded && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
              Make a Quiz
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="nav-links w-full relative group">
          <Link
            to="/leaderboard"
            className={`flex space-x-3 w-full p-2 rounded transition-all ${
              location.pathname === "/leaderboard"
                ? "bg-[#494E52] text-white"
                : "hover:bg-gray-100"
            } ${!isExpanded ? "justify-center" : ""}`}
          >
            <Trophy className="w-6 h-6 flex-shrink-0" />
            <span className={!isExpanded ? "hidden" : "block"}>
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
        <div className="nav-links w-full relative group">
          <Link
            to="/notification"
            className={`flex space-x-3 w-full p-2 rounded transition-all relative ${
              location.pathname === "/notification"
                ? "bg-[#494E52] text-white"
                : "hover:bg-gray-100"
            } ${!isExpanded ? "justify-center" : ""}`}
          >
            <div className="relative flex-shrink-0">
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span className={!isExpanded ? "hidden" : "block"}>
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
        <div className="nav-links w-full relative group">
          <Link
            to="/account"
            className={`flex space-x-3 w-full p-2 rounded transition-all ${
              location.pathname === "/account" ? "bg-[#494E52] text-white" : "hover:bg-gray-100"
            } ${!isExpanded ? "justify-center" : ""}`}
          >
            <User className="w-6 h-6 flex-shrink-0" />
            <span className={!isExpanded ? "hidden" : "block"}>Profile</span>
          </Link>
          {/* Tooltip */}
          {!isExpanded && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
              Profile
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="nav-links w-full relative group">
          <Link
            onClick={userSignOut}
            to="/logout"
            className={`flex space-x-3 w-full p-2 rounded transition-all ${
              location.pathname === "/logout" ? "bg-[#494E52] text-white" : "hover:bg-gray-100"
            } ${!isExpanded ? "justify-center" : ""}`}
          >
            <LogOut className="w-6 h-6 flex-shrink-0" />
            <span className={!isExpanded ? "hidden" : "block"}>Logout</span>
          </Link>
          {/* Tooltip */}
          {!isExpanded && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default Navbar;
