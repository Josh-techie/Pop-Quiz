import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories, deleteCategory, getQuizzesByCategory } from "../../services/firestoreService";
import { auth } from "../../firebase";
import Avatar from "../../Assets/avatar.png";
import DashboardHeader from "./Header";
import CreateCategoryDrawer from "./CreateCategoryDrawer";
import { Plus, Trash2, Lock, Search, ChevronRight, ArrowLeft, Grid3x3, List, ChevronDown } from "lucide-react";
import { useNotifications } from "../../contexts/NotificationContext";
import { SYSTEM_USER_ID } from "../../constants/system";
import Navbar from "./NavBar";

// Card component (same as dashboard)
const Card = ({ title, image, cardLink, description, categoryId, createdBy, isSystemCategory, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  const fallbackImage = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500';
  const isSystemUser = auth.currentUser?.uid === SYSTEM_USER_ID;
  const isOwner = auth.currentUser?.uid === createdBy;
  const canDelete = isSystemUser || (isOwner && !isSystemCategory);

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(categoryId, title);
    }
  };

  return (
    <Link
      to={cardLink}
      className="relative rounded-2xl overflow-hidden cursor-pointer select-none block group shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageError ? fallbackImage : (image || fallbackImage)}
          alt={title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {/* Overlay gradient - ensures text readability on all images */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

        {/* Top-right hover actions */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1.5 sm:gap-2">
          {/* Show lock icon on hover for system categories (non-deletable) */}
          {isSystemCategory && !canDelete && (
            <div
              className="bg-gray-800/80 backdrop-blur-sm text-white p-1.5 sm:p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
              title="System Category (Cannot be deleted)"
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          )}

          {/* Delete Button (shown on hover for deletable categories) */}
          {canDelete && onDelete && (
            <button
              onClick={handleDeleteClick}
              className="bg-white/95 hover:bg-red-50 text-red-600 p-1.5 sm:p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
              title="Delete Category"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        {/* Title overlay - fixed positioning for consistency */}
        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="text-white text-base sm:text-lg md:text-xl font-bold drop-shadow-lg leading-tight">
            {title}
          </h2>
          {description && (
            <p className="text-white/90 text-[10px] sm:text-xs mt-1 sm:mt-1.5 drop-shadow-md line-clamp-2 leading-snug">
              {description.length > 80 ? description.substring(0, 80) + '...' : description}
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

// Delete Category Modal
const DeleteCategoryModal = ({ categoryName, quizCount, onConfirm, onCancel, loading }) => {
  const hasQuizzes = quizCount > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onCancel}></div>

        {/* Modal panel */}
        <div className="relative inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Icon */}
          <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full ${
            hasQuizzes ? 'bg-orange-100' : 'bg-red-100'
          }`}>
            <Trash2 className={`w-6 h-6 ${hasQuizzes ? 'text-orange-600' : 'text-red-600'}`} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 text-center mb-4">
            Delete "{categoryName}"?
          </h3>

          {/* Message */}
          {hasQuizzes ? (
            <>
              {/* Strong Warning Box */}
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 mb-4">
                <p className="text-sm text-orange-900 font-semibold mb-2">
                  ⚠️ This category contains {quizCount} active {quizCount === 1 ? 'quiz' : 'quizzes'}
                </p>
                <p className="text-xs text-orange-800 leading-relaxed">
                  Deleting this category will automatically unlink {quizCount === 1 ? 'this quiz' : 'all quizzes'}, making {quizCount === 1 ? 'it' : 'them'} orphaned and harder to find. This action is permanent and cannot be undone.
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-600 text-center mb-6">
              This category is empty and safe to delete.
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50 ${
                hasQuizzes
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? 'Deleting...' : hasQuizzes ? `Yes, Delete (${quizCount})` : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function AllCategories() {
  const { notify } = useNotifications();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [quizCountInCategory, setQuizCountInCategory] = useState(0);
  const [deletingCategory, setDeletingCategory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, alphabetical, mostPlayed
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(12);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const ITEMS_PER_LOAD = 12;

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Fetch categories from Firestore
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const userId = auth.currentUser?.uid || null;
      const result = await getCategories(userId);

      if (result.success) {
        setCategories(result.data);
        setFilteredCategories(result.data);
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

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter and sort categories
  useEffect(() => {
    let filtered = categories;

    // Apply search filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
        case "oldest":
          return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
        case "updated":
          return (b.updatedAt?.toMillis() || b.createdAt?.toMillis() || 0) -
                 (a.updatedAt?.toMillis() || a.createdAt?.toMillis() || 0);
        case "alphabetical":
          return a.name.localeCompare(b.name);
        case "alphabetical-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    setFilteredCategories(sorted);
    setDisplayedCount(12); // Reset displayed count when filters change
  }, [searchQuery, categories, sortBy]);

  // Infinite scroll observer
  const handleObserver = useCallback((entries) => {
    const [target] = entries;
    if (target.isIntersecting && displayedCount < filteredCategories.length) {
      setDisplayedCount(prev => Math.min(prev + ITEMS_PER_LOAD, filteredCategories.length));
    }
  }, [displayedCount, filteredCategories.length]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "100px",
      threshold: 0
    };

    observerRef.current = new IntersectionObserver(handleObserver, option);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  // Calculate what to display
  const currentCategories = filteredCategories.slice(0, displayedCount);
  const hasMore = displayedCount < filteredCategories.length;

  const handleCategoryCreated = () => {
    fetchCategories();
  };

  const handleDeleteClick = async (categoryId, categoryName) => {
    const userId = auth.currentUser?.uid || null;
    const result = await getQuizzesByCategory(categoryId, userId);
    const quizCount = result.success ? result.data.length : 0;

    setCategoryToDelete({ id: categoryId, name: categoryName });
    setQuizCountInCategory(quizCount);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setDeletingCategory(true);
    try {
      const result = await deleteCategory(categoryToDelete.id);
      if (result.success) {
        notify({
          title: 'Category Deleted',
          message: `"${categoryToDelete.name}" has been deleted successfully`,
          type: 'success',
        });
        fetchCategories();
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
      setDeletingCategory(false);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      setQuizCountInCategory(0);
    }
  };

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
        <div className="flex-1 px-3 md:px-8 pb-20 md:pb-8 overflow-y-auto overflow-x-hidden">
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-3 md:p-6 max-w-full">
            {/* Compact Header - Responsive Layout */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4 md:mb-6">
              {/* Left: Back Button + Title (Full width on mobile) */}
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => navigate("/main")}
                  className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-gray-600 flex-shrink-0"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex flex-col gap-0.5 flex-1">
                  <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight leading-none">
                    All Categories
                  </h1>
                  <p className="text-gray-500 text-xs md:text-sm leading-none">
                    {loading
                      ? "Loading..."
                      : error
                      ? "Error"
                      : searchQuery
                      ? `${filteredCategories.length} of ${categories.length}`
                      : `${categories.length} ${categories.length === 1 ? 'Category' : 'Categories'}`}
                  </p>
                </div>
              </div>

              {/* Search Bar with Controls (Full width on mobile) */}
              <div className="flex items-center gap-2 w-full md:w-auto md:flex-1 md:min-w-0">
                <div className="relative flex-1 md:max-w-md">
                  <Search className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 md:pl-10 pr-2 md:pr-3 py-1.5 md:py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7A8F] focus:border-transparent text-sm bg-gray-50"
                  />
                </div>

                {/* Sort Dropdown */}
                <div className="relative" ref={sortDropdownRef}>
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center gap-1 px-2 md:px-2.5 py-1.5 md:py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 whitespace-nowrap min-w-[80px] md:min-w-[100px] justify-between"
                  >
                    <span className="hidden sm:inline text-xs md:text-sm">
                      {sortBy === "newest" && "Newest"}
                      {sortBy === "oldest" && "Oldest"}
                      {sortBy === "updated" && "Updated"}
                      {sortBy === "alphabetical" && "A-Z"}
                      {sortBy === "alphabetical-desc" && "Z-A"}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                  {showSortDropdown && (
                    <div className="absolute left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                      <button
                        onClick={() => { setSortBy("newest"); setShowSortDropdown(false); }}
                        className={`w-full text-left px-3 py-2 md:py-2.5 hover:bg-gray-50 text-xs md:text-sm transition-colors ${sortBy === "newest" ? "bg-gray-100 font-semibold text-[#6B7A8F]" : ""}`}
                      >
                        Newest Added
                      </button>
                      <button
                        onClick={() => { setSortBy("oldest"); setShowSortDropdown(false); }}
                        className={`w-full text-left px-3 py-2 md:py-2.5 hover:bg-gray-50 text-xs md:text-sm transition-colors border-t border-gray-100 ${sortBy === "oldest" ? "bg-gray-100 font-semibold text-[#6B7A8F]" : ""}`}
                      >
                        Oldest Added
                      </button>
                      <button
                        onClick={() => { setSortBy("updated"); setShowSortDropdown(false); }}
                        className={`w-full text-left px-3 py-2 md:py-2.5 hover:bg-gray-50 text-xs md:text-sm transition-colors border-t border-gray-100 ${sortBy === "updated" ? "bg-gray-100 font-semibold text-[#6B7A8F]" : ""}`}
                      >
                        Last Updated
                      </button>
                      <button
                        onClick={() => { setSortBy("alphabetical"); setShowSortDropdown(false); }}
                        className={`w-full text-left px-3 py-2 md:py-2.5 hover:bg-gray-50 text-xs md:text-sm transition-colors border-t border-gray-100 ${sortBy === "alphabetical" ? "bg-gray-100 font-semibold text-[#6B7A8F]" : ""}`}
                      >
                        Alphabetical (A-Z)
                      </button>
                      <button
                        onClick={() => { setSortBy("alphabetical-desc"); setShowSortDropdown(false); }}
                        className={`w-full text-left px-3 py-2 md:py-2.5 hover:bg-gray-50 text-xs md:text-sm transition-colors border-t border-gray-100 ${sortBy === "alphabetical-desc" ? "bg-gray-100 font-semibold text-[#6B7A8F]" : ""}`}
                      >
                        Alphabetical (Z-A)
                      </button>
                    </div>
                  )}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 md:p-2 transition-colors ${viewMode === "grid" ? "bg-[#6B7A8F] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                    title="Grid View"
                  >
                    <Grid3x3 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 md:p-2 transition-colors ${viewMode === "list" ? "bg-[#6B7A8F] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                    title="List View"
                  >
                    <List className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>

              {/* Right: New Category Button - Hidden on mobile (uses FAB) */}
              <button
                onClick={() => setShowCreateDrawer(true)}
                className="hidden md:flex bg-[#6B7A8F] hover:bg-[#5a6675] text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm items-center gap-2 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>New</span>
              </button>
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

            {/* Categories Grid/List - Infinite Scroll */}
            {!loading && !error && filteredCategories.length > 0 && (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {currentCategories.map((category) => (
                      <Card
                        key={category.id}
                        title={category.name}
                        image={category.image}
                        description={category.description}
                        cardLink={`/category/${category.slug || category.id}`}
                        categoryId={category.id}
                        createdBy={category.createdBy}
                        isSystemCategory={category.isSystemCategory || false}
                        onDelete={handleDeleteClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentCategories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/category/${category.slug || category.id}`}
                        className="flex items-center gap-4 p-4 bg-white border-2 border-gray-100 rounded-lg hover:border-gray-300 hover:shadow-md transition-all group"
                      >
                        <img
                          src={category.image || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500'}
                          alt={category.name}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-[#6B7A8F] transition-colors truncate">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {category.description || "No description"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {category.isSystemCategory && (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Infinite Scroll Trigger */}
                {hasMore && (
                  <div ref={loadMoreRef} className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B7A8F]"></div>
                  </div>
                )}

                {/* Showing Count */}
                {!hasMore && filteredCategories.length > 12 && (
                  <p className="text-center text-sm text-gray-500 mt-6">
                    Showing all {filteredCategories.length} categories
                  </p>
                )}
              </>
            )}

            {/* Empty State - No results */}
            {!loading && !error && searchQuery && filteredCategories.length === 0 && (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No categories found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search or create a new category
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-[#6B7A8F] hover:text-[#5a6675] font-medium"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Empty State - No categories at all */}
            {!loading && !error && !searchQuery && categories.length === 0 && (
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
                <button
                  onClick={() => setShowCreateDrawer(true)}
                  className="inline-block bg-[#6B7A8F] hover:bg-[#5a6675] text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
                >
                  Create Category
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Category Drawer */}
      <CreateCategoryDrawer
        isOpen={showCreateDrawer}
        onClose={() => setShowCreateDrawer(false)}
        onSuccess={handleCategoryCreated}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && categoryToDelete && (
        <DeleteCategoryModal
          categoryName={categoryToDelete.name}
          quizCount={quizCountInCategory}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setCategoryToDelete(null);
            setQuizCountInCategory(0);
          }}
          loading={deletingCategory}
        />
      )}
    </div>
  );
}

export default AllCategories;
