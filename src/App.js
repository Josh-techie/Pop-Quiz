import React from "react";
import "./styles/tailwind.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignIn from "./Components/Auth/SignIn";
import SignUp from "./Components/Auth/SignUp";
import AuthDetails from "./Components/Auth/AuthDetails";
import ForgotPasswd from "./Components/Auth/ForgotPasswd";
import Main from "./Components/Dashboard/Main";
import Main2 from "./Components/Account/Main2";
import "./styles/tailwind.css";
import Technology from "./Components/Quiz/Technology";
import MakeQuiz from "./Components/MakeQuiz/MakeQuiz";
import Leaderboard from "./Components/Leaderboard/Leaderborad";
import Notifications from "./Components/Notifications/Notifications";
import QuizQuestions from "./Components/Quiz/QuizQuestions";
import ReviewQuiz from "./Components/Quiz/ReviewQuiz";

function App() {
  
  return (
    <div className="App">
      <BrowserRouter>
        {/* <Login /> */}
        {/* <SignIn />
        <SignUp /> */}

        <AuthDetails />
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/main" element={<Main />} />
          <Route path="/forgot-password" element={<ForgotPasswd />} />
          {/*Navbar pages  */}
          <Route path="/account" element={<Main2 />} />
          <Route path="/makequiz" element={<MakeQuiz />} />
          <Route path="/notification" element={<Notifications />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* categories of the quiz routes */}
          <Route path="/technology" element={<Technology />} />
          {/* quiz questions */}
          <Route path="/quiz-questions" element={<QuizQuestions />} />

          {/* review questions */}
          <Route path="/quiz-review" element={<ReviewQuiz />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
