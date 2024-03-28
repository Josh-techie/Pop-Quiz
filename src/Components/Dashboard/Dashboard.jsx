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
          <Card
            title="Agriculture"
            image={Agriculture}
            cardLink="/agriculture"
          />
          <Card title="History" image={History} cardLink="/history" />
          <Card title="Art" image={Art} cardLink="/Art" />
          <Card
            title="Mythology"
            image={Mythology}
            cardLink="/Mythology"
          />{" "}

          <Card title="Sports" image={Sports} cardLink="/Sports" />{" "}
          {/*Mythology  */}
          <Card
            title="Linguistics"
            image={Linguistics}
            cardLink="/Linguistics"
          />{" "}
          {/*Linguistics */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
