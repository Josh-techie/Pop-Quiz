import React, { useState, useEffect } from "react";
import Navbar from "../Dashboard/NavBar";
import DashboardHeader from "../Dashboard/Header";
import Avatar from "../../Assets/avatar.png";
import quizData from "../Data/Quiz.json";
import { Link } from "react-router-dom";

function ReviewQuiz() {
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
    return quizData[0].quiz_questions[questionIndex].options[
      quizData[0].quiz_questions[questionIndex].correct_option
    ];
  };

  return (
    <div className="flex flex-col py-10 px-4 sm:px-8 md:px-16 h-auto sm:h-screen overflow-y-auto w-full bg-gray-100">
      <div className="flex">
        <Navbar />
        <main className="grow main-content">
          <DashboardHeader
            toggleDropdown={toggleDropdown}
            showDropdown={showDropdown}
            Avatar={Avatar}
          />

          <div className="flex flex-col py-10 px-4 sm:px-8 md:px-16 h-auto sm:h-screen overflow-y-auto w-full bg-white rounded">
            {quizData[0].quiz_questions.map((question, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-xl font-bold mb-4">
                  {question.question_text}
                </h2>
                <div className="grid gap-2">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = userAnswers[index] === optionIndex;
                    const isCorrect = option === getCorrectOption(index);

                    let colorClass = "";

                    if (isSelected && isCorrect) {
                      colorClass = "bg-green-200"; // Selected and correct
                    } else if (!isSelected && isCorrect) {
                      colorClass = "bg-green-200"; // Correct but not selected
                    } else if (isSelected && !isCorrect) {
                      colorClass = "bg-red-200"; // Selected but incorrect
                    }

                    return (
                      <div
                        key={optionIndex}
                        className={`py-2 px-4 rounded ${colorClass}`}
                      >
                        <p>{option}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          <Link to="/Main">
        <button className="bg-gray-700 hover:bg-gray-900 text-white font-semibold py-2 px-8 rounded-full ">
          Finish Reviewing
        </button>
      </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ReviewQuiz;
