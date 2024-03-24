// Technology.jsx
import React from "react";
import Navbar from "../Dashboard/NavBar";
import "./Technology.css";
import DashboardHeader from "../Dashboard/Header";

import Avatar from "../../Assets/avatar.png";

function Technology() {
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
      </main>
    </div>
  );
}

export default Technology;
