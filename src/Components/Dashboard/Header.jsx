import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import PropTypes from "prop-types"; // Import PropTypes for prop validation
import defaultAvatar from "../../Assets/avatar.png";

const DashboardHeader = ({
  toggleDropdown,
  showDropdown,
  avatar = defaultAvatar,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate(); // Use useNavigate hook for navigation
  const dropdownRef = useRef(null); // Ref to the dropdown menu

  // Function to close the dropdown when clicked outside
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownVisible(false);
    }
  };

  // Attach click event listener to the document body
  useEffect(() => {
    document.body.addEventListener("click", handleClickOutside);
    return () => {
      document.body.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleSettingsClick = () => {
    navigate("/account"); // Use navigate function to redirect to Account page
    setDropdownVisible(false);
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

      <button className="bg-gray-700 hover:bg-gray-900 text-white font-semibold py-2 px-8 rounded-full mr-4">
        Start Quiz
      </button>

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
          <div
            ref={dropdownRef}
            className="absolute top-12 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-md p-2"
          >
            <ul>
              <li className="py-1 px-3 hover:bg-gray-100 cursor-pointer">
                Profile
              </li>
              <li
                className="py-1 px-3 hover:bg-gray-100 cursor-pointer"
                onClick={handleSettingsClick}
              >
                Settings
              </li>
              <li className="py-1 px-3 hover:bg-gray-100 cursor-pointer">
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
