// Technology.jsx
import React from "react";
import Navbar from "../Dashboard/NavBar";
import "../../styles/index.css";
import DashboardHeader from "../Dashboard/Header";

import Avatar from "../../Assets/avatar.png";

function MakeQuiz() {
  // Toggle dropdown
  const [showDropdown, setShowDropdown] = React.useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="flex">
      {/* Side Navigation Bar */}
      <Navbar />
      <main className="grow main-content">
        {/* <Header /> */}
        <DashboardHeader
          toggleDropdown={toggleDropdown}
          showDropdown={showDropdown}
          Avatar={Avatar}
        />
        <div className="flex items-center justify-center h-screen">
          <div class="loader"></div>
          <br></br>
          <h2 className="text-4xl">Coming Soon</h2>
        </div>
      </main>
    </div>
  );
}

export default MakeQuiz;
