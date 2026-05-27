import React from "react";
import "./styles/tailwind.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignIn from "./Components/Auth/SignIn";
import SignUp from "./Components/Auth/SignUp";
import ForgotPasswd from "./Components/Auth/ForgotPasswd";
import UsernameSetup from "./Components/Auth/UsernameSetup";
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
import CategoryDetail from "./Components/Quiz/CategoryDetail";
import AllCategories from "./Components/Dashboard/AllCategories";
import AllQuizzesInCategory from "./Components/Quiz/AllQuizzesInCategory";
import { NotificationProvider } from "./contexts/NotificationContext";
import { NavigationProvider } from "./contexts/NavigationContext";
import ToastNotification from "./Components/Common/ToastNotification";

function App() {
  return (
    <NotificationProvider>
      <NavigationProvider>
        <div className="App">
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ToastNotification />
          <Routes>
          {/* Public Routes - No Authentication Required */}
          <Route path="/" element={<SignIn />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPasswd />} />

          {/* Semi-Protected Route - Requires OAuth but no username yet */}
          <Route path="/username-setup" element={<UsernameSetup />} />

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
            path="/categories"
            element={
              <ProtectedRoute>
                <AllCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/category/:categorySlug"
            element={
              <ProtectedRoute>
                <CategoryDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/category/:categorySlug/all-quizzes"
            element={
              <ProtectedRoute>
                <AllQuizzesInCategory />
              </ProtectedRoute>
            }
          />
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
      </NavigationProvider>
    </NotificationProvider>
  );
}

export default App;
