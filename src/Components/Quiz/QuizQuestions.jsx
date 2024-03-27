import React, { useState, Fragment } from "react";
import Navbar from "../Dashboard/NavBar";
import DashboardHeader from "../Dashboard/Header";
import Avatar from "../../Assets/avatar.png";
import CybersecQuestions from "../../Assets/Cyber-Security.jpg";
import { useNavigate } from "react-router-dom";
import Timer from "./Timer";
import quizData from "../Data/Quiz.json";
import { Dialog, Transition } from "@headlessui/react";
import "../../styles/index.css";

function QuizQuestions() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // State to keep track of selected option
  const [userAnswers, setUserAnswers] = useState([]); // State to store user answers
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

  //to use redirections
  const navigate = useNavigate();

  // Fetch quiz title
  const quizTitle = quizData[0].quiz_title;

  // Fetch the quiz data number of questions
  const numberOfQuestions = quizData[0].quiz_questions.length;

  // Fetch quiz description
  const quizDescription = quizData[0].quiz_description;

  // Fetch quiz questions
  const quizQuestions = quizData[0].quiz_questions.map(
    (question) => question.question_text
  );

  // fetch the time quiz
  const timeLimit = quizData[0].quiz_time_limit;

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

  const handleSubmit = () => {
    setIsModalOpen(true); // Show the modal on submit
  };

  const handleRetry = () => {
    // Add your retry logic here
    setIsModalOpen(false); // Close the modal after handling the retry action
    navigate("/technology");
  };

  const handleReview = () => {
    // Save user answers to local storage
    localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
    setIsModalOpen(false); // Close the modal after handling the review action
    navigate("/quiz-review");
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

          <div className="flex flex-col py-10 px-4 sm:px-8 md:px-16 h-auto sm:h-screen overflow-y-auto w-full bg-white rounded">
            <div className="flex justify-between items-center">
              <h2 className="text-4xl font-bold text-gray-700 mb-2">
                {quizTitle}
              </h2>
              <p className="text-xl font-bold text-gray-700 mb-2">
                <span className="flex items-center">
                  <div class="timer"></div>
                  <Timer duration={timeLimit} />
                </span>
              </p>
            </div>
            {/* Description */}
            <p className="text-gray-800 mb-4">Answer the questions below</p>

            <div className="relative bg-white pb-[110px] pt-[120px] dark:bg-dark lg:pt-[150px]">
              <div className="container">
                <div className="-mx-4 flex flex-wrap">
                  <div className="w-full px-4 lg:w-5/12">
                    <div className="hero-content">
                      <h1 className="mb-10 text-xl font-bold leading-[1.208] text-dark dark:text-gray sm:text-2xl lg:text-3xl xl:text-5xl">
                        {" "}
                        Question {currentQuestionIndex + 1}/{numberOfQuestions}
                      </h1>
                      <p className="mb-8 max-w-[480px] text-base text-body-color dark:text-dark-6 text-justify">
                        {quizQuestions[currentQuestionIndex]}
                      </p>
                    </div>
                  </div>
                  <div className="hidden px-4 lg:block lg:w-1/12"></div>
                  <div className="w-full px-4 lg:w-6/12">
                    <div className="lg:mr-auto lg:text-left">
                      <div className="relative z-10 inline-block pt-11 lg:pt-0">
                        <img
                          src={CybersecQuestions}
                          alt="hero"
                          className="max-w-full lg:ml-auto rounded-md"
                        />
                        <span className="absolute -bottom-8 -left-8 z-[-1]">
                          <svg
                            width="93"
                            height="93"
                            viewBox="0 0 93 93"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          ></svg>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col w-full pl-4 pt-8">
                    <h2 className="text-gray-500 text-2xl mb-4 pb-4">
                      Choose an answer
                    </h2>
                    {quizData[0].quiz_questions[
                      currentQuestionIndex
                    ].options.map((option, index) => (
                      <label key={index} className="flex items-center mb-4">
                        <input
                          type="radio"
                          name="answer"
                          className="rounded text-gray-500 mr-4"
                          checked={selectedOption === index}
                          onChange={() => handleOptionChange(index)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                  <button
                    className={`${
                      currentQuestionIndex === 0
                        ? "bg-gray-700 opacity-50 cursor-not-allowed"
                        : "bg-gray-700 hover:bg-gray-900"
                    } text-white font-semibold py-3 px-10 rounded-full mt-4 ml-auto`}
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Back
                  </button>

                  <button
                    className={`${
                      currentQuestionIndex === numberOfQuestions - 1
                        ? "bg-green-500 hover:bg-green-700"
                        : "bg-gray-700 hover:bg-gray-900"
                    }  text-white font-semibold py-3 px-10 rounded-full mt-4 ${
                      currentQuestionIndex === numberOfQuestions - 1
                        ? "cursor-pointer"
                        : ""
                    }`}
                    onClick={
                      currentQuestionIndex === numberOfQuestions - 1
                        ? handleSubmit
                        : handleNextQuestion
                    }
                  >
                    {currentQuestionIndex === numberOfQuestions - 1
                      ? "Submit"
                      : "Next"}
                  </button>
                  <Transition appear show={isModalOpen} as={Fragment}>
                    <Dialog
                      as="div"
                      className="fixed inset-0 z-10 overflow-y-auto"
                      onClose={() => setIsModalOpen(false)}
                    >
                      <div className="min-h-screen px-4 text-center">
                        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
                        <span
                          className="inline-block h-screen align-middle"
                          aria-hidden="true"
                        >
                          &#8203;
                        </span>
                        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                          <div className="flex justify-between items-center mb-4">
                            <Dialog.Title
                              as="h3"
                              className="text-lg font-medium leading-6 text-gray-900"
                            >
                              Quiz Submitted
                            </Dialog.Title>
                            {/* Close button */}
                            <button
                              type="button"
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => setIsModalOpen(false)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Your answers have been submitted. What would you
                              like to do next?
                            </p>
                          </div>
                          <div className="mt-4 flex justify-center space-x-4">
                            {/* Review button */}
                            <button
                              type="button"
                              className="flex-grow-0 flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-green-500 border border-transparent rounded-md hover:bg-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500"
                              onClick={handleReview}
                            >
                              Review
                            </button>
                            {/* Retry button */}
                            <button
                              type="button"
                              className="flex-grow-0 flex-shrink-0 px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                              onClick={handleRetry}
                            >
                              Retry
                            </button>
                          </div>
                        </div>
                      </div>
                    </Dialog>
                  </Transition>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default QuizQuestions;
