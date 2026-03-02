import React from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import PropTypes from "prop-types"; // Import PropTypes for prop validation
import defaultAvatar from "../../Assets/avatar.png";
import { Link } from "react-router-dom";


const DashboardHeader = ({
  toggleDropdown,
  showDropdown,
  avatar = defaultAvatar,
}) => {
  const navigate = useNavigate(); // Use useNavigate hook for navigation

  // Function to handle logout
  const handleLogout = () => {
    userSignOut(); // Call userSignOut function
  };

  // Function to sign out user
  const userSignOut = () => {
    // Your signOut logic here
    navigate("/login");
  };

  const handleSettingsProfilClick = () => {
    navigate("/account"); // Use navigate function to redirect to Account page
    // rely on parent to control dropdown visibility
  };


  return (
    <div className="flex justify-between items-center mb-8">
      <div className="relative">
        <input
          type="text"
          placeholder="Search"
          className="p-2 pl-8 border rounded-full shadow mr-4 w-64"
        />
        <FaSearch className="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-400" />
      </div>

      <Link to="/makequiz">
        <button className="bg-gray-700 hover:bg-gray-900 text-white font-semibold py-2 px-8 rounded-full mr-4">
          Create your Quiz
        </button>
      </Link>

      <div className="relative">
        <div
          className="h-10 w-10 rounded-full bg-gray-300 cursor-pointer"
          onClick={toggleDropdown}
        >
          <img
            src={avatar}
            alt="Avatar"
            className="w-full h-full rounded-full"
          />
        </div>
        {showDropdown && (
          <div className="absolute top-12 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-md p-2">
            <ul>
              <li
                className="py-1 px-3 hover:bg-gray-100 cursor-pointer"
                onClick={handleSettingsProfilClick}
              >
                Profile
              </li>
              <li
                className="py-1 px-3 hover:bg-gray-100 cursor-pointer"
                onClick={handleSettingsProfilClick}
              >
                Settings
              </li>
              <li
                className="py-1 px-3 hover:bg-gray-100 cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

DashboardHeader.propTypes = {
  toggleDropdown: PropTypes.func.isRequired,
  showDropdown: PropTypes.bool.isRequired,
  avatar: PropTypes.string.isRequired,
};

export default DashboardHeader;
