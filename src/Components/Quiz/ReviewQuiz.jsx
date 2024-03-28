import React, { useState } from "react";
import Navbar from "../Dashboard/NavBar";
import DashboardHeader from "../Dashboard/Header";
import Avatar from "../../Assets/avatar.png";
import { useNavigate } from "react-router-dom";
import quizData from "../Data/Quiz.json";

function ReviewQuiz() {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Fetch quiz questions and user answers from localStorage or any other storage mechanism
  const quizQuestions = quizData[0].quiz_questions;
  const userAnswers = []; // Assuming you have stored user's answers

  // Function to compare user's answers with correct answers
  const compareAnswers = (userAnswer, correctAnswer) => {
    return userAnswer === correctAnswer;
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
            {quizQuestions.map((question, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-xl font-bold mb-4">
                  {question.question_text}
                </h2>
                <div className="grid gap-2">
                  {question.options.map((option, optionIndex) => {
                    const isCorrect = compareAnswers(
                      userAnswers[index],
                      optionIndex
                    );
                    return (
                      <div
                        key={optionIndex}
                        className={`py-2 px-4 rounded ${
                          isCorrect ? "bg-green-200" : "bg-red-200"
                        }`}
                      >
                        <p>{option}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ReviewQuiz;
