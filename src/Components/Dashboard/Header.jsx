import React from "react";
import { FaSearch } from "react-icons/fa";
import Avatar from "../../Assets/avatar.jpeg"; 


const DashboardHeader = ({ toggleDropdown, showDropdown, Avatar }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      {/* Search bar with loop icon */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search"
          className="p-2 pl-8 border rounded-full shadow mr-4 w-64"
        />
        <FaSearch className="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-400" />
      </div>

      {/* Start Quiz button */}
      <button className="bg-gray-700 hover:bg-gray-900 text-white font-semibold py-2 px-8 rounded-full mr-4">
        Start Quiz
      </button>

      {/* Profile avatar */}
      <div className="relative">
        <div
          className="h-10 w-10 rounded-full bg-gray-300 cursor-pointer"
          onClick={toggleDropdown}
        >
          <img
            src={Avatar}
            alt="Avatar"
            className="w-full h-full rounded-full"
          />
        </div>
        {/* Dropdown list */}
        {showDropdown && (
          <div className="absolute top-12 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-md p-2">
            <ul>
              <li className="py-1 px-3 hover:bg-gray-100 cursor-pointer">
                Profile
              </li>
              <li className="py-1 px-3 hover:bg-gray-100 cursor-pointer">
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

export default DashboardHeader;
