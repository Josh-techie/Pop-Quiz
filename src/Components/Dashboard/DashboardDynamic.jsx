import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../../services/firestoreService";
import { auth } from "../../firebase";
import Avatar from "../../Assets/avatar.png";
import DashboardHeader from "./Header";

// Card component
const Card = ({ title, image, cardLink, description }) => {
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
          {description && (
            <p className="text-white/90 text-xs mt-1 drop-shadow-md line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

// Loading Skeleton Card
const SkeletonCard = () => {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-md animate-pulse">
      <div className="h-48 bg-gray-300"></div>
      <div className="absolute bottom-4 left-4 right-4">
        <div className="h-6 bg-gray-400 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-400 rounded w-1/2"></div>
      </div>
    </div>
  );
};

function DashboardDynamic() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toggle dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const userId = auth.currentUser?.uid || null;
        const result = await getCategories(userId);

        if (result.success) {
          setCategories(result.data);
          setError(null);
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
          <p className="text-gray-500 text-sm">
            {loading
              ? "Loading categories..."
              : error
              ? "Error loading categories"
              : `${categories.length} Categories Available`}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">Error loading categories</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Categories Grid */}
        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Card
                key={category.id}
                title={category.name}
                image={category.image}
                description={category.description}
                cardLink={`/category/${category.slug || category.id}`}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && categories.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Categories Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first quiz category!
            </p>
            <Link
              to="/makequiz"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Create Category
            </Link>
          </div>
        )}

        {/* More button (only show if there are categories) */}
        {!loading && !error && categories.length > 0 && (
          <div className="flex justify-end mt-8">
            <button className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors duration-200">
              More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardDynamic;
