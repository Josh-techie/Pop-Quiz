import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, ChevronLeft, ChevronRight,
  Lock, Globe, Image as ImageIcon, Star
} from 'lucide-react';
import Navbar from '../Dashboard/NavBar';
import DashboardHeader from '../Dashboard/Header';
import Avatar from '../../Assets/avatar.png';
import { auth } from '../../firebase';
import {
  createQuiz,
  updateQuiz,
  getQuizById,
  getCategoryById,
  getCategories
} from '../../services/firestoreService';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigation } from '../../contexts/NavigationContext';

// Simplified 3-step wizard
const STEPS = {
  BASICS: 0,
  QUESTIONS: 1,
  REVIEW: 2
};

function MakeQuiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useNotifications();
  const { setNavigationBlock } = useNavigation();
  const [searchParams] = useSearchParams();
  const categoryIdFromUrl = searchParams.get('categoryId');
  const quizId = searchParams.get('quizId');

  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [isPublished, setIsPublished] = useState(false);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [nextLocation, setNextLocation] = useState(null);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(STEPS.BASICS);

  // Form data - DEFAULT TO PRIVATE
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryIdFromUrl || '');
  const [category, setCategory] = useState(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isPublic, setIsPublic] = useState(false); // DEFAULT: PRIVATE
  // isDraft is managed in handleSaveQuiz - not needed in state here

  // Settings
  const [hasTimeLimit, setHasTimeLimit] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30);
  const [navigationType, setNavigationType] = useState('free');
  const [reviewPermission, setReviewPermission] = useState('full');

  // Questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      questionText: '',
      imageUrl: '',
      points: 10,
      allowMultipleAnswers: false, // NEW: Single or multiple answers
      options: [
        { id: Date.now() + 1, text: '', isCorrect: true },
        { id: Date.now() + 2, text: '', isCorrect: false }
      ]
    }
  ]);

  // Validation errors (inline, no notifications)
  const [errors, setErrors] = useState({});

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  // Calculate total points
  const totalPoints = questions.reduce((sum, q) => sum + (parseInt(q.points) || 0), 0);

  // Check if quiz has any content
  const hasQuizContent = () => {
    return (
      quizTitle.trim() !== '' ||
      quizDescription.trim() !== '' ||
      coverImage !== '' ||
      selectedCategoryId !== '' ||
      questions.some(q => q.questionText.trim() !== '' || q.options.some(opt => opt.text.trim() !== ''))
    );
  };

  // Update navigation block state whenever content changes
  useEffect(() => {
    setNavigationBlock(hasQuizContent());

    // Cleanup: clear navigation block when component unmounts
    return () => {
      setNavigationBlock(false);
    };
  }, [quizTitle, quizDescription, coverImage, selectedCategoryId, questions, setNavigationBlock]);

  // Custom navigation guard using popstate for back/forward
  useEffect(() => {
    const handlePopState = (e) => {
      if (hasQuizContent()) {
        e.preventDefault();
        const confirmLeave = window.confirm('You have unsaved changes. Do you really want to leave?');
        if (!confirmLeave) {
          // Push current location back to prevent navigation
          window.history.pushState(null, '', location.pathname + location.search);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [quizTitle, quizDescription, coverImage, selectedCategoryId, questions, location]);

  // Warn before leaving page with unsaved changes (browser actions)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const hasContent = (
        quizTitle.trim() !== '' ||
        quizDescription.trim() !== '' ||
        coverImage !== '' ||
        selectedCategoryId !== '' ||
        questions.some(q => q.questionText.trim() !== '' || q.options.some(opt => opt.text.trim() !== ''))
      );

      if (hasContent) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [quizTitle, quizDescription, coverImage, selectedCategoryId, questions]);

  // Get badge state based on quiz status
  const getBadgeState = () => {
    if (isEditMode && isPublished) {
      return { icon: '🔄', text: 'Revision', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', color: '#2563EB' };
    }
    // Default: Draft mode
    return { icon: '✏️', text: 'Draft', bg: 'rgba(254, 243, 199, 0.6)', border: 'rgba(217, 119, 6, 0.15)', color: '#D97706' };
  };

  // Load categories and quiz data
  useEffect(() => {
    const loadData = async () => {
      try {
        const categoriesResult = await getCategories();
        if (categoriesResult.success) {
          setAllCategories(categoriesResult.data);
        }

        if (selectedCategoryId) {
          const categoryResult = await getCategoryById(selectedCategoryId);
          if (categoryResult.success) {
            setCategory(categoryResult.data);
          }
        }

        if (quizId) {
          setIsEditMode(true);
          const quizResult = await getQuizById(quizId);
          if (quizResult.success) {
            const quiz = quizResult.data;
            setQuizTitle(quiz.title || '');
            setQuizDescription(quiz.description || '');
            setCoverImage(quiz.image || '');
            setIsPublic(quiz.isPublic !== undefined ? quiz.isPublic : false);
            // Check if quiz is published (not a draft)
            if (quiz.isDraft === false) {
              setIsPublished(true);
            }

            if (quiz.settings) {
              setHasTimeLimit(!!quiz.settings.timeLimit);
              setTimeLimit(quiz.settings.timeLimit || 30);
              setNavigationType(quiz.settings.navigationType || 'free');
              setReviewPermission(quiz.settings.reviewPermission || 'full');
            }

            if (quiz.questions && quiz.questions.length > 0) {
              const loadedQuestions = quiz.questions.map((q, idx) => ({
                id: Date.now() + idx,
                questionText: q.questionText || '',
                imageUrl: q.imageUrl || '',
                points: q.points || 10,
                allowMultipleAnswers: q.allowMultipleAnswers || false,
                options: q.options?.map((opt, optIdx) => ({
                  id: Date.now() + idx * 100 + optIdx,
                  text: opt.text || '',
                  isCorrect: opt.isCorrect || false
                })) || []
              }));
              setQuestions(loadedQuestions);
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [selectedCategoryId, quizId]);

  // Navigation
  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const goToNextStep = () => {
    // Validate current step (inline errors only, no notifications)
    if (currentStep === STEPS.BASICS) {
      const newErrors = {};

      if (!selectedCategoryId) {
        newErrors.category = 'Please select a category';
      }
      if (!quizTitle.trim()) {
        newErrors.title = 'Quiz title is required';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
    }

    if (currentStep < STEPS.REVIEW) {
      goToStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > STEPS.BASICS) {
      goToStep(currentStep - 1);
    }
  };

  // Category selection
  const handleCategorySelect = (catId) => {
    setSelectedCategoryId(catId);
    const selectedCat = allCategories.find(c => c.id === catId);
    setCategory(selectedCat);
    setErrors({ ...errors, category: '' });
  };

  // Question navigation
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Question management
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      questionText: '',
      imageUrl: '',
      points: 10,
      allowMultipleAnswers: false,
      options: [
        { id: Date.now() + 1, text: '', isCorrect: true },
        { id: Date.now() + 2, text: '', isCorrect: false }
      ]
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestionIndex(questions.length);
  };

  const deleteCurrentQuestion = () => {
    if (questions.length === 1) {
      return; // Silent fail - just don't delete
    }

    const newQuestions = questions.filter((_, idx) => idx !== currentQuestionIndex);
    setQuestions(newQuestions);

    if (currentQuestionIndex >= newQuestions.length) {
      setCurrentQuestionIndex(newQuestions.length - 1);
    }
  };

  const updateCurrentQuestion = (updates) => {
    setQuestions(questions.map((q, idx) =>
      idx === currentQuestionIndex ? { ...q, ...updates } : q
    ));
  };

  const updateQuestionText = (text) => {
    updateCurrentQuestion({ questionText: text });
  };

  const updateQuestionPoints = (points) => {
    const numPoints = parseInt(points) || 0;
    if (numPoints >= 1 && numPoints <= 100) {
      updateCurrentQuestion({ points: numPoints });
    }
  };

  const updateQuestionImage = (url) => {
    updateCurrentQuestion({ imageUrl: url });
  };

  const toggleMultipleAnswers = () => {
    const currentQuestion = questions[currentQuestionIndex];
    updateCurrentQuestion({
      allowMultipleAnswers: !currentQuestion.allowMultipleAnswers,
      // Reset to single correct answer when switching to single mode
      options: !currentQuestion.allowMultipleAnswers
        ? currentQuestion.options
        : currentQuestion.options.map((opt, idx) => ({ ...opt, isCorrect: idx === 0 }))
    });
  };

  const addOption = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.options.length >= 6) {
      return; // Silent fail
    }

    const newOption = { id: Date.now(), text: '', isCorrect: false };
    updateCurrentQuestion({
      options: [...currentQuestion.options, newOption]
    });
  };

  const deleteOption = (optionId) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.options.length <= 2) {
      return; // Silent fail
    }

    updateCurrentQuestion({
      options: currentQuestion.options.filter(opt => opt.id !== optionId)
    });
  };

  const updateOptionText = (optionId, text) => {
    const currentQuestion = questions[currentQuestionIndex];
    updateCurrentQuestion({
      options: currentQuestion.options.map(opt =>
        opt.id === optionId ? { ...opt, text } : opt
      )
    });
  };

  const toggleCorrectAnswer = (optionId) => {
    const currentQuestion = questions[currentQuestionIndex];

    if (currentQuestion.allowMultipleAnswers) {
      // Multiple answers: toggle this option
      updateCurrentQuestion({
        options: currentQuestion.options.map(opt =>
          opt.id === optionId ? { ...opt, isCorrect: !opt.isCorrect } : opt
        )
      });
    } else {
      // Single answer: set only this option as correct
      updateCurrentQuestion({
        options: currentQuestion.options.map(opt => ({
          ...opt,
          isCorrect: opt.id === optionId
        }))
      });
    }
  };

  // Validation (returns true if valid, false if invalid)
  const validateQuiz = () => {
    if (!quizTitle.trim()) {
      goToStep(STEPS.BASICS);
      setErrors({ title: 'Quiz title is required' });
      return false;
    }

    if (!selectedCategoryId) {
      goToStep(STEPS.BASICS);
      setErrors({ category: 'Category is required' });
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (!q.questionText.trim()) {
        setCurrentQuestionIndex(i);
        goToStep(STEPS.QUESTIONS);
        return false;
      }

      if (!q.points || q.points < 1 || q.points > 100) {
        setCurrentQuestionIndex(i);
        goToStep(STEPS.QUESTIONS);
        return false;
      }

      if (q.options.length < 2) {
        setCurrentQuestionIndex(i);
        goToStep(STEPS.QUESTIONS);
        return false;
      }

      const hasCorrectAnswer = q.options.some(opt => opt.isCorrect);
      if (!hasCorrectAnswer) {
        setCurrentQuestionIndex(i);
        goToStep(STEPS.QUESTIONS);
        return false;
      }

      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          setCurrentQuestionIndex(i);
          goToStep(STEPS.QUESTIONS);
          return false;
        }
      }
    }

    return true;
  };

  // Save quiz (as draft or published)
  const handleSaveQuiz = async (publish = false) => {
    if (!validateQuiz()) return;

    setLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        notify({ title: 'Error', message: 'You must be logged in', type: 'error' });
        return;
      }

      const quizData = {
        title: quizTitle.trim(),
        description: quizDescription.trim() || `A quiz with ${questions.length} questions worth ${totalPoints} points`,
        image: coverImage.trim() || category?.image || '',
        category: selectedCategoryId,
        categorySlug: category?.slug || '',
        isPublic: publish ? isPublic : false, // Only use isPublic setting if publishing
        isDraft: !publish, // If not publishing, it's a draft
        totalPoints,
        totalQuestions: questions.length,
        settings: {
          timeLimit: hasTimeLimit ? timeLimit : null,
          navigationType,
          reviewPermission,
          isPublic: publish ? isPublic : false
        },
        questions: questions.map(q => ({
          questionText: q.questionText.trim(),
          imageUrl: q.imageUrl.trim() || null,
          points: parseInt(q.points) || 10,
          allowMultipleAnswers: q.allowMultipleAnswers,
          options: q.options.map(opt => ({
            text: opt.text.trim(),
            isCorrect: opt.isCorrect
          }))
        })),
        createdBy: userId
      };

      let result;
      if (isEditMode && quizId) {
        result = await updateQuiz(quizId, quizData);
      } else {
        result = await createQuiz(quizData);
      }

      if (result.success) {
        // Clear navigation block since quiz is saved
        setNavigationBlock(false);

        notify({
          title: publish ? 'Quiz Published' : 'Quiz Saved',
          message: `"${quizTitle}" has been ${publish ? 'published' : 'saved as draft'} successfully!`,
          type: 'success'
        });

        if (category) {
          navigate(`/category/${category.slug || category.id}`);
        } else {
          navigate('/main');
        }
      } else {
        notify({
          title: 'Error',
          message: result.error || 'Failed to save quiz',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
      notify({
        title: 'Error',
        message: 'An unexpected error occurred',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] max-w-full">
      <Navbar />

      <main className="flex-1 flex flex-col overflow-hidden max-w-full">
        <div className="flex-shrink-0 py-4 md:py-6 px-4 md:px-8 bg-[#F8FAFC]">
          <DashboardHeader
            toggleDropdown={toggleDropdown}
            showDropdown={showDropdown}
            Avatar={Avatar}
          />
        </div>

        <div className="flex-1 px-4 md:px-8 pb-4 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Step Content */}
            <div className="transition-all duration-300">
              {currentStep === STEPS.BASICS && (
                <BasicsStep
                  categories={allCategories}
                  selectedCategoryId={selectedCategoryId}
                  onSelectCategory={handleCategorySelect}
                  title={quizTitle}
                  setTitle={setQuizTitle}
                  description={quizDescription}
                  setDescription={setQuizDescription}
                  coverImage={coverImage}
                  setCoverImage={setCoverImage}
                  hasTimeLimit={hasTimeLimit}
                  setHasTimeLimit={setHasTimeLimit}
                  timeLimit={timeLimit}
                  setTimeLimit={setTimeLimit}
                  navigationType={navigationType}
                  setNavigationType={setNavigationType}
                  reviewPermission={reviewPermission}
                  setReviewPermission={setReviewPermission}
                  errors={errors}
                  setErrors={setErrors}
                  onNext={goToNextStep}
                  onCancel={() => {
                    if (category) {
                      navigate(`/category/${category.slug || category.id}`);
                    } else {
                      navigate('/main');
                    }
                  }}
                  currentStep={currentStep}
                  category={category}
                  navigate={navigate}
                  badgeState={getBadgeState()}
                />
              )}
              {currentStep === STEPS.QUESTIONS && (
                <QuestionsStep
                  question={currentQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={questions.length}
                  totalPoints={totalPoints}
                  onUpdateText={updateQuestionText}
                  onUpdatePoints={updateQuestionPoints}
                  onUpdateImage={updateQuestionImage}
                  onToggleMultipleAnswers={toggleMultipleAnswers}
                  onAddOption={addOption}
                  onDeleteOption={deleteOption}
                  onUpdateOption={updateOptionText}
                  onToggleCorrect={toggleCorrectAnswer}
                  onDelete={deleteCurrentQuestion}
                  canDelete={questions.length > 1}
                  onPrevious={goToPreviousQuestion}
                  onNext={goToNextQuestion}
                  onAddQuestion={addQuestion}
                  questions={questions}
                  currentIndex={currentQuestionIndex}
                  setCurrentIndex={setCurrentQuestionIndex}
                />
              )}
              {currentStep === STEPS.REVIEW && (
                <ReviewStep
                  quiz={{
                    title: quizTitle,
                    description: quizDescription,
                    category: category?.name,
                    totalQuestions: questions.length,
                    totalPoints,
                    settings: {
                      hasTimeLimit,
                      timeLimit,
                      navigationType,
                      reviewPermission,
                      isPublic
                    },
                    questions
                  }}
                  isPublic={isPublic}
                  setIsPublic={setIsPublic}
                />
              )}
            </div>

            {/* Navigation Footer - Hidden on Step 1 (has its own buttons) */}
            {currentStep !== STEPS.BASICS && (
              <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 py-4 px-6 rounded-t-xl shadow-lg mt-6">
                <div className="flex gap-3">
                  {currentStep > STEPS.BASICS && (
                    <button
                      type="button"
                      onClick={goToPreviousStep}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Previous
                    </button>
                  )}
                  {currentStep < STEPS.REVIEW ? (
                    <button
                      type="button"
                      onClick={goToNextStep}
                      className="flex-1 px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      Next
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSaveQuiz(false)}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : '💾 Save as Draft'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveQuiz(true)}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Publishing...' : '✨ Publish Quiz'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// STEP 1: Quiz Basics - Premium, searchable, with tactile privacy cards
const BasicsStep = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  title,
  setTitle,
  description,
  setDescription,
  coverImage,
  setCoverImage,
  hasTimeLimit,
  setHasTimeLimit,
  timeLimit,
  setTimeLimit,
  navigationType,
  setNavigationType,
  reviewPermission,
  setReviewPermission,
  errors,
  setErrors,
  onNext,
  onCancel,
  currentStep,
  category,
  navigate,
  badgeState
}) => {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');
  const [showExitModal, setShowExitModal] = useState(false);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  // Filter categories based on search
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return title.trim() !== '' || description.trim() !== '' || coverImage !== '' || selectedCategoryId !== '';
  };

  // Handle back navigation with confirmation
  const handleBackClick = () => {
    if (hasUnsavedChanges()) {
      setShowExitModal(true);
    } else {
      if (category) {
        navigate(`/category/${category.slug || category.id}`);
      } else {
        navigate('/main');
      }
    }
  };

  // Confirm exit and discard changes
  const confirmExit = () => {
    setShowExitModal(false);
    if (category) {
      navigate(`/category/${category.slug || category.id}`);
    } else {
      navigate('/main');
    }
  };

  // Validation with visual feedback
  const handleNext = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Quiz title is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Summary and instructions are required';
    }

    if (!selectedCategoryId) {
      newErrors.category = 'Please select a category';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Main Card - Everything Inside */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0]" style={{ overflow: 'visible' }}>
        {/* Header Section Inside Card */}
        <div className="px-10 pt-10 pb-0">
          {/* Top Header Row - Perfect Balance */}
          <div className="flex items-center justify-between w-full mb-5">
            {/* Left: Back Button + Title with Green Dot */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackClick}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5 text-[#64748B]" />
              </button>
              <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
                <span>Quiz Configuration</span>
                <span className="text-[24px] text-[#10B981]">•</span>
              </h2>
            </div>

            {/* Right: Status Badge - Dynamic */}
            <div className="px-3 py-1.5 rounded-full text-[13px] font-semibold uppercase tracking-wide border flex items-center gap-1.5"
              style={{
                backgroundColor: badgeState.bg,
                borderColor: badgeState.border,
                color: badgeState.color
              }}
            >
              <span>{badgeState.icon}</span>
              <span>{badgeState.text}</span>
            </div>
          </div>

          {/* Subtle Border Below Header */}
          <div className="w-full h-px bg-[#F1F5F9] mb-3"></div>

          {/* Wizard Stepper - Isolated with Breathing Room */}
          <div className="py-6 mb-7">
            <div className="flex items-start justify-center gap-4">
              {[
                { num: 1, label: '1. Quiz Basics' },
                { num: 2, label: '2. Building Questions' },
                { num: 3, label: '3. Configure & Publish' }
              ].map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center flex-1 max-w-[140px]">
                    <div
                      className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                        idx === currentStep
                          ? 'bg-[#10B981] text-white shadow-md shadow-emerald-200'
                          : idx < currentStep
                          ? 'bg-[#10B981] text-white'
                          : 'bg-[#94A3B8] text-white'
                      }`}
                    >
                      {idx < currentStep ? '✓' : step.num}
                    </div>
                    {/* Always show label for all steps */}
                    <span
                      className={`text-[13px] mt-2 text-center leading-tight transition-colors ${
                        idx === currentStep
                          ? 'text-[#0F172A] font-semibold'
                          : 'text-[#94A3B8] font-normal'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div className="relative flex-shrink-0" style={{ width: '60px', height: '32px' }}>
                      {/* Perfectly Centered Line - Top 50% of circle height */}
                      <div
                        className={`absolute h-0.5 transition-all ${
                          idx < currentStep
                            ? 'bg-[#10B981]'
                            : idx === currentStep
                            ? 'bg-[#A7F3D0]'
                            : 'bg-[#E2E8F0]'
                        }`}
                        style={{
                          top: '16px', // 50% of 32px circle height
                          left: 0,
                          right: 0
                        }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Clean Divider Below Stepper */}
            <div className="w-full h-px bg-[#E2E8F0] mt-7"></div>
          </div>
        </div>

        {/* Form Fields Section */}
        <div className="px-10 pt-8 pb-10 space-y-6">
          {/* Quiz Title */}
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">
              Quiz Title <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors({ ...errors, title: '' });
              }}
              placeholder="e.g., Cardiology Essentials"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none text-[#0F172A] placeholder-[#94A3B8] transition-all ${
                errors.title
                  ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
                  : 'border-[#E2E8F0] focus:border-[#10B981] focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]'
              }`}
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.title}</p>
            )}
          </div>

          {/* Summary & Instructions */}
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">
              Summary & Instructions <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= 120) {
                    setDescription(e.target.value);
                    setErrors({ ...errors, description: '' });
                  }
                }}
                placeholder="Provide clear instructions and context for quiz takers..."
                rows={3}
                maxLength={120}
                style={{ minHeight: '100px' }}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none text-[#0F172A] placeholder-[#94A3B8] resize-none transition-all ${
                  errors.description
                    ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
                    : 'border-[#E2E8F0] focus:border-[#10B981] focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]'
                }`}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-[#64748B]">Keep it concise and clear</span>
              <span className={`text-xs font-medium ${description.length >= 120 ? 'text-red-500' : 'text-[#64748B]'}`}>
                {description.length}/120
              </span>
            </div>
            {errors.description && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.description}</p>
            )}
          </div>

          {/* Cover Image - Inline Single Row */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-semibold text-[#0F172A]">
                Cover Image
              </label>
              <div className="relative group">
                <svg className="w-4 h-4 text-[#64748B] cursor-pointer hover:text-[#0F172A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute left-0 top-6 z-20 w-64 p-3 bg-[#0F172A] text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <p className="font-semibold mb-1">Recommended Dimensions</p>
                  <p className="text-gray-300">1200 × 630 pixels (16:9 ratio) for optimal display across all devices</p>
                  <div className="absolute -top-1 left-2 w-2 h-2 bg-[#0F172A] transform rotate-45"></div>
                </div>
              </div>
            </div>

            {/* Single Row: Input + Upload Button - Exact 44px Height */}
            <div className="flex items-stretch gap-3">
              <input
                type="url"
                value={coverImage}
                onChange={(e) => {
                  setCoverImage(e.target.value);
                  setImageUploadError('');
                }}
                placeholder="Paste image address (optional)"
                style={{ height: '44px' }}
                className="flex-1 px-4 border border-[#E2E8F0] rounded-lg focus:outline-none text-[14px] text-[#0F172A] placeholder-[#94A3B8] transition-all focus:border-[#10B981] focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] box-border"
              />
              <label className="cursor-pointer flex-shrink-0">
                <div
                  style={{ height: '44px' }}
                  className="px-4 py-0 border border-[#E2E8F0] bg-white rounded-lg hover:border-[#10B981] hover:bg-[#F0FDF4]/30 transition-all flex items-center gap-2 box-border"
                >
                  <svg className="w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-[14px] font-medium text-[#0F172A]">Upload</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Check file size (500KB = 512000 bytes)
                      if (file.size > 512000) {
                        setImageUploadError('Image size must be less than 500KB');
                        return;
                      }
                      setImageUploadError('');

                      // Convert to data URL for preview
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCoverImage(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>

            {/* Error Message */}
            {imageUploadError && (
              <p className="text-xs text-red-600 font-medium mt-2">{imageUploadError}</p>
            )}

            {/* Preview */}
            {coverImage && !imageUploadError && (
              <div className="relative rounded-lg overflow-hidden border border-[#E2E8F0] mt-3">
                <img
                  src={coverImage}
                  alt="Quiz cover preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800';
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImage('');
                    setImageUploadError('');
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Category - Searchable Dropdown */}
          <div className="relative">
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">
              Category <span className="text-[#EF4444]">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setCategorySearchQuery('');
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none text-left flex items-center justify-between bg-white transition-all ${
                errors.category
                  ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
                  : 'border-[#E2E8F0] focus:border-[#10B981] focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]'
              }`}
            >
              <span className={selectedCategory ? 'text-[#0F172A] font-medium' : 'text-[#94A3B8]'}>
                {selectedCategory ? selectedCategory.name : 'Select a category...'}
              </span>
              <svg
                className={`w-5 h-5 text-[#64748B] transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {errors.category && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.category}</p>
            )}

            {showCategoryDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  width: '100%',
                  marginTop: '8px',
                  zIndex: 99,
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.08)'
                }}
              >
                {/* Search Box - Compact */}
                <div style={{ padding: '10px 12px' }} className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={categorySearchQuery}
                      onChange={(e) => setCategorySearchQuery(e.target.value)}
                      placeholder="Search categories..."
                      className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none placeholder-[#94A3B8] transition-all focus:border-[#10B981] focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Category List - Shows 2 Complete Items */}
                <div style={{ maxHeight: '108px', overflowY: 'auto' }}>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          onSelectCategory(cat.id);
                          setShowCategoryDropdown(false);
                          setCategorySearchQuery('');
                          setErrors({ ...errors, category: '' });
                        }}
                        className="w-full text-left flex items-center gap-3 cursor-pointer transition-all"
                        style={{
                          padding: '10px 16px',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#0F172A',
                          backgroundColor: 'transparent',
                          border: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F1F5F9';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-8 h-8 rounded-lg object-cover border border-[#E2E8F0] flex-shrink-0"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=100';
                          }}
                        />
                        <span className="flex-1 text-sm" style={{ fontWeight: 500 }}>{cat.name}</span>
                        {selectedCategoryId === cat.id && (
                          <svg className="w-5 h-5 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-[#64748B] text-sm">
                      No categories found matching "{categorySearchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer Bar - White Canvas with Border */}
        <div className="px-10 py-6 border-t border-[#E2E8F0] bg-white flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-[#E2E8F0] rounded-lg text-[#64748B] font-medium transition-all duration-200 hover:border-[#FCA5A5] hover:text-[#EF4444] hover:bg-[#FEF2F2]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 bg-[#10B981] hover:bg-[#0D9488] text-white font-semibold rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#E2E8F0]">
              <h3 className="text-xl font-bold text-[#0F172A]">Discard Changes?</h3>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <p className="text-[#64748B] leading-relaxed">
                You have unsaved changes in your quiz. If you leave now, all your progress will be lost.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-5 py-2.5 border border-[#E2E8F0] rounded-lg text-[#64748B] font-medium hover:bg-white transition-all"
              >
                Keep Editing
              </button>
              <button
                onClick={confirmExit}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// STEP 2: Questions (with single/multiple answer support)
const QuestionsStep = ({
  question,
  questionNumber,
  totalQuestions,
  totalPoints,
  onUpdateText,
  onUpdatePoints,
  onUpdateImage,
  onToggleMultipleAnswers,
  onAddOption,
  onDeleteOption,
  onUpdateOption,
  onToggleCorrect,
  onDelete,
  canDelete,
  onPrevious,
  onNext,
  onAddQuestion,
  questions,
  currentIndex,
  setCurrentIndex
}) => {
  const [showImageInput, setShowImageInput] = useState(!!question.imageUrl);

  return (
    <div className="space-y-4">
      {/* Header with Total Points Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">
            Question {questionNumber} of {totalQuestions}
          </h2>
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-amber-50 px-3 py-1.5 rounded-lg border-2 border-yellow-200">
            <Star className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-bold text-yellow-700">{totalPoints} pts total</span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
        {/* Question Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900">Q{questionNumber}</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={question.points}
                onChange={(e) => onUpdatePoints(e.target.value)}
                min="1"
                max="100"
                className="w-20 px-3 py-1.5 border-2 border-yellow-300 bg-yellow-50 rounded-lg text-center font-bold text-yellow-700"
              />
              <span className="text-sm text-gray-500">pts</span>
            </div>
          </div>
          {canDelete && (
            <button onClick={onDelete} className="p-2 hover:bg-red-50 text-red-600 rounded-lg">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Question Text */}
        <div className="mb-6">
          <textarea
            value={question.questionText}
            onChange={(e) => onUpdateText(e.target.value)}
            placeholder="What is the primary benefit of crop rotation?"
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] resize-none font-medium"
          />
        </div>

        {/* Image (Optional) */}
        <div className="mb-6">
          {!showImageInput ? (
            <button
              onClick={() => setShowImageInput(true)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#10B981]"
            >
              <ImageIcon className="w-4 h-4" />
              Add Image
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Question Image</label>
                <button
                  onClick={() => {
                    setShowImageInput(false);
                    onUpdateImage('');
                  }}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              <input
                type="url"
                value={question.imageUrl}
                onChange={(e) => onUpdateImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              />
              {question.imageUrl && (
                <img
                  src={question.imageUrl}
                  alt="Question"
                  className="mt-2 w-full h-40 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image';
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* Single/Multiple Answer Toggle */}
        <div className="mb-4 flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <input
            type="checkbox"
            checked={question.allowMultipleAnswers}
            onChange={onToggleMultipleAnswers}
            className="w-4 h-4 text-[#10B981] rounded"
          />
          <span className="text-sm text-blue-900 font-medium">
            {question.allowMultipleAnswers ? 'Multiple Correct Answers (Checkboxes)' : 'Single Correct Answer (Radio)'}
          </span>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-4">
          {question.options.map((option, idx) => (
            <div key={option.id} className="flex items-center gap-3 group">
              <input
                type={question.allowMultipleAnswers ? 'checkbox' : 'radio'}
                name={`question-${question.id}`}
                checked={option.isCorrect}
                onChange={() => onToggleCorrect(option.id)}
                className="w-5 h-5 text-[#10B981] cursor-pointer flex-shrink-0"
              />
              <input
                type="text"
                value={option.text}
                onChange={(e) => onUpdateOption(option.id, e.target.value)}
                placeholder={`Option ${idx + 1}`}
                className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] ${
                  option.isCorrect ? 'border-[#10B981] bg-green-50 font-medium' : 'border-gray-300'
                }`}
              />
              {question.options.length > 2 && (
                <button
                  onClick={() => onDeleteOption(option.id)}
                  className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 text-gray-600 rounded-lg flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {question.options.length < 6 && (
          <button
            onClick={onAddOption}
            className="text-[#10B981] hover:text-[#059669] font-medium text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Option
          </button>
        )}
      </div>

      {/* Question Thumbnails Navigation */}
      <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
        <div className="flex items-center gap-2 overflow-x-auto">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                idx === currentIndex
                  ? 'bg-[#10B981] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Q{idx + 1}
            </button>
          ))}
          <button
            onClick={onAddQuestion}
            className="flex-shrink-0 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:border-[#10B981] hover:text-[#10B981] font-medium text-sm transition-all flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="px-6 py-3 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-lg font-medium disabled:opacity-40"
        >
          ◀ Previous Question
        </button>
        <button
          onClick={onNext}
          disabled={currentIndex === questions.length - 1}
          className="px-6 py-3 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-lg font-medium disabled:opacity-40"
        >
          Next Question ▶
        </button>
      </div>
    </div>
  );
};

// STEP 3: Review & Publish
const ReviewStep = ({ quiz, isPublic, setIsPublic }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Final Polish & Publish</h2>

      <div className="space-y-6">
        {/* Summary */}
        <div className="p-4 border-2 border-gray-200 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-3">{quiz.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{quiz.totalQuestions}</div>
              <div className="text-xs text-blue-600">Questions</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">{quiz.totalPoints}</div>
              <div className="text-xs text-yellow-600">Total Points</div>
            </div>
          </div>
        </div>

        {/* Privacy Setting - Streamlined Toggle */}
        <div className="p-4 border-2 border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-900">
                Make Quiz Public
              </label>
              <div className="relative group">
                <svg className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute left-0 top-6 z-20 w-64 p-3 bg-[#0F172A] text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-normal">
                  <p className="font-semibold mb-1">Privacy Control</p>
                  <p className="text-gray-300">Public quizzes appear in search and category feeds. Private quizzes are only visible to you and invited users.</p>
                  <div className="absolute -top-1 left-2 w-2 h-2 bg-[#0F172A] transform rotate-45"></div>
                </div>
              </div>
            </div>

            {/* Toggle Switch - Active in Step 3 */}
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublic ? 'bg-[#10B981]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {isPublic ? '🌍 Public - Anyone can view and take this quiz' : '🔒 Private - Only visible to you and invited users'}
          </p>
        </div>

        {/* Settings Summary */}
        <div className="p-4 border-2 border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Settings</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Time Limit:</span>
              <span className="font-medium">{quiz.settings.hasTimeLimit ? `${quiz.settings.timeLimit} min` : 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Navigation:</span>
              <span className="font-medium capitalize">{quiz.settings.navigationType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Review:</span>
              <span className="font-medium capitalize">{quiz.settings.reviewPermission.replace('-', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Validation */}
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">✅ Ready to Publish</h3>
          <p className="text-sm text-green-700">All questions validated and ready to go!</p>
        </div>
      </div>
    </div>
  );
};

export default MakeQuiz;
