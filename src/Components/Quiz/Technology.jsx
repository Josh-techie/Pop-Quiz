import React, { useState } from "react";
import Navbar from "../Dashboard/NavBar";
import "../../styles/index.css";
import DashboardHeader from "../Dashboard/Header";
import Avatar from "../../Assets/avatar.png";
import PicQuiz from "../../Assets/technology_card.png";
import QuizQuestions from "./QuizQuestions";
import { useNavigate } from "react-router-dom";


function Technology() {
  // Toggle dropdown
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // use navigate to pop quiz questions
  const navigate = useNavigate();

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
            <h2 className="text-4xl font-bold text-gray-700 mb-2">
              History Quiz
            </h2>
            {/* Description */}
            <p className="text-gray-800 mb-4">
              Read the following instructions
            </p>

            {/* Image and Info */}
            <div className="flex items-center">
              <img
                src={PicQuiz}
                alt="Quiz Image"
                className="w-2/4 p-0 rounded-md mr-8 select-none" // Added select-none to make the photo not selectable
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
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              Instructions
            </h2>
            {/* Description */}
            <p className="text-gray-800 mt-4">
              This quiz consists of 5 multiple-choice questions. To be
              successful with the quizzes, it's important to conversant with the
              topics. Keep the following in mind:
            </p>

            <p className="text-gray-800 mt-4">
              Timing - You need to complete each of your attempts in one
              sitting, as you are allotted 30 minutes to each attempt. Answers -
              You may review your answer-choices and compare them to the correct
              answers after your final attempt.
            </p>

            <p className="text-gray-800 mt-4">
              To start, click the "Store" button. When finished, click the
              "Submit" button.
            </p>

            {/* Start Quiz Button */}
            <div className="flex justify-end mt-6">
              <button
                className="bg-gray-700 hover:bg-gray-900 text-white font-semibold py-2 px-8 rounded-full"
                onClick={openModal}
              >
                Start Quiz
              </button>
            </div>
          </div>
        </main>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            {/* Modal panel */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {/* Modal content */}
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Confirm Action
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to start the quiz?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Modal footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    navigate("/technology/quiz-questions"); // Replace "/quiz-questions" with the desired path to QuizQuestions component
                    closeModal(); // Close the modal after redirection
                  }}
                >
                  Confirm
                </button>

                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Technology;
