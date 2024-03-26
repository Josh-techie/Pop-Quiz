import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";

const Timer = ({ duration }) => {
  const [secondsLeft, setSecondsLeft] = useState(parseDuration(duration));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const navigate = useNavigate();

  function parseDuration(duration) {
    const match = duration.match(/(\d+)(s|m|h)/);
    if (!match) throw new Error("Invalid duration");
    const value = parseInt(match[1]);
    switch (match[2]) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 60 * 60;
      default:
        throw new Error("Invalid duration");
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((secondsLeft) => {
        if (secondsLeft === 1) {
          clearInterval(timer); // Clear the interval
          setIsLoading(true); // Set loading to true
          setTimeout(() => {
            setIsModalOpen(true); // Open the modal
            setIsLoading(false); // Set loading to false
          }, 1000);
          setTimeout(() => {
            navigate("/main"); // Redirect to the main page after 2 seconds
          }, 2000);
        }
        return secondsLeft - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup the interval
  }, [navigate]);

  const displayTime =
    secondsLeft < 60
      ? `${secondsLeft} seconds left`
      : `${Math.floor(secondsLeft / 60)} minutes left`;

  return (
    <div>
      <p>{displayTime}</p>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Time is up"
        className="modal"
        overlayClassName="overlay"
      >
        <div className="bg-red-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800">Time is up!</h2>
          <p className="text-red-700 mt-2">Please submit your answers.</p>
          <button
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none"
            onClick={() => setIsModalOpen(false)}
          >
            Close
          </button>
        </div>
      </Modal>
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-300 bg-opacity-50 z-50">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-white-200 h-24 w-24"></div>
        </div>
      )}
    </div>
  );
};

export default Timer;
