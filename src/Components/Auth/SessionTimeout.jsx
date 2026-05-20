import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";

const SessionTimeout = ({ children }) => {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60); // 60 seconds warning
  const navigate = useNavigate();

  const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
  const WARNING_DURATION = 60 * 1000; // 1 minute warning before logout

  // Use useRef to persist timer IDs across renders
  const timeoutId = useRef(null);
  const warningTimeoutId = useRef(null);
  const countdownInterval = useRef(null);

  const clearAllTimers = useCallback(() => {
    if (timeoutId.current) clearTimeout(timeoutId.current);
    if (warningTimeoutId.current) clearTimeout(warningTimeoutId.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  }, []);

  const handleLogout = useCallback(async () => {
    clearAllTimers();
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      navigate("/login");
    }
  }, [navigate, clearAllTimers]);

  const startCountdown = useCallback(() => {
    setCountdown(60);
    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval.current);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [handleLogout]);

  const showWarningModal = useCallback(() => {
    setShowWarning(true);
    startCountdown();
  }, [startCountdown]);

  const resetTimer = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    setCountdown(60);

    // Set warning timer (show modal 1 minute before logout)
    warningTimeoutId.current = setTimeout(() => {
      showWarningModal();
    }, TIMEOUT_DURATION - WARNING_DURATION);

    // Set logout timer (auto logout after 15 minutes)
    timeoutId.current = setTimeout(() => {
      handleLogout();
    }, TIMEOUT_DURATION);
  }, [clearAllTimers, showWarningModal, handleLogout, TIMEOUT_DURATION, WARNING_DURATION]);

  const continueSession = () => {
    setShowWarning(false);
    resetTimer();
  };

  useEffect(() => {
    // Only start timer if user is authenticated
    if (auth.currentUser) {
      const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];

      // Reset timer on user activity
      const handleActivity = () => {
        if (!showWarning) {
          resetTimer();
        }
      };

      // Attach event listeners
      events.forEach((event) => {
        window.addEventListener(event, handleActivity);
      });

      // Start initial timer
      resetTimer();

      // Cleanup
      return () => {
        events.forEach((event) => {
          window.removeEventListener(event, handleActivity);
        });
        clearAllTimers();
      };
    }
  }, [resetTimer, showWarning, clearAllTimers]);

  return (
    <>
      {children}

      {/* Session Timeout Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md mx-4 animate-fade-in">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-100 rounded-full p-3">
                <svg
                  className="w-12 h-12 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-2">
              Session About to Expire
            </h2>

            {/* Message */}
            <p className="text-gray-600 text-center mb-6 text-sm md:text-base">
              You've been inactive for a while. Your session will expire in{" "}
              <span className="font-bold text-red-600">{countdown}</span> seconds.
            </p>

            {/* Countdown Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden">
              <div
                className="bg-gradient-to-r from-yellow-400 to-red-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 60) * 100}%` }}
              ></div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={continueSession}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                Continue Session
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                Logout
              </button>
            </div>

            {/* Footer Note */}
            <p className="text-xs text-gray-500 text-center mt-4">
              Click anywhere or press any key to stay logged in
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionTimeout;
