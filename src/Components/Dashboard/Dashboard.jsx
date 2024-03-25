import React, { useState } from "react";
import Technology from "../../Assets/technology_card.png";
import Medicine from "../../Assets/medicine_card.png";
import History from "../../Assets/history_card.png";
import Agriculture from "../../Assets/agriculture_card.png";
import Avatar from "../../Assets/avatar.png";
import DashboardHeader from "./Header";
import { Link } from "react-router-dom";

// Card component
const Card = ({ title, image, cardLink }) => {
  return (
    <Link to={cardLink} className="relative rounded-md overflow-hidden cursor-pointer select-none block">
      <img src={image} alt={title} className="w-full h-auto" />
      <h2 className="text-gray text-lg font-semibold text-center mt-2">{title}</h2>
    </Link>
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
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <h1 className="text-gray-800 text-4xl font-bold">Select a topic</h1>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <Card title="Technology" image={Technology} cardLink="/technology" />
          <Card title="Medicine" image={Medicine} cardLink="/medicine" />
          <Card title="Agriculture" image={History} cardLink="/agriculture" />
          <Card title="History" image={Agriculture} cardLink="/history" />
          <Card title="Technology" image={Technology} cardLink="/technology" />
          <Card title="Medicine" image={Medicine} cardLink="/medicine" />
          <Card title="Agriculture" image={History} cardLink="/agriculture" />
          <Card title="History" image={Agriculture} cardLink="/history" />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
