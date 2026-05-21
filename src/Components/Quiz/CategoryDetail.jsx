import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Dashboard/NavBar";
import DashboardHeader from "../Dashboard/Header";
import Avatar from "../../Assets/avatar.png";
import { auth } from "../../firebase";
import { getQuizzesByCategory, getCategoryById, deleteQuiz, deleteCategory } from "../../services/firestoreService";
import { useNotifications } from "../../contexts/NotificationContext";
import { Trash2, Edit, Lock } from "lucide-react";
import { SYSTEM_USER_ID } from "../../constants/system";

function CategoryDetail() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotifications();

  const [showDropdown, setShowDropdown] = useState(false);
  const [category, setCategory] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [showDeleteQuizModal, setShowDeleteQuizModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = auth.currentUser?.uid || null;

        // Fetch category details
        const categoryResult = await getCategoryById(categoryId);
        if (!categoryResult.success) {
          setError("Category not found");
          setLoading(false);
          return;
        }
        setCategory(categoryResult.data);

        // Fetch quizzes in this category
        const quizzesResult = await getQuizzesByCategory(categoryId, userId);
        if (quizzesResult.success) {
          setQuizzes(quizzesResult.data);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load category data");
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  const handleQuizClick = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const handleCreateQuiz = () => {
    navigate(`/makequiz?categoryId=${categoryId}`);
  };

  const handleDeleteCategoryClick = () => {
    setShowDeleteCategoryModal(true);
  };

  const handleDeleteCategory = async () => {
    setDeleting(true);
    try {
      const result = await deleteCategory(categoryId);
      if (result.success) {
        notify({
          title: 'Category Deleted',
          message: `"${category.name}" has been deleted successfully`,
          type: 'success',
        });
        navigate('/main');
      } else {
        notify({
          title: 'Error',
          message: result.error || 'Failed to delete category',
          type: 'error',
        });
      }
    } catch (err) {
      notify({
        title: 'Error',
        message: 'An unexpected error occurred',
        type: 'error',
      });
    } finally {
      setDeleting(false);
      setShowDeleteCategoryModal(false);
    }
  };

  const handleDeleteQuizClick = (quizId, e) => {
    e.stopPropagation();
    setSelectedQuizId(quizId);
    setShowDeleteQuizModal(true);
  };

  const handleDeleteQuiz = async () => {
    if (!selectedQuizId) return;

    setDeleting(true);
    try {
      const result = await deleteQuiz(selectedQuizId);
      if (result.success) {
        // Remove quiz from local state
        setQuizzes(prev => prev.filter(q => q.id !== selectedQuizId));

        notify({
          title: 'Quiz Deleted',
          message: 'Quiz has been deleted successfully',
          type: 'success',
        });
      } else {
        notify({
          title: 'Error',
          message: result.error || 'Failed to delete quiz',
          type: 'error',
        });
      }
    } catch (err) {
      notify({
        title: 'Error',
        message: 'An unexpected error occurred',
        type: 'error',
      });
    } finally {
      setDeleting(false);
      setShowDeleteQuizModal(false);
      setSelectedQuizId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Category not found"}</p>
            <button
              onClick={() => navigate("/main")}
              className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-800"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Side Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard Header */}
        <div className="flex-shrink-0 py-4 md:py-6 px-4 md:px-8 bg-gray-100">
          <DashboardHeader
            toggleDropdown={toggleDropdown}
            showDropdown={showDropdown}
            Avatar={Avatar}
          />
        </div>

        {/* Content */}
        <div className="flex-1 px-4 md:px-8 pb-4 md:pb-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            {/* Header with back button */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => navigate("/main")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-gray-500 text-sm mt-1">{category.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const isSystemUser = auth.currentUser?.uid === SYSTEM_USER_ID;
                  const isOwner = auth.currentUser?.uid === category.createdBy;
                  const canDelete = isSystemUser || (isOwner && !category.isSystemCategory);

                  return canDelete && (
                    <button
                      onClick={handleDeleteCategoryClick}
                      className="p-2.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors duration-200"
                      title="Delete Category"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  );
                })()}
                <button
                  onClick={handleCreateQuiz}
                  className="bg-[#6B7A8F] hover:bg-[#5a6675] text-white px-4 md:px-6 py-2.5 rounded-xl font-medium transition-colors duration-200 text-sm md:text-base shadow-sm"
                >
                  + New Quiz
                </button>
              </div>
            </div>

            {/* Quizzes Grid */}
            {quizzes.length === 0 ? (
              <div className="text-center py-16">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No quizzes yet
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  Be the first to create a quiz in this category!
                </p>
                <button
                  onClick={handleCreateQuiz}
                  className="bg-[#6B7A8F] hover:bg-[#5a6675] text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
                >
                  Create Your First Quiz
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {quizzes.map((quiz) => {
                  const isSystemUser = auth.currentUser?.uid === SYSTEM_USER_ID;
                  const isOwner = auth.currentUser?.uid === quiz.createdBy;
                  const canDelete = isSystemUser || isOwner;

                  return (
                    <QuizCard
                      key={quiz.id}
                      quiz={quiz}
                      onClick={() => handleQuizClick(quiz.id)}
                      onDelete={(e) => handleDeleteQuizClick(quiz.id, e)}
                      isOwner={canDelete}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Category Confirmation Modal */}
      {showDeleteCategoryModal && (
        <ConfirmModal
          title="Delete Category"
          message={`Are you sure you want to delete "${category.name}"? This will also delete all quizzes in this category. This action cannot be undone.`}
          confirmText="Delete Category"
          confirmColor="red"
          onConfirm={handleDeleteCategory}
          onCancel={() => setShowDeleteCategoryModal(false)}
          loading={deleting}
        />
      )}

      {/* Delete Quiz Confirmation Modal */}
      {showDeleteQuizModal && (
        <ConfirmModal
          title="Delete Quiz"
          message="Are you sure you want to delete this quiz? This action cannot be undone."
          confirmText="Delete Quiz"
          confirmColor="red"
          onConfirm={handleDeleteQuiz}
          onCancel={() => {
            setShowDeleteQuizModal(false);
            setSelectedQuizId(null);
          }}
          loading={deleting}
        />
      )}
    </div>
  );
}

// Confirmation Modal Component
const ConfirmModal = ({ title, message, confirmText, confirmColor = "red", onConfirm, onCancel, loading }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onCancel}></div>

        {/* Modal panel */}
        <div className="relative inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
                confirmColor === "red"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#6B7A8F] hover:bg-[#5a6675]"
              }`}
            >
              {loading ? "Deleting..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quiz Card Component
const QuizCard = ({ quiz, onClick, onDelete, isOwner }) => {
  const [imageError, setImageError] = React.useState(false);
  const totalQuestions = quiz.questions?.length || 0;
  const totalPoints = quiz.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;
  const fallbackImage = 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=500';

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer group relative"
    >
      {/* Top hover actions */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        {/* Private lock icon (shown on hover for private quizzes) */}
        {!quiz.isPublic && (
          <div
            className="bg-gray-800/80 backdrop-blur-sm text-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
            title="Private Quiz"
          >
            <Lock className="w-4 h-4" />
          </div>
        )}

        {/* Delete button (shown on hover for owner) */}
        {isOwner && (
          <button
            onClick={onDelete}
            className="p-2 bg-white hover:bg-red-50 text-red-600 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
            title="Delete Quiz"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Image */}
      <div className="w-full h-40 mb-4 rounded-lg overflow-hidden bg-gray-100">
        <img
          src={imageError ? fallbackImage : (quiz.imageUrl || fallbackImage)}
          alt={quiz.title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-[#6B7A8F]">
        {quiz.title}
      </h3>

      {/* Description */}
      {quiz.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {quiz.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {totalQuestions} questions
          </span>
          <span className="flex items-center gap-1">
            ⭐ {totalPoints} pts
          </span>
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex items-center justify-between text-xs">
        {quiz.settings?.timeLimit && (
          <span className="text-gray-500">
            ⏱️ {quiz.settings.timeLimit} min
          </span>
        )}
        {quiz.stats?.totalAttempts > 0 && (
          <span className="text-gray-500">
            {quiz.stats.totalAttempts} attempts
          </span>
        )}
      </div>

      {/* Start Quiz Button */}
      <button className="w-full mt-4 bg-[#6B7A8F] hover:bg-[#5a6675] text-white py-2 rounded-lg font-medium transition-colors duration-200 text-sm">
        View Quiz
      </button>
    </div>
  );
};

export default CategoryDetail;
