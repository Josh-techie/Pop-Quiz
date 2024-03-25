import React from "react";
import Navbar from "../Dashboard/NavBar";
import "../../styles/index.css";
import DashboardHeader from "../Dashboard/Header";
import Avatar from "../../Assets/avatar.png";
import PicQuiz from "../../Assets/technology_card.png";

import { FaFacebook, FaTwitter } from "react-icons/fa";

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
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              History Quiz
            </h2>
            {/* Description */}
            <p className="text-gray-800 mb-4">
              Read the following instructions
            </p>

            {/* Image and Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-stretch w-full">
              <img
                src={PicQuiz}
                alt="Quiz Image"
                className="w-full h-auto sm:w-1/4 h-auto sm:h-64 rounded-md p-0 mb-4 sm:mb-0"
              />
              <div className="flex flex-col items-center sm:items-start flex-grow h-auto sm:pl-4">
                <div className="flex flex-col items-center sm:items-start">
                  {/* Descriptions */}
                  <p className="text-gray-800 mb-2">
                    <span className="font-bold">Date:</span> March 24, 2024
                  </p>
                  <p className="text-gray-800 mb-2">
                    <span className="font-bold">Time Limit:</span> 30min
                  </p>
                  <p className="text-gray-800 mb-2">
                    <span className="font-bold">Attempts:</span> Once
                  </p>
                  <p className="text-gray-800 mb-2">
                    <span className="font-bold">Points:</span> 200 🌟
                  </p>
                  <p className="text-gray-800 mb-4">
                    <span className="font-bold">Share:</span>
                    <a
                      href="https://www.facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mr-2"
                    >
                      <FaFacebook className="text-blue-600 text-xl hover:text-blue-800 cursor-pointer" />
                    </a>
                    <a
                      href="https://www.twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaTwitter className="text-blue-400 text-xl hover:text-blue-600 cursor-pointer" />
                    </a>
                  </p>
                </div>
              </div>
            </div>
            {/* Instruction bold */}
            <h2 className="text-2xl font-bold text-gray-700 mb-2 mt-6">
              Instructions
            </h2>
            {/* Description */}
            <p className="text-gray-800 mt-2 text-justify py-4">
              This quiz consists of 5 multiple-choice questions. To be
              successful with the quizzes, it's important to conversant with the
              topics. Keep the following in mind:
              <br />
            </p>
            <p className="text-justify py-4">
              Timing - You need to complete each of your attempts in one
              sitting, as you are allotted 30 minutes to each attempt. Answers -
              You may review your answer-choices and compare them to the correct
              answers after your final attempt.
            </p>

            <p className="text-justify py-4">
              To start, click the "Store button. When finished, click the
              "Submit" button.
            </p>

            {/* Start Quiz Button */}
            <button className="bg-gray-700 hover:bg-gray-900 text-white font-semibold py-2 px-8 rounded-full mr-4">
              Start Quiz
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Technology;
