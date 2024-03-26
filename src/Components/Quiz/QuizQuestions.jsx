import React from "react";
import Navbar from "../Dashboard/NavBar";
import DashboardHeader from "../Dashboard/Header";
import Avatar from "../../Assets/avatar.png";
import CybersecQuestions from "../../Assets/Cyber-Security.jpg";
import Timer from "./Timer";
import quizData from "../Data/Quiz.json";

function QuizQuestions() {
  const [showDropdown, setShowDropdown] = React.useState(false);


  // fetch quiz title
  const quizTitle = quizData[0].quiz_title;

  // fetch the quiz data number of questions
  const numberOfQuestions = quizData[0].quiz_nb_of_questions;
 
 // fetch the id of the question from the quiz data in an array format
  const ids = quizData[0].quiz_questions.map((question) => question.id);

 // fetch quiz description
 const quizDescription = quizData[0].quiz_description;

 // fetch quiz questions
const quizQuestions = quizData[0].quiz_questions.map(
  (question) => question.question_text
);

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

          <div className="flex flex-col py-10 px-4 sm:px-8 md:px-16 h-auto sm:h-screen overflow-y-auto w-full bg-white rounded">
            <div className="flex justify-between items-center">
              <h2 className="text-4xl font-bold text-gray-700 mb-2">
                {quizTitle}
              </h2>
              <p className="text-2xl font-bold text-gray-700 mb-2">
                Timer: <Timer duration="1h" />
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
                        Question {ids[0]}/ {numberOfQuestions}
                      </h1>
                      <p className="mb-8 max-w-[480px] text-base text-body-color dark:text-dark-6 text-justify">
                        {quizQuestions[0]}
                      </p>
                      {/* Add your questions and checkboxes here */}
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
                    <label className="flex items-center mb-4">
                      <input
                        type="radio"
                        name="answer"
                        className="rounded text-gray-500 mr-4"
                      />
                      London
                    </label>
                    <label className="flex items-center mb-4">
                      <input
                        type="radio"
                        name="answer"
                        className="rounded text-gray-500 mr-4"
                      />
                      Liverpool
                    </label>
                    <label className="flex items-center mb-4">
                      <input
                        type="radio"
                        name="answer"
                        className="rounded text-gray-500 mr-4"
                      />
                      Canary
                    </label>
                    <label className="flex items-center mb-4">
                      <input
                        type="radio"
                        name="answer"
                        className="rounded text-gray-500 mr-4"
                      />
                      Agadir
                    </label>
                  </div>
                  <button className="bg-gray-700 hover:bg-gray-900 text-white font-semibold py-3 px-10 rounded-full mt-4 ml-auto">
                    Next
                  </button>
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
