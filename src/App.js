import React from "react";
import "./styles/tailwind.css";
import Dashboard from "./Components/Dashboard/Dashboard";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignIn from "./Components/Auth/SignIn";
import SignUp from "./Components/Auth/SignUp";
import AuthDetails from "./Components/Auth/AuthDetails";
import ForgotPasswd from "./Components/Auth/ForgotPasswd";
import Main from "./Components/Dashboard/Main";
import Main2 from "./Components/Account/Main2";
import "./styles/tailwind.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        {/* <Login /> */}
        {/* <SignIn />
        <SignUp /> */}
        <AuthDetails />
        <Routes>
          <Route path="/" element={<SignUp />}/>
          <Route path="/signup" element={<SignUp />}/>
          <Route path="/login" element={<SignIn />} />
          <Route path="/main" element={<Main />} />
          <Route path="/forgot-password" element={<ForgotPasswd />} />
          <Route path="/account" element={<Main2 />}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
