import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Dashboard/NavBar";
import DashboardHeader from "../Dashboard/Header";
import Avatar from "../../Assets/avatar.png";
import { auth } from "../../firebase";
import { getQuizzesByCategory, getCategoryById, getCategoryBySlug, deleteQuiz, updateQuiz } from "../../services/firestoreService";
import { useNotifications } from "../../contexts/NotificationContext";
import { Trash2, Edit, Lock, Globe, Search, ChevronRight, Share2, Plus } from "lucide-react";

function CategoryDetail() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotifications();

  const [showDropdown, setShowDropdown] = useState(false);
  const [category, setCategory] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteQuizModal, setShowDeleteQuizModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [selectedQuizTitle, setSelectedQuizTitle] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = auth.currentUser?.uid || null;

        // Try to get category by slug first, fallback to ID if not found
        let categoryResult = await getCategoryBySlug(categorySlug);

        // If slug lookup fails, try as ID (for backward compatibility)
        if (!categoryResult.success) {
          categoryResult = await getCategoryById(categorySlug);
        }

        if (!categoryResult.success) {
          setError("Category not found");
          setLoading(false);
          return;
        }

        setCategory(categoryResult.data);

        // Fetch quizzes using the category ID
        const quizzesResult = await getQuizzesByCategory(categoryResult.data.id, userId);

        if (quizzesResult.success) {
          setQuizzes(quizzesResult.data);
        } else {
          console.error('Failed to fetch quizzes:', quizzesResult.error);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load category data");
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug]);

  const handleCreateQuiz = () => {
    navigate(`/makequiz?categoryId=${category.id}`);
  };

  const handleDeleteQuizClick = (quiz) => {
    setSelectedQuizId(quiz.id);
    setSelectedQuizTitle(quiz.title);
    setShowDeleteQuizModal(true);
  };

  const handleDeleteQuiz = async () => {
    if (!selectedQuizId) return;

    setDeleting(true);
    try {
      const result = await deleteQuiz(selectedQuizId);
      if (result.success) {
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
      setSelectedQuizTitle("");
    }
  };

  const handleToggleVisibility = async (quiz) => {
    try {
      const result = await updateQuiz(quiz.id, {
        isPublic: !quiz.isPublic
      });

      if (result.success) {
        // Update local state
        setQuizzes(prev => prev.map(q =>
          q.id === quiz.id ? { ...q, isPublic: !quiz.isPublic } : q
        ));

        notify({
          title: 'Privacy Updated',
          message: `Quiz "${quiz.title}" is now ${!quiz.isPublic ? 'Public' : 'Private'}`,
          type: 'success',
        });
      }
    } catch (err) {
      notify({
        title: 'Error',
        message: 'Failed to update privacy settings',
        type: 'error',
      });
    }
  };

  const handleCopyLink = (quiz) => {
    const link = `${window.location.origin}/quiz/${quiz.id}`;
    navigator.clipboard.writeText(link);
    notify({
      title: 'Link Copied',
      message: 'Quiz link copied to clipboard',
      type: 'success',
    });
  };

  // Filter quizzes based on search query
  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header Section */}
            <div className="px-6 pt-6 pb-6">
              {/* Breadcrumb Navigation */}
              <nav className="flex items-center text-sm mb-4">
                <button
                  onClick={() => navigate("/main")}
                  className="text-gray-500 hover:text-gray-700 transition-colors font-medium"
                >
                  Categories
                </button>
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                <span className="text-gray-900 font-semibold">
                  {category.name}
                </span>
              </nav>

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Title and Count */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {category.name}
                  </h1>
                  <p className="text-gray-500 text-base">
                    {quizzes.length} {quizzes.length === 1 ? 'Quiz' : 'Quizzes'} Available
                  </p>
                </div>

                {/* Search Bar - Right Aligned */}
                {quizzes.length > 0 && (
                  <div className="relative md:w-80 md:mt-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search quizzes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 transition-all"
                      style={{
                        border: '2px solid #D1D5DB'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Quizzes Grid */}
            {filteredQuizzes.length === 0 && searchQuery ? (
              <div className="text-center py-16 px-6">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No matches found
                </h3>
                <p className="text-gray-500 text-sm">
                  Try adjusting your search to find what you're looking for.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-6 pb-6">
                {/* Create Quiz Card - First position in grid */}
                <button
                  onClick={handleCreateQuiz}
                  className="relative rounded-lg overflow-hidden cursor-pointer select-none transition-all duration-200 border-2 border-dashed bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center gap-2 group"
                  style={{
                    aspectRatio: '1/1',
                    borderColor: '#D1D5DB'
                  }}
                >
                  <div className="transition-transform group-hover:scale-110">
                    <Plus className="w-10 h-10 text-gray-600" strokeWidth={2} />
                  </div>
                  <span className="text-gray-700 font-medium text-sm">Create Quiz</span>
                </button>

                {/* Existing Quizzes - Show max 7 */}
                {filteredQuizzes.slice(0, 7).map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    onDelete={() => handleDeleteQuizClick(quiz)}
                    onToggleVisibility={() => handleToggleVisibility(quiz)}
                    onCopyLink={() => handleCopyLink(quiz)}
                    onView={() => navigate(`/quiz/${quiz.id}`)}
                    onEdit={() => navigate(`/makequiz?quizId=${quiz.id}`)}
                  />
                ))}

                {/* View All Card - Show if more than 7 quizzes */}
                {filteredQuizzes.length > 7 && !searchQuery && (
                  <button
                    onClick={() => navigate(`/category/${category.slug || category.id}/all-quizzes`)}
                    className="relative rounded-lg overflow-hidden cursor-pointer select-none transition-all duration-200 border-2 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 flex flex-col items-center justify-center gap-2 group"
                    style={{
                      aspectRatio: '1/1',
                      borderColor: '#93C5FD'
                    }}
                  >
                    <div className="transition-transform group-hover:scale-110">
                      <Search className="w-10 h-10 text-blue-600" strokeWidth={2} />
                    </div>
                    <div className="text-center px-2">
                      <p className="text-blue-700 font-semibold text-sm">View All</p>
                      <p className="text-blue-600 text-xs mt-1">
                        +{filteredQuizzes.length - 7} more
                      </p>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Quiz Modal */}
      {showDeleteQuizModal && (
        <SafeDeleteQuizModal
          quizTitle={selectedQuizTitle}
          onConfirm={handleDeleteQuiz}
          onCancel={() => {
            setShowDeleteQuizModal(false);
            setSelectedQuizId(null);
            setSelectedQuizTitle("");
          }}
          loading={deleting}
        />
      )}
    </div>
  );
}

// Premium Quiz Card with Individual Tooltips
const QuizCard = ({ quiz, onDelete, onToggleVisibility, onCopyLink, onView, onEdit }) => {
  const [imageError, setImageError] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const totalQuestions = quiz.questions?.length || 0;

  // Category-based fallback images
  const categoryFallbacks = {
    technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=300&fit=crop',
    medicine: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&h=300&fit=crop',
    agriculture: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500&h=300&fit=crop',
    history: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=500&h=300&fit=crop',
    art: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500&h=300&fit=crop',
    sport: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=300&fit=crop',
    mythology: 'https://images.unsplash.com/photo-1532153955177-f59af40d6472?w=500&h=300&fit=crop'
  };

  // Gradient fallbacks if image fails
  const gradients = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-yellow-500 to-orange-500',
  ];

  const gradientIndex = quiz.title.length % gradients.length;
  const gradient = gradients[gradientIndex];

  // Get fallback image based on category or use quiz image
  const categorySlug = quiz.categorySlug || 'technology'; // Fallback to technology
  const coverImage = quiz.image || categoryFallbacks[categorySlug] || categoryFallbacks.technology;

  return (
    <div
      className={`relative group bg-white border-2 border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 cursor-pointer ${
        !quiz.isPublic ? 'opacity-85 hover:opacity-100' : ''
      }`}
      onClick={onView}
      style={{ aspectRatio: '1/1' }}
    >
      {/* Cover Image with Gradient Fallback (65% height) */}
      <div className="relative overflow-hidden bg-gray-200" style={{ height: '65%' }}>
        {!imageError ? (
          <img
            src={coverImage}
            alt={quiz.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient}`}></div>
        )}

        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Corner Badges - Always Visible */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF'
            }}
          >
            {totalQuestions} {totalQuestions === 1 ? 'Q' : 'Qs'}
          </span>
          <span
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold"
            style={{
              background: 'rgba(255, 223, 0, 0.3)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 223, 0, 0.3)',
              color: '#FFFFFF'
            }}
          >
            ⭐ {quiz.totalPoints || totalQuestions * 10} pts
          </span>
        </div>

        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            className="transition-transform hover:scale-105"
            title={quiz.isPublic ? "Click to make private" : "Click to make public"}
          >
            {quiz.isPublic ? (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF'
                }}
              >
                <Globe className="w-2.5 h-2.5" />
                Public
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}
              >
                <Lock className="w-2.5 h-2.5" />
                Private
              </span>
            )}
          </button>
        </div>

        {/* Glassmorphic Action Overlay - On Hover */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          {/* Edit Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              onMouseEnter={() => setHoveredButton('edit')}
              onMouseLeave={() => setHoveredButton(null)}
              className="p-2 bg-white/95 hover:bg-white rounded-full shadow-lg transition-all duration-200 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
              style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <Edit className="w-4 h-4 text-gray-700" />
            </button>
            {hoveredButton === 'edit' && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 animate-in fade-in slide-in-from-bottom-2 duration-150">
                Edit
              </span>
            )}
          </div>

          {/* Share Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (quiz.isPublic) {
                  onCopyLink();
                }
              }}
              onMouseEnter={() => setHoveredButton('share')}
              onMouseLeave={() => setHoveredButton(null)}
              disabled={!quiz.isPublic}
              className={`p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 delay-75 ${
                quiz.isPublic
                  ? 'bg-white/95 hover:bg-white cursor-pointer'
                  : 'bg-gray-300/50 cursor-not-allowed'
              }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <Share2 className={`w-4 h-4 ${quiz.isPublic ? 'text-gray-700' : 'text-gray-400'}`} />
            </button>
            {hoveredButton === 'share' && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 animate-in fade-in slide-in-from-bottom-2 duration-150">
                {quiz.isPublic ? 'Share' : 'Make public'}
              </span>
            )}
          </div>

          {/* Delete Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              onMouseEnter={() => setHoveredButton('delete')}
              onMouseLeave={() => setHoveredButton(null)}
              className="p-2 bg-white/95 hover:bg-red-50 rounded-full shadow-lg transition-all duration-200 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 delay-150"
              style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
            {hoveredButton === 'delete' && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 animate-in fade-in slide-in-from-bottom-2 duration-150">
                Delete
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Content (Bottom 35%) - Title Only */}
      <div className="flex items-center px-2.5 bg-white" style={{ height: '35%' }}>
        {/* Quiz Title - Bold & Centered Vertically */}
        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug">
          {quiz.title}
        </h3>
      </div>
    </div>
  );
};

// Safe Delete Quiz Modal with Type Confirmation
const SafeDeleteQuizModal = ({ quizTitle, onConfirm, onCancel, loading }) => {
  const [confirmText, setConfirmText] = useState("");
  const isConfirmValid = confirmText === "DELETE";

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onKeyDown={(e) => {
        if (e.key === 'Enter' && isConfirmValid && !loading) {
          onConfirm();
        } else if (e.key === 'Escape') {
          onCancel();
        }
      }}
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onCancel}></div>

        {/* Modal panel */}
        <div className="relative inline-block w-full max-w-lg p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
            Delete Quiz Permanently?
          </h3>

          {/* Warning Message */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-900 font-semibold mb-2">
              ⚠️ You are about to delete "{quizTitle}"
            </p>
            <p className="text-xs text-red-800 leading-relaxed">
              This will permanently erase all questions, leaderboard records, and user history. This action <strong>cannot be undone</strong>.
            </p>
          </div>

          {/* Type Confirmation Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-bold text-red-600">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm font-mono"
              autoFocus
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || !isConfirmValid}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </span>
              ) : (
                "Delete Permanently"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetail;
