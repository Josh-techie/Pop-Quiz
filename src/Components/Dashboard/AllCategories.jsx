import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories, deleteCategory, getQuizzesByCategory } from "../../services/firestoreService";
import { auth } from "../../firebase";
import Avatar from "../../Assets/avatar.png";
import DashboardHeader from "./Header";
import CreateCategoryDrawer from "./CreateCategoryDrawer";
import { Plus, Trash2, Lock, ArrowLeft, Search } from "lucide-react";
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
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onCancel}></div>

        {/* Modal panel */}
        <div className="relative inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
            Delete "{categoryName}"?
          </h3>

          {/* Message */}
          <div className="mb-6">
            {quizCount > 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-yellow-800 font-medium mb-1">
                  ⚠️ Warning: This category contains {quizCount} {quizCount === 1 ? 'quiz' : 'quizzes'}!
                </p>
                <p className="text-xs text-yellow-700">
                  Deleting this category will make these quizzes orphaned.
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-blue-800">
                  ℹ️ This category is empty (no quizzes inside).
                </p>
              </div>
            )}

            <p className="text-sm text-gray-600 text-center">
              {quizCount > 0
                ? "Are you absolutely sure? This action cannot be undone!"
                : "You can safely delete this empty category."}
            </p>
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
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete Category'}
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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

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

  // Filter categories based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [searchQuery, categories]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCategories = filteredCategories.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        <div className="flex-1 px-4 md:px-8 pb-4 md:pb-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            {/* Header with back button and search */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => navigate("/main")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Go back to dashboard"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    All Categories
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    {loading
                      ? "Loading categories..."
                      : error
                      ? "Error loading categories"
                      : searchQuery
                      ? `${filteredCategories.length} of ${categories.length} Categories (filtered)`
                      : `${categories.length} ${categories.length === 1 ? 'Category' : 'Categories'} • Page ${currentPage} of ${totalPages}`}
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateDrawer(true)}
                  className="bg-[#6B7A8F] hover:bg-[#5a6675] text-white px-4 md:px-6 py-2.5 rounded-xl font-medium transition-colors duration-200 text-sm md:text-base shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Category</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7A8F] transition-colors"
                />
              </div>
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

            {/* Categories Grid - Paginated */}
            {!loading && !error && filteredCategories.length > 0 && (
              <>
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Previous page"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        const showPage =
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1);

                        const showEllipsis =
                          (page === currentPage - 2 && currentPage > 3) ||
                          (page === currentPage + 2 && currentPage < totalPages - 2);

                        if (showEllipsis) {
                          return (
                            <span key={page} className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }

                        if (!showPage) return null;

                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`min-w-[40px] h-10 rounded-lg font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-[#6B7A8F] text-white'
                                : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Next page"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Page Info */}
                {totalPages > 1 && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredCategories.length)} of {filteredCategories.length} categories
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
