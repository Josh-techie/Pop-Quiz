import React, { useState, Fragment, useEffect } from "react";
import Navbar from "../Dashboard/NavBar";
import DashboardHeader from "../Dashboard/Header";
import Avatar from "../../Assets/avatar.png";
import medicineQuestions from "../../Assets/medicineQuestions.jpg";
import { useNavigate } from "react-router-dom";
import Timer from "./Timer";
import quizData from "../Data/Quiz.json";
import { Dialog, Transition } from "@headlessui/react";
import "../../styles/index.css";

function MedicineQuestions() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // State to keep track of selected option
  const [userAnswers, setUserAnswers] = useState([]); // State to store user answers
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false); // State for submit confirmation modal
  const [isAbandonModalOpen, setIsAbandonModalOpen] = useState(false); // State for abandon quiz modal
  const [pendingNavigation, setPendingNavigation] = useState(null); // Store the intended navigation path
  const [flaggedQuestions, setFlaggedQuestions] = useState([]); // Track flagged questions
  const [quizScore, setQuizScore] = useState(0); // Store the quiz score

  //to use redirections
  const navigate = useNavigate();

  // Fetch quiz title
  const quizTitle = quizData[1].quiz_title;

  // Fetch the quiz data number of questions
  const numberOfQuestions = quizData[1].quiz_questions.length;

  // quizDescription not used directly here; removed to satisfy lint

  // Fetch quiz questions
  const quizQuestions = quizData[1].quiz_questions.map(
    (question) => question.question_text
  );

  // fetch the time quiz
  const timeLimit = quizData[1].quiz_time_limit;

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) =>
      prevIndex < numberOfQuestions - 1 ? prevIndex + 1 : prevIndex
    );
    setSelectedOption(userAnswers[currentQuestionIndex + 1]); // Save selected option when moving to next question
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
    setSelectedOption(userAnswers[currentQuestionIndex - 1]); // Restore previous answer
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setUserAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      updatedAnswers[currentQuestionIndex] = option;
      return updatedAnswers;
    });
  };

  const handleSubmitClick = () => {
    // Show confirmation modal first
    setIsSubmitConfirmOpen(true);
  };

  const handleConfirmSubmit = () => {
    // Calculate score
    let correctAnswers = 0;
    quizData[1].quiz_questions.forEach((question, index) => {
      if (userAnswers[index] === question.correct_option) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / numberOfQuestions) * 100);
    setQuizScore(score);

    // Store user answers in local storage
    localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
    localStorage.setItem("quizScore", score.toString());

    // Close confirmation, show results
    setIsSubmitConfirmOpen(false);
    setIsModalOpen(true);
  };

  const handleCancelSubmit = () => {
    setIsSubmitConfirmOpen(false);
  };

  const handleTimeUp = () => {
    // Auto-submit when time runs out
    handleConfirmSubmit();
  };

  const handleRetry = () => {
    // Add your retry logic here
    setIsModalOpen(false); // Close the modal after handling the retry action
    navigate("/medicine");
  };

  const handleReview = () => {
    // Save user answers to local storage
    localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
    setIsModalOpen(false); // Close the modal after handling the review action
    navigate("/quiz-review-medicine");
  };

  // Intercept clicks on navbar links and show abandon modal
  const handleNavClick = (e, path) => {
    e.preventDefault();
    setPendingNavigation(path);
    setIsAbandonModalOpen(true);
  };

  const handleAbandonQuiz = () => {
    setIsAbandonModalOpen(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  const handleContinueQuiz = () => {
    setIsAbandonModalOpen(false);
    setPendingNavigation(null);
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      if (prev.includes(currentQuestionIndex)) {
        return prev.filter(i => i !== currentQuestionIndex);
      } else {
        return [...prev, currentQuestionIndex];
      }
    });
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setSelectedOption(userAnswers[index]);
  };

  const getQuestionStatus = (index) => {
    if (userAnswers[index] !== undefined) return 'answered';
    return 'unanswered';
  };

  // Prevent navigation away from quiz
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    const handleClick = (e) => {
      // Check if click is on navbar links, header buttons, or other navigation elements
      const target = e.target.closest('a, button[type="button"]');

      // Skip if it's our quiz navigation buttons (Back, Next, Submit, Flag, Question Map)
      if (target) {
        const isQuizButton = target.closest('.quiz-navigation-buttons') ||
                           target.closest('.quiz-question-map') ||
                           target.closest('.flag-button');

        // If it's a link or button outside quiz controls
        if (!isQuizButton) {
          const isNavbarLink = target.closest('nav') || target.closest('.nav-links') || target.tagName === 'A';
          const isHeaderButton = target.closest('header') || target.textContent.includes('Create your Quiz');

          if (isNavbarLink || isHeaderButton) {
            e.preventDefault();
            e.stopPropagation();
            setIsAbandonModalOpen(true);

            // Try to extract navigation path
            const href = target.getAttribute('href') || target.closest('a')?.getAttribute('href');
            if (href) {
              setPendingNavigation(href);
            }
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Side Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard Header */}
        <div className="flex-shrink-0 py-6 px-8 bg-gray-100">
          <DashboardHeader
            toggleDropdown={toggleDropdown}
            showDropdown={showDropdown}
            Avatar={Avatar}
          />
        </div>

        {/* Quiz Content - No Scroll */}
        <div className="flex-1 px-4 md:px-8 pb-4 md:pb-8 overflow-hidden flex gap-4">
          {/* Main Quiz Content */}
          <div className="flex-1 bg-white rounded-xl shadow-sm p-4 md:p-6 flex flex-col overflow-hidden">
            {/* Header with Timer */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  {quizTitle}
                </h2>
                <p className="text-gray-500 text-xs md:text-sm">Answer the question below</p>
              </div>
              <div className="flex items-center gap-2 text-gray-700 text-sm bg-gray-50 px-3 py-1.5 rounded-lg">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <Timer duration={timeLimit} onTimeUp={handleTimeUp} />
              </div>
            </div>

            {/* Question and Image Section */}
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
              <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                {/* Left: Question and Answers */}
                <div className="flex-1 flex flex-col min-w-0">
                  <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2">
                    Question {currentQuestionIndex + 1}/{numberOfQuestions}
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm mb-4">
                    {quizQuestions[currentQuestionIndex]}
                  </p>

                  {/* Choose Answer */}
                  <div className="flex-1">
                    <h4 className="text-gray-500 text-xs md:text-sm mb-3">Choose answer</h4>
                    <div className="space-y-2">
                      {quizData[1].quiz_questions[
                        currentQuestionIndex
                      ].options.map((option, index) => (
                        <label key={index} className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                          <input
                            type="radio"
                            name="answer"
                            className="w-4 h-4 text-gray-700 mr-3 flex-shrink-0 mt-0.5"
                            checked={selectedOption === index}
                            onChange={() => handleOptionChange(index)}
                          />
                          <span className="text-gray-700 text-xs md:text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Image */}
                <div className="lg:w-2/5 flex items-start justify-center flex-shrink-0">
                  <img
                    src={medicineQuestions}
                    alt="quiz illustration"
                    className="w-full max-w-[280px] h-auto rounded-lg object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center gap-2 md:gap-3 pt-3 md:pt-4 mt-3 md:mt-4 flex-shrink-0 quiz-navigation-buttons">
              <button
                onClick={toggleFlag}
                className={`flag-button flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  flaggedQuestions.includes(currentQuestionIndex)
                    ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" />
                </svg>
                <span className="text-xs md:text-sm">Flag</span>
              </button>

              <div className="flex gap-2 md:gap-3">
                <button
                  className={`${
                    currentQuestionIndex === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#6B7A8F] hover:bg-[#5a6675]"
                  } text-white font-medium py-2 md:py-2.5 px-6 md:px-8 rounded-lg transition-colors text-xs md:text-sm`}
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Back
                </button>

                <button
                  className="bg-[#6B7A8F] hover:bg-[#5a6675] text-white font-medium py-2 md:py-2.5 px-6 md:px-8 rounded-lg transition-colors text-xs md:text-sm"
                  onClick={
                    currentQuestionIndex === numberOfQuestions - 1
                      ? handleSubmitClick
                      : handleNextQuestion
                  }
                >
                  {currentQuestionIndex === numberOfQuestions - 1
                    ? "Submit"
                    : "Next"}
                </button>
              </div>
            </div>
          </div>

          {/* Question Navigation Sidebar (Moodle-style) */}
          <div className="hidden lg:block w-64 bg-white rounded-xl shadow-sm p-4 quiz-question-map">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Quiz Navigation</h3>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: numberOfQuestions }, (_, index) => {
                const status = getQuestionStatus(index);
                const isFlagged = flaggedQuestions.includes(index);
                const isCurrent = currentQuestionIndex === index;

                return (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`
                      relative w-10 h-10 rounded-lg text-xs font-medium transition-all
                      ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                      ${status === 'answered'
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }
                    `}
                  >
                    {index + 1}
                    {isFlagged && (
                      <svg className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-600">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span className="text-gray-600">Not answered</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" />
                </svg>
                <span className="text-gray-600">Flagged</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Submit Confirmation Modal */}
      <Transition appear show={isSubmitConfirmOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={handleCancelSubmit}
        >
          <div className="min-h-screen px-4 text-center flex items-center justify-center">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />

            <div className="inline-block w-full max-w-md p-8 my-8 overflow-hidden text-center align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-10">
              {/* Question Mark Icon */}
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mb-5 shadow-lg">
                <span className="text-white text-4xl font-bold">?</span>
              </div>

              <Dialog.Title
                as="h3"
                className="text-xl font-bold text-gray-900 mb-3"
              >
                Submit Quiz?
              </Dialog.Title>

              <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                Are you ready to submit your quiz?<br/>
                <span className="font-semibold text-gray-800">You won't be able to change your answers after submitting.</span>
              </p>

              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  className="flex-1 max-w-[140px] px-8 py-3 text-base font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                  onClick={handleCancelSubmit}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="flex-1 max-w-[140px] px-8 py-3 text-base font-semibold text-white bg-[#6B7A8F] rounded-lg hover:bg-[#5a6675] hover:shadow-md transition-all duration-200 transform hover:scale-105"
                  onClick={handleConfirmSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Abandon Quiz Modal */}
      <Transition appear show={isAbandonModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={handleContinueQuiz}
        >
          <div className="min-h-screen px-4 text-center flex items-center justify-center">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />

            <div className="inline-block w-full max-w-md p-8 my-8 overflow-hidden text-center align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-10">
              {/* Question Mark Icon */}
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mb-5 shadow-lg">
                <span className="text-white text-4xl font-bold">?</span>
              </div>

              <Dialog.Title
                as="h3"
                className="text-xl font-bold text-gray-900 mb-3"
              >
                Leave Quiz?
              </Dialog.Title>

              <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                Are you sure you want to abandon this quiz?<br/>
                <span className="font-semibold text-red-600">All your progress will be lost and you'll receive 0 points.</span>
              </p>

              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  className="flex-1 max-w-[140px] px-8 py-3 text-base font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                  onClick={handleContinueQuiz}
                >
                  No
                </button>

                <button
                  type="button"
                  className="flex-1 max-w-[140px] px-8 py-3 text-base font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-red-500 hover:text-white hover:shadow-md transition-all duration-200 transform hover:scale-105"
                  onClick={handleAbandonQuiz}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Submit Quiz Modal - Results */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => {}}
        >
          <div className="min-h-screen px-4 text-center flex items-center justify-center">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-60" />

            <div className="inline-block w-full max-w-md p-8 my-8 overflow-hidden text-center align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-10">
              {/* Trophy/Medal Icon */}
              <div className="mx-auto w-24 h-24 mb-4 flex items-center justify-center">
                {quizScore >= 70 ? (
                  // Success - Trophy
                  <div className="relative">
                    <svg className="w-24 h-24 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-16 h-16 text-yellow-400" viewBox="0 0 100 100" fill="currentColor">
                        <circle cx="50" cy="45" r="20" fill="#FCD34D" />
                        <rect x="45" y="60" width="10" height="15" fill="#FCD34D" />
                        <rect x="35" y="72" width="30" height="8" rx="2" fill="#FCD34D" />
                      </svg>
                    </div>
                  </div>
                ) : quizScore >= 50 ? (
                  // Pass - Medal
                  <svg className="w-24 h-24" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="28" r="16" fill="#10B981" stroke="#059669" strokeWidth="2" />
                    <path d="M24 36L20 52L32 44L44 52L40 36" fill="#10B981" stroke="#059669" strokeWidth="2" />
                    <text x="32" y="34" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">✓</text>
                  </svg>
                ) : (
                  // Fail - Try Again
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>

              <Dialog.Title
                as="h2"
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                {quizScore >= 70 ? 'Congratulations! 🎉' : quizScore >= 50 ? 'You Passed!' : 'Keep Trying!'}
              </Dialog.Title>

              <p className="text-gray-600 text-sm mb-6">
                {quizScore >= 70
                  ? 'Excellent work! You did great!'
                  : quizScore >= 50
                  ? 'Good job! You passed the quiz.'
                  : 'Don\'t give up! Try again to improve your score.'}
              </p>

              {/* Score Display */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                <p className="text-gray-600 text-sm mb-2">Your Score</p>
                <p className="text-5xl font-bold text-gray-900">{quizScore}%</p>
                <p className="text-gray-500 text-xs mt-2">
                  {Math.round((quizScore / 100) * numberOfQuestions)} out of {numberOfQuestions} correct
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  className="w-full px-6 py-3 text-base font-semibold text-white bg-[#6B7A8F] rounded-lg hover:bg-[#5a6675] transition-all duration-200 shadow-md"
                  onClick={handleReview}
                >
                  Review Answers
                </button>

                <button
                  type="button"
                  className="w-full px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                  onClick={handleRetry}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default MedicineQuestions;
