import React, { useState } from "react";
import Technology from "../../Assets/technology_card.jpg";
import Medicine from "../../Assets/medicine_card.jpg";
import History from "../../Assets/history_card.jpg";
import Agriculture from "../../Assets/agriculture_card.jpg";
import Avatar from "../../Assets/avatar.png";
import Linguistics from "../../Assets/linguistics_card.jpg";
import Mythology from "../../Assets/mythology_card.jpeg";
import Art from "../../Assets/art_card.jpg";
import Sports from "../../Assets/sports_card.jpg";
import DashboardHeader from "./Header";
import { Link } from "react-router-dom";

// Card component
const Card = ({ title, image, cardLink }) => {
  return (
    <Link
      to={cardLink}
      className="relative rounded-2xl overflow-hidden cursor-pointer select-none block group shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-white text-xl font-bold drop-shadow-lg">{title}</h2>
        </div>
      </div>
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

      {/* Main Content */}
      <div className="bg-white rounded-lg p-8">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Select Topic
          </h1>
          <p className="text-gray-500 text-sm">Featured Category</p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <Card title="History" image={History} cardLink="/history" />
          <Card title="Medicine" image={Medicine} cardLink="/medicine" />
          <Card title="Technology" image={Technology} cardLink="/technology" />
          <Card title="Agriculture" image={Agriculture} cardLink="/agriculture" />
          <Card title="Art" image={Art} cardLink="/Art" />
          <Card title="Mythology" image={Mythology} cardLink="/Mythology" />
          <Card title="Sports" image={Sports} cardLink="/Sports" />
          <Card title="Linguistics" image={Linguistics} cardLink="/Linguistics" />
        </div>

        {/* More button */}
        <div className="flex justify-end mt-8">
          <button className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors duration-200">
            More
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
