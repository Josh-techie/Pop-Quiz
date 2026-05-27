import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Dashboard/NavBar";
import DashboardHeader from "../Dashboard/Header";
import Avatar from "../../Assets/avatar.png";
import { auth } from "../../firebase";
import { getQuizzesByCategory, getCategoryById, getCategoryBySlug, deleteQuiz, updateQuiz } from "../../services/firestoreService";
import { useNotifications } from "../../contexts/NotificationContext";
import { Trash2, Edit, Lock, Globe, Search, ChevronRight, Share2, Filter, SortAsc } from "lucide-react";

function AllQuizzesInCategory() {
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
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, nameAZ, nameZA
  const [filterBy, setFilterBy] = useState("all"); // all, public, private

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = auth.currentUser?.uid || null;

        let categoryResult = await getCategoryBySlug(categorySlug);
        if (!categoryResult.success) {
          categoryResult = await getCategoryById(categorySlug);
        }

        if (!categoryResult.success) {
          setError("Category not found");
          setLoading(false);
          return;
        }

        setCategory(categoryResult.data);

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

  // Filter and sort quizzes
  const getFilteredAndSortedQuizzes = () => {
    let filtered = quizzes;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((quiz) =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply privacy filter
    if (filterBy === 'public') {
      filtered = filtered.filter(q => q.isPublic);
    } else if (filterBy === 'private') {
      filtered = filtered.filter(q => !q.isPublic);
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        break;
      case 'oldest':
        sorted.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        break;
      case 'nameAZ':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'nameZA':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'updated':
        sorted.sort((a, b) => (b.updatedAt?.seconds || b.createdAt?.seconds || 0) - (a.updatedAt?.seconds || a.createdAt?.seconds || 0));
        break;
      default:
        break;
    }

    return sorted;
  };

  const filteredQuizzes = getFilteredAndSortedQuizzes();

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
      <Navbar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 py-4 md:py-6 px-4 md:px-8 bg-gray-100">
          <DashboardHeader
            toggleDropdown={toggleDropdown}
            showDropdown={showDropdown}
            Avatar={Avatar}
          />
        </div>

        <div className="flex-1 px-4 md:px-8 pb-4 md:pb-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
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
                <button
                  onClick={() => navigate(`/category/${category.slug || category.id}`)}
                  className="text-gray-500 hover:text-gray-700 transition-colors font-medium"
                >
                  {category.name}
                </button>
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                <span className="text-gray-900 font-semibold">All Quizzes</span>
              </nav>

              <div className="flex flex-col gap-4">
                {/* Title */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    All {category.name} Quizzes
                  </h1>
                  <p className="text-gray-500 text-base">
                    {quizzes.length} {quizzes.length === 1 ? 'Quiz' : 'Quizzes'} Total
                  </p>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search quizzes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 transition-all border-2 border-gray-200"
                    />
                  </div>

                  {/* Filter by Privacy */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value)}
                      className="pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 border-2 border-gray-200 cursor-pointer appearance-none"
                    >
                      <option value="all">All Quizzes</option>
                      <option value="public">Public Only</option>
                      <option value="private">Private Only</option>
                    </select>
                  </div>

                  {/* Sort by */}
                  <div className="relative">
                    <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 border-2 border-gray-200 cursor-pointer appearance-none"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="updated">Recently Updated</option>
                      <option value="nameAZ">Name (A-Z)</option>
                      <option value="nameZA">Name (Z-A)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Quizzes Grid */}
            {filteredQuizzes.length === 0 ? (
              <div className="text-center py-16 px-6">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No quizzes found
                </h3>
                <p className="text-gray-500 text-sm">
                  {searchQuery || filterBy !== 'all'
                    ? 'Try adjusting your filters or search query.'
                    : 'No quizzes in this category yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 px-6 pb-6">
                {filteredQuizzes.map((quiz) => (
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

// Compact Quiz Card Component (same as CategoryDetail but smaller)
const QuizCard = ({ quiz, onDelete, onToggleVisibility, onCopyLink, onView, onEdit }) => {
  const [imageError, setImageError] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const totalQuestions = quiz.questions?.length || 0;

  const categoryFallbacks = {
    technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=300&fit=crop',
    medicine: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&h=300&fit=crop',
    agriculture: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500&h=300&fit=crop',
    history: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=500&h=300&fit=crop',
    art: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500&h=300&fit=crop',
    sport: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=300&fit=crop',
    mythology: 'https://images.unsplash.com/photo-1532153955177-f59af40d6472?w=500&h=300&fit=crop'
  };

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
  const categorySlug = quiz.categorySlug || 'technology';
  const coverImage = quiz.image || categoryFallbacks[categorySlug] || categoryFallbacks.technology;

  return (
    <div
      className={`relative group bg-white border-2 border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 cursor-pointer ${
        !quiz.isPublic ? 'opacity-85 hover:opacity-100' : ''
      }`}
      onClick={onView}
      style={{ aspectRatio: '1/1' }}
    >
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

        <div className="absolute inset-0 bg-black/10"></div>

        <div className="absolute top-2 left-2 z-10">
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
        </div>

        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            className="transition-transform hover:scale-105"
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

        <div className="absolute inset-0 bg-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              onMouseEnter={() => setHoveredButton('edit')}
              onMouseLeave={() => setHoveredButton(null)}
              className="p-2 bg-white/95 hover:bg-white rounded-full shadow-lg transition-all duration-200 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
            >
              <Edit className="w-4 h-4 text-gray-700" />
            </button>
            {hoveredButton === 'edit' && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10">
                Edit
              </span>
            )}
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (quiz.isPublic) onCopyLink();
              }}
              onMouseEnter={() => setHoveredButton('share')}
              onMouseLeave={() => setHoveredButton(null)}
              disabled={!quiz.isPublic}
              className={`p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 delay-75 ${
                quiz.isPublic ? 'bg-white/95 hover:bg-white cursor-pointer' : 'bg-gray-300/50 cursor-not-allowed'
              }`}
            >
              <Share2 className={`w-4 h-4 ${quiz.isPublic ? 'text-gray-700' : 'text-gray-400'}`} />
            </button>
            {hoveredButton === 'share' && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10">
                {quiz.isPublic ? 'Share' : 'Make public'}
              </span>
            )}
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              onMouseEnter={() => setHoveredButton('delete')}
              onMouseLeave={() => setHoveredButton(null)}
              className="p-2 bg-white/95 hover:bg-red-50 rounded-full shadow-lg transition-all duration-200 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 delay-150"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
            {hoveredButton === 'delete' && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10">
                Delete
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center px-2.5 bg-white" style={{ height: '35%' }}>
        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug">
          {quiz.title}
        </h3>
      </div>
    </div>
  );
};

// Safe Delete Modal (reused from CategoryDetail)
const SafeDeleteQuizModal = ({ quizTitle, onConfirm, onCancel, loading }) => {
  const [confirmText, setConfirmText] = useState("");
  const isConfirmValid = confirmText === "DELETE";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onCancel}></div>
        <div className="relative inline-block w-full max-w-lg p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
            Delete Quiz Permanently?
          </h3>
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-900 font-semibold mb-2">
              ⚠️ You are about to delete "{quizTitle}"
            </p>
            <p className="text-xs text-red-800 leading-relaxed">
              This will permanently erase all questions, leaderboard records, and user history. This action <strong>cannot be undone</strong>.
            </p>
          </div>
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
              {loading ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllQuizzesInCategory;
