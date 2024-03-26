import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";

const Timer = ({ duration }) => {
  const [secondsLeft, setSecondsLeft] = useState(parseDuration(duration));
  const [isModalOpen, setIsModalOpen] = useState(false);
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
          setIsModalOpen(true);
          setTimeout(() => {
            navigate("/main");
          }, 2000);
        }
        return secondsLeft - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const displayTime = secondsLeft < 60 ? `${secondsLeft} seconds left` : `${Math.floor(secondsLeft / 60)} minutes left`;

  return (
    <div>
      <p>{displayTime}</p>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Time is up"
      >
        <h2>Time is up</h2>
        <button onClick={() => setIsModalOpen(false)}>Close</button>
      </Modal>
    </div>
  );
};

export default Timer;