import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../../firebase";
import { createUserProfile, checkUsernameAvailability } from "../../services/firestoreService";
import Logo from "../../Assets/Logo.png";

const UsernameSetup = () => {
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.currentUser;

  useEffect(() => {
    // Redirect if no user or if they came here without going through OAuth
    if (!user || !location.state?.fromOAuth) {
      navigate("/login");
    }
  }, [user, location, navigate]);

  const validateUsername = (value) => {
    if (!value) {
      return "Username is required";
    }

    // Length validation
    if (value.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (value.length > 20) {
      return "Username must be less than 20 characters";
    }

    // Character validation - only lowercase letters, numbers, and underscores
    if (!/^[a-z0-9_]+$/.test(value)) {
      return "Only lowercase letters, numbers, and underscores allowed";
    }

    // Must start with a letter
    if (!/^[a-z]/.test(value)) {
      return "Username must start with a letter";
    }

    // Cannot end with underscore
    if (value.endsWith('_')) {
      return "Username cannot end with an underscore";
    }

    // Cannot have consecutive underscores
    if (value.includes('__')) {
      return "Cannot have consecutive underscores";
    }

    // Cannot be only numbers (must have at least one letter)
    if (/^\d+$/.test(value)) {
      return "Username must contain at least one letter";
    }

    // Reserved words check
    const reservedWords = [
      'admin', 'root', 'system', 'moderator', 'mod', 'support',
      'popquiz', 'pop_quiz', 'quiz', 'user', 'guest', 'anonymous',
      'null', 'undefined', 'test', 'demo', 'official'
    ];
    if (reservedWords.includes(value.toLowerCase())) {
      return "This username is reserved";
    }

    return null;
  };

  const handleUsernameChange = async (value) => {
    setUsername(value);
    setUsernameError("");

    const error = validateUsername(value);
    if (error) {
      setUsernameError(error);
      return;
    }

    // Check availability with debouncing
    setCheckingUsername(true);
    setTimeout(async () => {
      const result = await checkUsernameAvailability(value);
      setCheckingUsername(false);
      if (result.success && !result.available) {
        setUsernameError("Username already taken");
      }
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateUsername(username);
    if (error) {
      setUsernameError(error);
      return;
    }

    setLoading(true);

    try {
      const result = await createUserProfile(user.uid, {
        username,
        email: user.email,
        displayName: user.displayName || username,
      });

      if (!result.success) {
        setLoading(false);
        setUsernameError(result.error || "Failed to create profile");
        return;
      }

      // Success - redirect to main app
      navigate("/main");
    } catch (error) {
      console.error("Error creating profile:", error);
      setLoading(false);
      setUsernameError("An error occurred. Please try again.");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fullscreen">
      <section className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl p-8">
          <img
            src={Logo}
            alt="Pop Quiz Logo"
            width={100}
            height={125}
            className="mx-auto"
          />

          <h1 className="text-xl font-bold text-center mt-6">
            Choose Your Username
          </h1>
          <p className="text-gray-600 text-sm text-center mt-2">
            Pick a unique username to complete your profile
          </p>

          {user.photoURL && (
            <div className="flex justify-center mt-4">
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-16 h-16 rounded-full border-2 border-blue-500"
              />
            </div>
          )}

          <p className="text-center text-sm text-gray-700 mt-2">
            {user.displayName || user.email}
          </p>

          <form className="mt-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 text-sm font-medium">
                Username
              </label>
              <input
                type="text"
                onChange={(e) => handleUsernameChange(e.target.value)}
                value={username}
                placeholder="your_username"
                className={`w-full px-4 py-3 rounded-lg bg-gray-50 mt-2 border focus:bg-white focus:outline-none transition text-sm ${
                  usernameError
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                autoFocus
                autoComplete="off"
                disabled={loading}
              />
              {checkingUsername && (
                <p className="text-blue-500 text-xs mt-2">
                  Checking availability...
                </p>
              )}
              {usernameError && !checkingUsername && (
                <p className="text-red-500 text-xs mt-2">{usernameError}</p>
              )}
              {!usernameError &&
                !checkingUsername &&
                username &&
                validateUsername(username) === null && (
                  <p className="text-green-500 text-xs mt-2">
                    ✓ Username available
                  </p>
                )}
              <p className="text-gray-500 text-xs mt-2">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || checkingUsername || usernameError || !username}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold rounded-lg px-4 py-3 mt-6 transition text-sm"
            >
              {loading ? "Creating Profile..." : "Continue"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default UsernameSetup;
