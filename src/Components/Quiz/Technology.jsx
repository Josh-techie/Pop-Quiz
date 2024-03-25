import React from "react";
import Navbar from "../Dashboard/NavBar";
import "../../styles/index.css";
import DashboardHeader from "../Dashboard/Header";
import Avatar from "../../Assets/avatar.png";
import PicQuiz from "../../Assets/technology_card.png";

function Technology() {
  // Toggle dropdown
  const [showDropdown, setShowDropdown] = React.useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="flex flex-col py-10 px-4 sm:px-8 md:px-16 h-auto sm:h-screen overflow-y-auto w-full bg-gray-100">
      <div className="flex">
        {/* Side Navigation Bar */}
        <Navbar />
        <main className="grow main-content">
          {/* Dashboard Header */}
          <DashboardHeader
            toggleDropdown={toggleDropdown}
            showDropdown={showDropdown}
            Avatar={Avatar}
          />

          {/* Card */}
          <div className="flex flex-col py-10 px-4 sm:px-8 md:px-16 h-auto sm:h-screen overflow-y-auto w-full bg-white rounded">
            <h2 className="text-4xl font-bold text-gray-700 mb-2">History Quiz</h2>
            {/* Description */}
            <p className="text-gray-800 mb-4">Read the following instructions</p>

            {/* Image and Info */}
            <div className="flex items-center"> {/* Add items-center to align items vertically in the center */}
              <img
                src={PicQuiz}
                alt="Quiz Image"
                className="w-2/4 p-0 rounded-md mr-8" // Adjusted margin to create space between image and descriptions
              />
              <div className="flex flex-col">
                {/* Description */}
                <p className="text-gray-800 mb-10">
                  <span className="font-bold">Date:</span> March 24, 2024
                </p>
                {/* Description */}
                <p className="text-gray-800 mb-10">
                  <span className="font-bold">Time Limit:</span> 30min
                </p>
                {/* Description */}
                <p className="text-gray-800 mb-10">
                  <span className="font-bold">Attempts:</span> Once
                </p>
                {/* Description */}
                <p className="text-gray-800 mb-10">
                  <span className="font-bold">Points:</span> 200 🌟
                </p>
              </div>
            </div>

            {/* Instruction bold */}
            <h2 className="text-lg font-bold text-gray-700 mb-2">Instructions</h2>
            {/* Description */}
            <p className="text-gray-800 mt-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus auctor ultricies sem nec sagittis. Quisque id velit sed lorem ultricies feugiat vel ac libero. Nam fermentum consectetur eros, eu ultricies neque mollis at.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Technology;
