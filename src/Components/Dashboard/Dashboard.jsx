import React, { useState } from "react";
import Card1 from "../../assets/card1.png";
import Card2 from "../../assets/card2.png";
import Card3 from "../../assets/card3.png";
import Card4 from "../../assets/card4.png";
import Avatar from "../../assets/avatar.jpeg"; // Example avatar image
import DashboardHeader from "./Header";

// Card component
const Card = ({ title, image, onClick }) => {
  return (
    <div
      className="relative rounded-md p-4 overflow-hidden cursor-pointer select-none"
      onClick={onClick}
    >
      <img src={image} alt={title} className="w-full h-auto" />
      <h2 className="absolute bottom-4 left-0 right-0 text-gray text-lg font-semibold text-center">
        {title}
      </h2>
    </div>
  );
};

function Dashboard() {
  const [showDropdown, setShowDropdown] = useState(false);

  // Toggle dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="flex flex-col py-10 px-16 h-screen overflow-y-auto w-full bg-gray-100">
      {/* Header */}
      <DashboardHeader
        toggleDropdown={toggleDropdown}
        showDropdown={showDropdown}
        Avatar={Avatar}
      />

      {/* Cards and Headings */}
      <div className="bg-white rounded-lg p-6">
        {/* Dashboard Title */}
        <div className="flex flex-col space-y-2 mb-6">
          <h2 className="text-gray-800 text-4xl font-bold">Select a topic</h2>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <Card
            title="Technology"
            image={Card1}
            onClick={() => console.log("Technology clicked")}
          />
          <Card
            title="Medicine"
            image={Card2}
            onClick={() => console.log("Yatharth Verma clicked")}
          />
          <Card
            title="Agriculture"
            image={Card3}
            onClick={() => console.log("Yatharth Verma clicked")}
          />
          <Card
            title="History"
            image={Card4}
            onClick={() => console.log("Your Activity clicked")}
          />
          <Card
            title="Mathematics"
            image={Card3}
            onClick={() => console.log("Pending Bills clicked")}
          />
          <Card
            title="Mathematics"
            image={Card3}
            onClick={() => console.log("Pending Bills clicked")}
          />
          <Card
            title="Mathematics"
            image={Card3}
            onClick={() => console.log("Pending Bills clicked")}
          />
          <Card
            title="Mathematics"
            image={Card3}
            onClick={() => console.log("Pending Bills clicked")}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
