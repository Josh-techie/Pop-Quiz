import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useLocation } from "react-router-dom";

import Logo from "../../Assets/Logo.png";

import {
  ArrowLeftRightIcon,
  BarChart3Icon,
  LayoutDashboard,
  HelpCircleIcon,
  LogOutIcon,
  BookMarkedIcon,
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

        <div className="nav-links w-full">
          <Link
            to="/makequiz"
            className={`flex space-x-3 w-full p-2 rounded transition-all ${
              location.pathname === "/makequiz" ? "bg-[#494E52] text-white" : "hover:bg-gray-100"
            } ${!isExpanded ? "justify-center" : ""}`}
          >
            <BookMarkedIcon className="w-6 h-6 flex-shrink-0" />
            <span className={!isExpanded ? "hidden" : "block whitespace-nowrap"}>
              Make a Quiz
            </span>
          </Link>
        </div>

        <div className="nav-links w-full">
          <Link
            to="/leaderboard"
            className={`flex space-x-3 w-full p-2 rounded transition-all ${
              location.pathname === "/leaderboard"
                ? "bg-[#494E52] text-white"
                : "hover:bg-gray-100"
            } ${!isExpanded ? "justify-center" : ""}`}
          >
            <BarChart3Icon className="w-6 h-6 flex-shrink-0" />
            <span className={!isExpanded ? "hidden" : "block"}>
              Leaderboard
            </span>
          </Link>
        </div>

        <div className="nav-links w-full">
          <Link
            to="/notification"
            className={`flex space-x-3 w-full p-2 rounded transition-all ${
              location.pathname === "/notification"
                ? "bg-[#494E52] text-white"
                : "hover:bg-gray-100"
            } ${!isExpanded ? "justify-center" : ""}`}
          >
            <ArrowLeftRightIcon className="w-6 h-6 flex-shrink-0" />
            <span className={!isExpanded ? "hidden" : "block"}>
              Notifications
            </span>
          </Link>
        </div>

        <div className="nav-links w-full">
          <Link
            to="/account"
            className={`flex space-x-3 w-full p-2 rounded transition-all ${
              location.pathname === "/account" ? "bg-[#494E52] text-white" : "hover:bg-gray-100"
            } ${!isExpanded ? "justify-center" : ""}`}
          >
            <HelpCircleIcon className="w-6 h-6 flex-shrink-0" />
            <span className={!isExpanded ? "hidden" : "block"}>Profil</span>
          </Link>
        </div>

        <div className="nav-links w-full">
          <Link
            onClick={userSignOut}
            to="/logout"
            className={`flex space-x-3 w-full p-2 rounded transition-all ${
              location.pathname === "/logout" ? "bg-[#494E52] text-white" : "hover:bg-gray-100"
            } ${!isExpanded ? "justify-center" : ""}`}
          >
            <LogOutIcon className="w-6 h-6 flex-shrink-0" />
            <span className={!isExpanded ? "hidden" : "block"}>Logout</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default Navbar;
