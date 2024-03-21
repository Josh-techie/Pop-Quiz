import React from "react";
import "./styles/tailwind.css";
import Dashboard from "./Components/Dashboard/Dashboard";
import Login from "./Components/Login/Login";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import SignUp from "./Components/SignUp/SignUp";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        {/* <Login /> */}
        <Routes>
          <Route path="/Login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
