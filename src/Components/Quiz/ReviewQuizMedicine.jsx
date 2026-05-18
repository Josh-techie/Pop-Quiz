import React, { useState, useEffect } from "react";
import Navbar from "../Dashboard/NavBar";
import DashboardHeader from "../Dashboard/Header";
import Avatar from "../../Assets/avatar.png";
import quizData from "../Data/Quiz.json";
import { Link } from "react-router-dom";

function ReviewQuizMedicine() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    // Retrieve user answers from local storage
    const storedUserAnswers = localStorage.getItem("userAnswers");
    if (storedUserAnswers) {
      setUserAnswers(JSON.parse(storedUserAnswers));
    }
  }, []);

  // Function to get the correct option for a given question
  const getCorrectOption = (questionIndex) => {
    return quizData[1].quiz_questions[questionIndex].options[
      quizData[1].quiz_questions[questionIndex].correct_option
    ];
  };

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleNext = () => {
    if (currentQuestionIndex < quizData[1].quiz_questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const currentQuestion = quizData[1].quiz_questions[currentQuestionIndex];
  const isSelected = (optionIndex) => userAnswers[currentQuestionIndex] === optionIndex;
  const isCorrect = (optionIndex) => optionIndex === currentQuestion.correct_option;

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

        {/* Review Content */}
        <div className="flex-1 px-4 md:px-8 pb-4 md:pb-8 overflow-hidden flex flex-col">
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  {quizData[1].quiz_title}
                </h2>
                <p className="text-gray-500 text-xs md:text-sm">Review your answers</p>
              </div>
              <div className="text-gray-600 text-sm font-medium">
                Question {currentQuestionIndex + 1}/{quizData[1].quiz_questions.length}
              </div>
            </div>

            {/* Question */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 flex-shrink-0">
                {currentQuestion.question_text}
              </h3>

              {/* Options */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {currentQuestion.options.map((option, optionIndex) => {
                  const selected = isSelected(optionIndex);
                  const correct = isCorrect(optionIndex);

                  let bgColor = "";
                  let borderColor = "border-gray-200";
                  let textColor = "text-gray-700";
                  let label = "";

                  if (selected && correct) {
                    bgColor = "bg-green-50";
                    borderColor = "border-green-500";
                    textColor = "text-green-700";
                    label = "Your Answer";
                  } else if (selected && !correct) {
                    bgColor = "bg-red-50";
                    borderColor = "border-red-500";
                    textColor = "text-red-700";
                    label = "Your Answer";
                  } else if (!selected && correct) {
                    bgColor = "bg-green-50";
                    borderColor = "border-green-500";
                    textColor = "text-green-700";
                    label = "Correct Answer";
                  }

                  return (
                    <div
                      key={optionIndex}
                      className={`p-3 md:p-4 rounded-lg border-2 ${bgColor} ${borderColor} transition-all`}
                    >
                      <div className="flex justify-between items-start">
                        <p className={`${textColor} font-medium text-sm md:text-base flex-1`}>
                          {option}
                        </p>
                        {label && (
                          <span className={`text-xs font-semibold ml-3 px-2 py-1 rounded ${
                            label === "Correct Answer" ? "bg-green-100 text-green-700" :
                            correct ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {label}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`${
                  currentQuestionIndex === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#6B7A8F] hover:bg-[#5a6675]"
                } text-white font-medium py-2 md:py-2.5 px-6 md:px-8 rounded-lg transition-colors text-sm`}
              >
                Previous
              </button>

              {currentQuestionIndex === quizData[1].quiz_questions.length - 1 ? (
                <Link to="/main">
                  <button className="bg-[#6B7A8F] hover:bg-[#5a6675] text-white font-medium py-2 md:py-2.5 px-6 md:px-8 rounded-lg transition-colors text-sm">
                    Finish Review
                  </button>
                </Link>
              ) : (
                <button
                  onClick={handleNext}
                  className="bg-[#6B7A8F] hover:bg-[#5a6675] text-white font-medium py-2 md:py-2.5 px-6 md:px-8 rounded-lg transition-colors text-sm"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ReviewQuizMedicine;
