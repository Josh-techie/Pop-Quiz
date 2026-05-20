import React from "react";
import "./styles/tailwind.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignIn from "./Components/Auth/SignIn";
import SignUp from "./Components/Auth/SignUp";
import ForgotPasswd from "./Components/Auth/ForgotPasswd";
import ProtectedRoute from "./Components/Auth/ProtectedRoute";
import Main from "./Components/Dashboard/Main";
import Main2 from "./Components/Account/Main2";
import "./styles/tailwind.css";
import Technology from "./Components/Quiz/Technology";
import MakeQuiz from "./Components/MakeQuiz/MakeQuiz";
import Leaderboard from "./Components/Leaderboard/Leaderborad";
import Notifications from "./Components/Notifications/Notifications";
import QuizQuestions from "./Components/Quiz/QuizQuestions";
import ReviewQuiz from "./Components/Quiz/ReviewQuiz";
import Medicine from "./Components/Quiz/Medicine";
import Agriculture from "./Components/Quiz/Agriculture";
import MedicineQuestions from "./Components/Quiz/MedicineQuestions";
import ReviewQuizMedicine from "./Components/Quiz/ReviewQuizMedicine";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public Routes - No Authentication Required */}
          <Route path="/" element={<SignIn />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPasswd />} />

          {/* Protected Routes - Authentication Required */}
          <Route
            path="/main"
            element={
              <ProtectedRoute>
                <Main />
              </ProtectedRoute>
            }
          />

          {/* Navbar Pages */}
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Main2 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/makequiz"
            element={
              <ProtectedRoute>
                <MakeQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notification"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />

          {/* Quiz Category Routes */}
          <Route
            path="/technology"
            element={
              <ProtectedRoute>
                <Technology />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medicine"
            element={
              <ProtectedRoute>
                <Medicine />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agriculture"
            element={
              <ProtectedRoute>
                <Agriculture />
              </ProtectedRoute>
            }
          />

          {/* Quiz Questions Routes */}
          <Route
            path="/quiz-questions"
            element={
              <ProtectedRoute>
                <QuizQuestions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medicinequestions"
            element={
              <ProtectedRoute>
                <MedicineQuestions />
              </ProtectedRoute>
            }
          />

          {/* Review Routes */}
          <Route
            path="/quiz-review"
            element={
              <ProtectedRoute>
                <ReviewQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz-review-medicine"
            element={
              <ProtectedRoute>
                <ReviewQuizMedicine />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
