import React, { useState } from "react";
import Navbar from "../Dashboard/NavBar";
import DashboardHeader from "../Dashboard/Header";
import Avatar from "../../Assets/avatar.png";
// PicTechnology import removed (not used)
import quizData from "../Data/Quiz.json";
import { useNavigate } from "react-router-dom";
import medicineImg from "../../Assets/medicine_card.jpg";

function Medicine() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // Timer removed because it's not used in this component

  // render the page dynamically
  // get the quititle from the quizData
  const quizTitle = quizData[1].quiz_title;
  // get quiz date from the quizData
  const quizDate = quizData[1].quiz_date;

  // get quiz time_limit
  const quizTimeLimit = quizData[1].quiz_time_limit;

  // nbr of attemps fetching
  const quizAttempts = quizData[1].quiz_nb_of_attempts;

  // fetch quiz points
  const quizPoints = quizData[1].quiz_points;

  // fetch quiz description
  const quizDescription = quizData[1].quiz_description;

  // fetch the number of questions from the data file
  const nbrOfQuestions = quizData[1].quiz_nb_of_questions;

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const navigate = useNavigate();

  // Timer-related handlers removed because they were not used

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Side Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard Header */}
        <div className="flex-shrink-0 py-4 md:py-6 px-4 md:px-8 bg-gray-100">
          <DashboardHeader
            toggleDropdown={toggleDropdown}
            showDropdown={showDropdown}
            Avatar={Avatar}
          />
        </div>

        {/* Content - No Scroll */}
        <div className="flex-1 px-4 md:px-8 pb-4 md:pb-8 overflow-y-auto md:overflow-hidden flex flex-col">
          {/* Card */}
          <div className="bg-white rounded-xl shadow-sm p-3 md:p-6 flex-1 flex flex-col md:overflow-hidden">
            <h2 className="text-lg md:text-2xl font-bold text-gray-800 mb-1">
              {quizTitle}
            </h2>
            <p className="text-gray-500 text-xs md:text-sm mb-2 md:mb-3">
              Read the following instructions
            </p>

            {/* Image and Info - Side by Side */}
            <div className="flex flex-col md:flex-row gap-3 mb-2 flex-shrink-0">
              {/* Image */}
              <div className="md:w-2/5 flex-shrink-0">
                <img
                  src={medicineImg}
                  alt="medicine illustration"
                  className="w-full h-32 md:h-40 rounded-lg object-cover select-none"
                />
              </div>

              {/* Info */}
              <div className="md:w-3/5 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 content-center text-xs md:text-sm">
                <div className="flex gap-1">
                  <span className="font-semibold text-gray-700">Date:</span>
                  <span className="text-gray-600">{quizDate}</span>
                </div>
                <div className="flex gap-1">
                  <span className="font-semibold text-gray-700">Time Limit:</span>
                  <span className="text-gray-600">{quizTimeLimit}</span>
                </div>
                <div className="flex gap-1">
                  <span className="font-semibold text-gray-700">Attempts:</span>
                  <span className="text-gray-600">{quizAttempts}</span>
                </div>
                <div className="flex gap-1">
                  <span className="font-semibold text-gray-700">Points:</span>
                  <span className="text-gray-600">{quizPoints} ⭐</span>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="mb-2 flex-shrink-0">
              <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">
                Description
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed text-justify">
                {quizDescription}
              </p>
            </div>

            {/* Instructions Section */}
            <div className="mb-2 flex-shrink-0">
              <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">
                Instructions
              </h3>
              <div className="text-gray-600 text-xs leading-relaxed text-justify">
                <p className="mb-1">
                  This quiz consists of <span className="font-semibold">{nbrOfQuestions}</span> multiple-choice questions. To be successful with the quizzes, it's important to conversant with the topics. Keep the following in mind:
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Timing</span> - You need to complete each of your attempts in one sitting, as you are allotted {quizTimeLimit} to each attempt. <span className="font-semibold text-gray-800">Answers</span> - You may review your answer-choices and compare them to the correct answers after your final attempt.
                </p>
              </div>
            </div>

            {/* Start Quiz Button */}
            <div className="flex justify-end pt-2 mt-auto border-t border-gray-200 flex-shrink-0">
              <button
                className="bg-[#6B7A8F] hover:bg-[#5a6675] text-white font-medium py-2 px-6 md:px-8 rounded-lg transition-colors duration-200 text-xs md:text-sm"
                onClick={openModal}
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </main>
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
                    navigate("/medicinequestions"); // Replace "/quiz-questions" with the desired path to QuizQuestions component
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

export default Medicine;
