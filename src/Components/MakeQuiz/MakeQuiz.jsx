import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, ChevronLeft, ChevronRight,
  Image as ImageIcon, Star
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
      type: 'multiple-choice', // NEW: Question type (multiple-choice | short-answer | true-false)
      questionText: '',
      imageUrl: '',
      points: 5, // Changed default from 10 to 5
      explanation: '', // NEW: Optional explanation

      // Multiple Choice fields
      allowMultipleAnswers: false,
      options: [
        { id: Date.now() + 1, text: '', isCorrect: true },
        { id: Date.now() + 2, text: '', isCorrect: false }
      ],

      // Short Answer fields
      correctAnswers: [
        { value: '', isPrimary: true }
      ],
      matchingMode: 'exact-case-insensitive',

      // True/False fields
      correctAnswer: null // true | false | null
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
    const hasContent = (
      quizTitle.trim() !== '' ||
      quizDescription.trim() !== '' ||
      coverImage !== '' ||
      selectedCategoryId !== '' ||
      questions.some(q => q.questionText.trim() !== '' || q.options.some(opt => opt.text.trim() !== ''))
    );

    setNavigationBlock(hasContent);

    // Cleanup: clear navigation block when component unmounts
    return () => {
      setNavigationBlock(false);
    };
  }, [quizTitle, quizDescription, coverImage, selectedCategoryId, questions, setNavigationBlock]);

  // Custom navigation guard using popstate for back/forward
  useEffect(() => {
    const handlePopState = (e) => {
      const hasContent = (
        quizTitle.trim() !== '' ||
        quizDescription.trim() !== '' ||
        coverImage !== '' ||
        selectedCategoryId !== '' ||
        questions.some(q => q.questionText.trim() !== '' || q.options.some(opt => opt.text.trim() !== ''))
      );

      if (hasContent) {
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
              const loadedQuestions = quiz.questions.map((q, idx) => {
                const baseQuestion = {
                  id: Date.now() + idx,
                  type: q.type || 'multiple-choice',
                  questionText: q.questionText || '',
                  imageUrl: q.imageUrl || '',
                  points: q.points || 5,
                  explanation: q.explanation || ''
                };

                // Load type-specific fields
                if (baseQuestion.type === 'multiple-choice') {
                  return {
                    ...baseQuestion,
                    allowMultipleAnswers: q.allowMultipleAnswers || false,
                    options: q.options?.map((opt, optIdx) => ({
                      id: Date.now() + idx * 100 + optIdx,
                      text: opt.text || '',
                      isCorrect: opt.isCorrect || false
                    })) || []
                  };
                } else if (baseQuestion.type === 'short-answer') {
                  return {
                    ...baseQuestion,
                    correctAnswers: q.correctAnswers?.map((a, aIdx) => ({
                      value: a.value || '',
                      isPrimary: a.isPrimary || false
                    })) || [{ value: '', isPrimary: true }],
                    matchingMode: q.matchingMode || 'exact-case-insensitive'
                  };
                } else if (baseQuestion.type === 'true-false') {
                  return {
                    ...baseQuestion,
                    correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : null
                  };
                }

                return baseQuestion;
              });
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
      type: 'multiple-choice',
      questionText: '',
      imageUrl: '',
      points: 5,
      explanation: '',
      allowMultipleAnswers: false,
      options: [
        { id: Date.now() + 1, text: '', isCorrect: true },
        { id: Date.now() + 2, text: '', isCorrect: false }
      ],
      correctAnswers: [
        { value: '', isPrimary: true }
      ],
      matchingMode: 'exact-case-insensitive',
      correctAnswer: null
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
    if (numPoints >= 1 && numPoints <= 10) {
      updateCurrentQuestion({ points: numPoints });
    }
  };

  const updateQuestionExplanation = (explanation) => {
    updateCurrentQuestion({ explanation });
  };

  const updateQuestionType = (type) => {
    const currentQuestion = questions[currentQuestionIndex];

    // Initialize new type with defaults
    const typeDefaults = {
      'multiple-choice': {
        type: 'multiple-choice',
        allowMultipleAnswers: false,
        options: [
          { id: Date.now() + 1, text: '', isCorrect: true },
          { id: Date.now() + 2, text: '', isCorrect: false }
        ]
      },
      'short-answer': {
        type: 'short-answer',
        correctAnswers: [{ value: '', isPrimary: true }],
        matchingMode: 'exact-case-insensitive'
      },
      'true-false': {
        type: 'true-false',
        correctAnswer: null
      }
    };

    // Keep common fields (questionText, points, explanation) and add type-specific defaults
    updateCurrentQuestion({
      ...typeDefaults[type]
    });
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

      // Common validation
      if (!q.questionText.trim()) {
        setCurrentQuestionIndex(i);
        goToStep(STEPS.QUESTIONS);
        return false;
      }

      if (!q.points || q.points < 1 || q.points > 10) {
        setCurrentQuestionIndex(i);
        goToStep(STEPS.QUESTIONS);
        return false;
      }

      // Type-specific validation
      const questionType = q.type || 'multiple-choice';

      if (questionType === 'multiple-choice') {
        // Multiple Choice validation
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
      } else if (questionType === 'short-answer') {
        // Short Answer validation
        const primaryAnswer = q.correctAnswers?.find(a => a.isPrimary);
        if (!primaryAnswer || !primaryAnswer.value.trim()) {
          setCurrentQuestionIndex(i);
          goToStep(STEPS.QUESTIONS);
          return false;
        }
      } else if (questionType === 'true-false') {
        // True/False validation
        if (q.correctAnswer === null || q.correctAnswer === undefined) {
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
        questions: questions.map(q => {
          const baseQuestion = {
            type: q.type || 'multiple-choice',
            questionText: q.questionText.trim(),
            imageUrl: q.imageUrl.trim() || null,
            points: parseInt(q.points) || 5,
            explanation: q.explanation?.trim() || null
          };

          // Add type-specific fields
          if (baseQuestion.type === 'multiple-choice') {
            return {
              ...baseQuestion,
              allowMultipleAnswers: q.allowMultipleAnswers,
              options: q.options.map(opt => ({
                text: opt.text.trim(),
                isCorrect: opt.isCorrect
              }))
            };
          } else if (baseQuestion.type === 'short-answer') {
            return {
              ...baseQuestion,
              correctAnswers: q.correctAnswers.filter(a => a.value.trim()).map(a => ({
                value: a.value.trim(),
                isPrimary: a.isPrimary
              })),
              matchingMode: q.matchingMode
            };
          } else if (baseQuestion.type === 'true-false') {
            return {
              ...baseQuestion,
              correctAnswer: q.correctAnswer
            };
          }

          return baseQuestion;
        }),
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
                  onUpdateExplanation={updateQuestionExplanation}
                  onUpdateType={updateQuestionType}
                  onUpdateQuestion={updateCurrentQuestion}
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
                  onPreviousStep={goToPreviousStep}
                  onNextStep={goToNextStep}
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

            {/* Navigation Footer - Visible only on Step 3 (Review) */}
            {currentStep === STEPS.REVIEW && (
              <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 py-4 px-6 rounded-t-xl shadow-lg mt-6">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>
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
  const [uploadedFileName, setUploadedFileName] = useState(''); // Track uploaded file name
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
          <div className="w-full h-px bg-[#E2E8F0] mb-3"></div>

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
            <div className="w-full h-px bg-[#E2E8F0] mt-6"></div>
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
                type="text"
                value={uploadedFileName || (coverImage && !coverImage.startsWith('data:') ? coverImage : '')}
                onChange={(e) => {
                  const value = e.target.value.trim();

                  // Clear uploaded file name when user types
                  setUploadedFileName('');

                  // Security: Sanitize and validate URL
                  if (value) {
                    try {
                      // Only allow http:// and https:// protocols (blocks javascript:, data:, file:, etc.)
                      const url = new URL(value);
                      if (url.protocol === 'http:' || url.protocol === 'https:') {
                        // Valid HTTP/HTTPS URL - accept it
                        setCoverImage(value);
                        setImageUploadError('');
                      } else {
                        setImageUploadError('Only HTTP/HTTPS URLs are allowed');
                      }
                    } catch (err) {
                      // Invalid URL format - allow typing but show as value
                      setCoverImage(value);
                      setImageUploadError('');
                    }
                  } else {
                    setCoverImage('');
                    setImageUploadError('');
                  }
                }}
                placeholder={uploadedFileName ? "File uploaded" : "Paste image address (optional)"}
                disabled={!!uploadedFileName}
                style={{ height: '44px' }}
                className={`flex-1 px-4 border border-[#E2E8F0] rounded-lg focus:outline-none text-[14px] text-[#0F172A] placeholder-[#94A3B8] transition-all focus:border-[#10B981] focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] box-border ${uploadedFileName ? 'bg-[#F8FAFC] cursor-not-allowed' : ''}`}
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
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Security: Validate file type
                      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                      if (!validTypes.includes(file.type)) {
                        setImageUploadError('Only JPG, PNG, GIF, and WebP images are allowed');
                        return;
                      }

                      // Check file size (500KB = 512000 bytes)
                      if (file.size > 512000) {
                        setImageUploadError('Image size must be less than 500KB');
                        return;
                      }

                      // Validate file name for security (prevent directory traversal)
                      const fileName = file.name;
                      if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
                        setImageUploadError('Invalid file name');
                        return;
                      }

                      setImageUploadError('');

                      // Convert to data URL for preview
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        // Security: Verify result is actually a data URL
                        const result = reader.result;
                        if (typeof result === 'string' && result.startsWith('data:image/')) {
                          setCoverImage(result);
                          setUploadedFileName(fileName); // Show file name instead of data URL
                        } else {
                          setImageUploadError('Invalid image file');
                        }
                      };
                      reader.onerror = () => {
                        setImageUploadError('Failed to read file');
                      };
                      reader.readAsDataURL(file);
                    }
                    // Clear file input to allow re-uploading same file
                    e.target.value = '';
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
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Only show placeholder, don't set error (user can still proceed)
                    e.target.src = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800';
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImage('');
                    setUploadedFileName('');
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
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none text-left flex items-center justify-between bg-white transition-all duration-200 ${
                errors.category
                  ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
                  : showCategoryDropdown
                  ? 'border-[#10B981] shadow-[0_0_0_4px_rgba(16,185,129,0.1)]'
                  : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
              }`}
            >
              <span className={selectedCategory ? 'text-[#0F172A] font-medium' : 'text-[#94A3B8]'}>
                {selectedCategory ? selectedCategory.name : 'Select a category...'}
              </span>
              <svg
                className={`w-5 h-5 text-[#64748B] transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`}
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
                  marginTop: '4px',
                  zIndex: 99,
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box',
                  border: '1px solid #10B981',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.15), 0 4px 6px -4px rgba(16, 185, 129, 0.1)',
                  opacity: 1,
                  transform: 'translateY(0)',
                  transition: 'opacity 150ms ease-out, transform 150ms ease-out'
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

// Tooltip Component with smart positioning
const Tooltip = ({ text, side = 'right' }) => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = React.useRef(null);

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      // Check if tooltip would overflow on right side
      const useLeftSide = side === 'left' || (rect.right + 280 > viewportWidth);

      setPosition({
        top: rect.top + window.scrollY,
        left: useLeftSide ? rect.left + window.scrollX - 272 : rect.right + window.scrollX + 8,
        useLeftSide
      });
    }
    setShow(true);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShow(false)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors ml-1.5"
        aria-label="More information"
      >
        <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </button>
      {show && (
        <div
          className="fixed z-[100] w-64 px-3 py-2 bg-[#1E293B] text-white text-xs leading-relaxed rounded-md shadow-xl pointer-events-none"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            opacity: 1,
            transition: 'opacity 150ms ease-out'
          }}
        >
          {text}
          <div
            className={`absolute top-1.5 w-2 h-2 bg-[#1E293B] transform rotate-45 ${
              position.useLeftSide ? 'right-[-4px]' : 'left-[-4px]'
            }`}
          ></div>
        </div>
      )}
    </div>
  );
};

// Helper function to get type label (NO EMOJIS)
const getTypeLabel = (question) => {
  const type = question.type || 'multiple-choice';

  if (type === 'multiple-choice') {
    return question.allowMultipleAnswers ? 'Multiple choice' : 'Single choice';
  } else if (type === 'short-answer') {
    return 'Short answer';
  } else if (type === 'true-false') {
    return 'True or false';
  }

  return 'Single choice';
};

// Helper function to check if question has content
const checkQuestionHasContent = (question) => {
  if (question.questionText.trim()) return true;

  const type = question.type || 'multiple-choice';

  if (type === 'multiple-choice') {
    return question.options?.some(opt => opt.text.trim());
  } else if (type === 'short-answer') {
    return question.correctAnswers?.some(a => a.value.trim());
  } else if (type === 'true-false') {
    return question.correctAnswer !== null;
  }

  return false;
};

// STEP 2: Questions (with polymorphic question types)
const QuestionsStep = ({
  question,
  questionNumber,
  totalQuestions,
  totalPoints,
  onUpdateText,
  onUpdatePoints,
  onUpdateImage,
  onUpdateExplanation,
  onUpdateType,
  onUpdateQuestion,
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
  setCurrentIndex,
  onPreviousStep,
  onNextStep
}) => {
  const [showImageInput, setShowImageInput] = useState(!!question.imageUrl);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showTypeSwitchModal, setShowTypeSwitchModal] = useState(false);
  const [pendingType, setPendingType] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'settings' | 'media'

  // Detect scroll for sticky shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTypeChange = (newType) => {
    if (newType === question.type) {
      setShowTypeDropdown(false);
      return;
    }

    const hasContent = checkQuestionHasContent(question);

    if (hasContent) {
      setPendingType(newType);
      setShowTypeSwitchModal(true);
      setShowTypeDropdown(false);
    } else {
      onUpdateType(newType);
      setShowTypeDropdown(false);
    }
  };

  const confirmTypeSwitch = () => {
    onUpdateType(pendingType);
    setShowTypeSwitchModal(false);
    setPendingType(null);
  };

  // Get badge state
  const badgeState = {
    icon: '✏️',
    text: 'Draft',
    bg: 'rgba(254, 243, 199, 0.6)',
    border: 'rgba(217, 119, 6, 0.15)',
    color: '#D97706'
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Global Top Shell - Matches Step 1 Exactly */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] mb-4">
        <div className="px-10 py-4">
          <div className="flex items-center justify-between w-full">
            {/* Left: Back Button Only */}
            <button
              onClick={onPreviousStep}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#64748B]" />
            </button>

            {/* Right: Draft Badge Only */}
            <div
              className="px-3 py-1.5 rounded-full text-[13px] font-semibold uppercase tracking-wide border flex items-center gap-1.5"
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
        </div>
      </div>

      {/* Wizard Stepper - Inside Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] mb-4">
        <div className="px-10 pt-6 pb-0">
          <div className="py-6 mb-0">
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
                        idx === 1
                          ? 'bg-[#10B981] text-white shadow-md shadow-emerald-200'
                          : idx < 1
                          ? 'bg-[#10B981] text-white'
                          : 'bg-[#94A3B8] text-white'
                      }`}
                    >
                      {idx < 1 ? '✓' : step.num}
                    </div>
                    <span
                      className={`text-[13px] mt-2 text-center leading-tight transition-colors ${
                        idx === 1
                          ? 'text-[#0F172A] font-semibold'
                          : 'text-[#94A3B8] font-normal'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div className="relative flex-shrink-0" style={{ width: '60px', height: '32px' }}>
                      <div
                        className={`absolute h-0.5 transition-all ${
                          idx < 1
                            ? 'bg-[#10B981]'
                            : idx === 1
                            ? 'bg-[#A7F3D0]'
                            : 'bg-[#E2E8F0]'
                        }`}
                        style={{
                          top: '16px',
                          left: 0,
                          right: 0
                        }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="w-full h-px bg-[#E2E8F0] mt-6"></div>
          </div>
        </div>
      </div>

      {/* Unified Sticky Question Navigator Bar */}
      <div className={`sticky top-0 z-40 bg-[#F8FAFC] pb-3 transition-shadow duration-200 ${isScrolled ? 'shadow-md' : ''}`}>
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Left: Question Pills + Add Button */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    idx === currentIndex
                      ? 'bg-[#10B981] text-white shadow-sm'
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

            {/* Right: Delete Question Button */}
            {canDelete && (
              <button
                onClick={onDelete}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#64748B] hover:text-[#EF4444] hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete question</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">

        {/* Question Context Header */}
        <div className="px-10 pt-6 pb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-[#0F172A]">
              Question {questionNumber} of {totalQuestions}
            </h2>
            <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-gray-200">
              <Star className="w-4 h-4 text-[#10B981]" />
              <span className="text-sm font-semibold text-gray-700">{totalPoints} pts total</span>
            </div>
          </div>
        </div>

        {/* Question Type Gateway - Always Visible Above Tabs */}
        <div className="px-8 pt-6 pb-4">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <span>Question type <span className="text-red-500">*</span></span>
              <Tooltip text="Select Single choice for one correct answer, Multiple choice for multi-answer checkbox evaluation, Short answer for text string matching, or True or false for binary statements." />
            </label>
            <button
              type="button"
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none text-left flex items-center justify-between bg-white transition-all duration-200 ${
                showTypeDropdown
                  ? 'border-[#10B981] ring-4 ring-[#10B981]/10'
                  : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
              }`}
            >
              <span className="text-[#0F172A] font-medium text-sm">
                {getTypeLabel(question)}
              </span>
              <svg
                className={`w-5 h-5 text-[#64748B] transition-transform duration-200 ${showTypeDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showTypeDropdown && (
              <div
                className="absolute top-full left-0 right-0 w-full mt-1 z-50 bg-white border border-[#10B981] rounded-lg shadow-lg overflow-hidden"
                style={{
                  boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.15), 0 4px 6px -4px rgba(16, 185, 129, 0.1)'
                }}
              >
                {[
                  { type: 'single-choice', label: 'Single choice', allowMultiple: false },
                  { type: 'multiple-choice', label: 'Multiple choice', allowMultiple: true },
                  { type: 'short-answer', label: 'Short answer' },
                  { type: 'true-false', label: 'True or false' }
                ].map(({ type, label, allowMultiple }) => {
                  const isCurrent =
                    type === 'single-choice' ? ((question.type || 'multiple-choice') === 'multiple-choice' && !question.allowMultipleAnswers) :
                    type === 'multiple-choice' ? ((question.type || 'multiple-choice') === 'multiple-choice' && question.allowMultipleAnswers) :
                    (question.type === type);

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        if (type === 'single-choice' || type === 'multiple-choice') {
                          if ((question.type || 'multiple-choice') !== 'multiple-choice') {
                            handleTypeChange('multiple-choice');
                          }
                          onUpdateQuestion({ ...question, type: 'multiple-choice', allowMultipleAnswers: allowMultiple });
                        } else {
                          handleTypeChange(type);
                        }
                        setShowTypeDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors text-sm ${
                        isCurrent
                          ? 'bg-[#F0FDF4] text-[#0F172A] font-medium'
                          : 'hover:bg-[#F1F5F9] text-[#0F172A]'
                      }`}
                    >
                      <span className="flex-1">{label}</span>
                      {isCurrent && (
                        <svg className="w-5 h-5 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Premium Tabbed Navigation Bar - Modern Underline Slate */}
        <div className="px-8 pb-0 border-b border-[#E2E8F0] bg-transparent">
          <div className="flex gap-8 px-1">
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`pb-3 -mb-px text-sm font-semibold transition-colors duration-200 relative flex items-center gap-2 ${
                activeTab === 'content'
                  ? 'text-[#0F172A] border-b-2 border-[#10B981]'
                  : 'text-[#64748B] hover:text-[#334155]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Content Builder
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`pb-3 -mb-px text-sm font-semibold transition-colors duration-200 relative flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'text-[#0F172A] border-b-2 border-[#10B981]'
                  : 'text-[#64748B] hover:text-[#334155]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Scoring & Extras
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className={`pb-3 -mb-px text-sm font-semibold transition-colors duration-200 relative flex items-center gap-2 ${
                activeTab === 'media'
                  ? 'text-[#0F172A] border-b-2 border-[#10B981]'
                  : 'text-[#64748B] hover:text-[#334155]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Media Cover
            </button>
          </div>
        </div>

        {/* Tab Content - Full Width */}
        <div className="p-8">

          {/* TAB 1: Content Builder */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Question Text with Embedded Counter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Question text <span className="text-red-500">*</span>
                </label>
                <div className="relative w-full">
                  <textarea
                    value={question.questionText}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) {
                        onUpdateText(e.target.value);
                      }
                    }}
                    placeholder="Type your question here..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 pb-8 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-4 focus:ring-[#10B981]/10 focus:border-[#10B981] resize-none text-sm"
                  />
                  <span className={`absolute bottom-2 right-3 text-[11px] font-mono pointer-events-none select-none ${
                    question.questionText.length >= 500 ? 'text-red-500' : 'text-[#94A3B8]'
                  }`}>
                    {question.questionText.length}/500
                  </span>
                </div>
              </div>

              {/* Polymorphic Answer Canvas */}
              <AnswerCanvas
                question={question}
                onUpdateQuestion={onUpdateQuestion}
                onToggleMultipleAnswers={onToggleMultipleAnswers}
                onAddOption={onAddOption}
                onDeleteOption={onDeleteOption}
                onUpdateOption={onUpdateOption}
                onToggleCorrect={onToggleCorrect}
              />
            </div>
          )}

          {/* TAB 2: Scoring & Extras */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Points Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <span>Points <span className="text-red-500">*</span></span>
                  <Tooltip text="The baseline point value awarded to a user for identifying the absolute correct answer pattern for this question. Values are restricted between 1 and 10 points." />
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={question.points}
                    onChange={(e) => onUpdatePoints(e.target.value)}
                    min="1"
                    max="10"
                    className="w-24 px-3 py-3 border border-[#E2E8F0] bg-white rounded-lg text-center font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#10B981]/10 focus:border-[#10B981]"
                  />
                  <span className="text-sm text-gray-500 font-medium">pts</span>
                </div>
              </div>

              {/* Explanation with Embedded Counter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Explanation (optional)
                </label>
                <div className="relative w-full">
                  <textarea
                    value={question.explanation || ''}
                    onChange={(e) => {
                      if (e.target.value.length <= 300) {
                        onUpdateExplanation(e.target.value);
                      }
                    }}
                    placeholder="Type answer rationale..."
                    rows={4}
                    maxLength={300}
                    className="w-full px-4 py-3 pb-8 border border-[#E2E8F0] rounded-lg bg-white focus:outline-none focus:ring-4 focus:ring-[#10B981]/10 focus:border-[#10B981] resize-vertical text-sm"
                    style={{ minHeight: '100px' }}
                  />
                  <span className={`absolute bottom-2 right-3 text-[11px] font-mono pointer-events-none select-none ${
                    (question.explanation?.length || 0) >= 300 ? 'text-red-500' : 'text-[#94A3B8]'
                  }`}>
                    {question.explanation?.length || 0}/300
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Media Cover */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <span>Media cover</span>
                <Tooltip text="Attach an optional visual graphic prompt to the question stem. Supports PNG or JPG formats up to a maximum file capacity size of 5MB." />
              </label>

              {!showImageInput ? (
                <button
                  type="button"
                  onClick={() => setShowImageInput(true)}
                  className="w-full h-40 border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] rounded-lg flex flex-col items-center justify-center text-gray-600 hover:border-[#10B981] hover:text-[#10B981] hover:bg-[#F0FDF4]/30 transition-all"
                >
                  <ImageIcon className="w-12 h-12 mb-3 text-gray-400" />
                  <span className="text-sm font-medium">Click to upload image</span>
                  <span className="text-xs text-gray-400 mt-1">PNG or JPG, max 5MB</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowImageInput(false);
                        onUpdateImage('');
                      }}
                      className="text-xs text-red-600 hover:text-red-700 transition-colors font-medium"
                    >
                      Remove Image
                    </button>
                  </div>
                  <input
                    type="url"
                    value={question.imageUrl}
                    onChange={(e) => onUpdateImage(e.target.value)}
                    placeholder="Paste image URL..."
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-4 focus:ring-[#10B981]/10 focus:border-[#10B981] bg-white text-sm"
                  />
                  {question.imageUrl && (
                    <img
                      src={question.imageUrl}
                      alt="Media preview"
                      className="w-full h-48 object-cover rounded-lg border border-[#E2E8F0]"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/800x300?text=Invalid+Image';
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Navigation Footer - Integrated Inside Card (Wizard Step Navigation) */}
        <div className="border-t border-[#E2E8F0] bg-white px-10 py-6 rounded-b-2xl">
          <div className="flex items-center justify-between">
            {/* Left: Previous Step (Back to Quiz Basics) */}
            <button
              onClick={onPreviousStep}
              className="px-5 py-2.5 border border-[#E2E8F0] rounded-lg text-[#64748B] font-medium transition-all duration-200 hover:border-[#CBD5E1] hover:bg-[#F8FAFC] flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {/* Right: Next Step (Go to Review) */}
            <button
              onClick={onNextStep}
              className="px-6 py-2.5 bg-[#10B981] hover:bg-[#0D9488] text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Type Switch Confirmation Modal */}
      {showTypeSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#E2E8F0]">
              <h3 className="text-xl font-bold text-[#0F172A]">Switch Question Type?</h3>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <p className="text-[#64748B] leading-relaxed">
                Changing the question format alters the backend data model structure. To prevent losing your current question options, please verify your choice before proceeding.
              </p>
              <p className="text-[#64748B] leading-relaxed mt-3">
                Your question text, points, and explanation will be preserved.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowTypeSwitchModal(false);
                  setPendingType(null);
                }}
                className="px-5 py-2.5 border border-[#E2E8F0] rounded-lg text-[#64748B] font-medium hover:bg-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmTypeSwitch}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all"
              >
                Switch Type
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Answer Canvas - Polymorphic renderer based on question type
const AnswerCanvas = ({
  question,
  onUpdateQuestion,
  onToggleMultipleAnswers,
  onAddOption,
  onDeleteOption,
  onUpdateOption,
  onToggleCorrect
}) => {
  const questionType = question.type || 'multiple-choice';

  return (
    <div className="mb-6 transition-all duration-200 ease-out">
      {questionType === 'multiple-choice' && (
        <MultipleChoiceCanvas
          question={question}
          onToggleMultipleAnswers={onToggleMultipleAnswers}
          onAddOption={onAddOption}
          onDeleteOption={onDeleteOption}
          onUpdateOption={onUpdateOption}
          onToggleCorrect={onToggleCorrect}
        />
      )}
      {questionType === 'short-answer' && (
        <ShortAnswerCanvas
          question={question}
          onUpdateQuestion={onUpdateQuestion}
        />
      )}
      {questionType === 'true-false' && (
        <TrueFalseCanvas
          question={question}
          onUpdateQuestion={onUpdateQuestion}
        />
      )}
    </div>
  );
};

// Multiple Choice Canvas Component
const MultipleChoiceCanvas = ({
  question,
  onToggleMultipleAnswers,
  onAddOption,
  onDeleteOption,
  onUpdateOption,
  onToggleCorrect
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Answer options <span className="text-red-500">*</span>
      </label>

      {/* Options List */}
      <div className="space-y-3 mb-4">
        {question.options?.map((option, idx) => (
          <div key={option.id} className="flex items-start gap-3 group">
            {/* Correct Answer Toggle */}
            <input
              type={question.allowMultipleAnswers ? 'checkbox' : 'radio'}
              name={`question-${question.id}`}
              checked={option.isCorrect}
              onChange={() => onToggleCorrect(option.id)}
              className="w-5 h-5 mt-3 text-[#10B981] cursor-pointer flex-shrink-0"
            />

            {/* Option Text Input with Embedded Counter */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={option.text}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    onUpdateOption(option.id, e.target.value);
                  }
                }}
                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                maxLength={200}
                className={`w-full px-4 py-3 pr-16 border rounded-lg focus:outline-none focus:ring-4 focus:ring-[#10B981]/10 transition-all text-sm ${
                  option.isCorrect ? 'border-[#10B981] bg-green-50 font-medium' : 'border-[#E2E8F0]'
                }`}
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono pointer-events-none select-none ${
                option.text.length >= 200 ? 'text-red-500' : 'text-[#94A3B8]'
              }`}>
                {option.text.length}/200
              </span>
            </div>

            {/* Delete Button (shows on hover, min 2 options) */}
            {question.options.length > 2 && (
              <button
                onClick={() => onDeleteOption(option.id)}
                className="p-2 mt-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-600 rounded-lg transition-all flex-shrink-0"
                title="Delete option"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Option Button */}
      {question.options?.length < 6 && (
        <button
          onClick={onAddOption}
          className="text-[#10B981] hover:text-[#059669] font-medium text-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Option (max 6)
        </button>
      )}
    </div>
  );
};

// Short Answer Canvas Component
const ShortAnswerCanvas = ({ question, onUpdateQuestion }) => {
  const primaryAnswer = question.correctAnswers?.find(a => a.isPrimary)?.value || '';
  const alternativeAnswers = question.correctAnswers?.filter(a => !a.isPrimary) || [];

  const updatePrimaryAnswer = (value) => {
    const newAnswers = [
      { value, isPrimary: true },
      ...alternativeAnswers
    ];
    onUpdateQuestion({ ...question, correctAnswers: newAnswers });
  };

  const addAlternativeAnswer = () => {
    if (alternativeAnswers.length >= 5) return;

    const newAnswers = [
      { value: primaryAnswer, isPrimary: true },
      ...alternativeAnswers,
      { value: '', isPrimary: false }
    ];
    onUpdateQuestion({ ...question, correctAnswers: newAnswers });
  };

  const updateAlternativeAnswer = (index, value) => {
    const newAlternatives = [...alternativeAnswers];
    newAlternatives[index] = { value, isPrimary: false };

    const newAnswers = [
      { value: primaryAnswer, isPrimary: true },
      ...newAlternatives
    ];
    onUpdateQuestion({ ...question, correctAnswers: newAnswers });
  };

  const deleteAlternativeAnswer = (index) => {
    const newAlternatives = alternativeAnswers.filter((_, i) => i !== index);
    const newAnswers = [
      { value: primaryAnswer, isPrimary: true },
      ...newAlternatives
    ];
    onUpdateQuestion({ ...question, correctAnswers: newAnswers });
  };

  const updateMatchingMode = (mode) => {
    onUpdateQuestion({ ...question, matchingMode: mode });
  };

  return (
    <div>
      {/* Primary Answer */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Correct answer <span className="text-red-500">*</span>
        </label>
        <div className="relative w-full">
          <input
            type="text"
            value={primaryAnswer}
            onChange={(e) => {
              if (e.target.value.length <= 100) {
                updatePrimaryAnswer(e.target.value);
              }
            }}
            placeholder="e.g., mitochondria"
            maxLength={100}
            className="w-full px-4 py-3 pr-16 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-4 focus:ring-[#10B981]/10 focus:border-[#10B981] text-sm"
          />
          <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono pointer-events-none select-none ${
            primaryAnswer.length >= 100 ? 'text-red-500' : 'text-[#94A3B8]'
          }`}>
            {primaryAnswer.length}/100
          </span>
        </div>
      </div>

      {/* Alternative Answers */}
      {alternativeAnswers.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Alternative answers (optional)
          </label>
          <div className="space-y-2">
            {alternativeAnswers.map((answer, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={answer.value}
                    onChange={(e) => {
                      if (e.target.value.length <= 100) {
                        updateAlternativeAnswer(idx, e.target.value);
                      }
                    }}
                    placeholder={`Alternative ${idx + 1}`}
                    maxLength={100}
                    className="w-full px-4 py-2.5 pr-16 border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg focus:outline-none focus:ring-4 focus:ring-[#10B981]/10 focus:border-[#10B981] text-sm"
                  />
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono pointer-events-none select-none ${
                    answer.value.length >= 100 ? 'text-red-500' : 'text-[#94A3B8]'
                  }`}>
                    {answer.value.length}/100
                  </span>
                </div>
                <button
                  onClick={() => deleteAlternativeAnswer(idx)}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  title="Delete alternative"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Alternative Button */}
      {alternativeAnswers.length < 5 && (
        <button
          onClick={addAlternativeAnswer}
          className="text-[#10B981] hover:text-[#059669] font-medium text-sm flex items-center gap-2 mb-4 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Alternative Answer
        </button>
      )}

      {/* Matching Mode */}
      <div className="p-4 bg-[#F8FAFC] border border-gray-200 rounded-lg">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Matching mode
        </label>
        <div className="space-y-2">
          {[
            { value: 'exact-case-insensitive', label: 'Exact match (case-insensitive)', description: 'Default - "Mitochondria" matches "mitochondria"' },
            { value: 'contains', label: 'Contains keyword', description: 'Matches if answer contains the keyword' },
            { value: 'exact-case-sensitive', label: 'Exact match (case-sensitive)', description: 'Strict - "Mitochondria" does NOT match "mitochondria"' }
          ].map(({ value, label, description }) => (
            <div key={value} className="flex items-start gap-3">
              <input
                type="radio"
                name={`matching-mode-${question.id}`}
                value={value}
                checked={question.matchingMode === value}
                onChange={() => updateMatchingMode(value)}
                className="w-4 h-4 mt-0.5 text-[#10B981] cursor-pointer"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 cursor-pointer" onClick={() => updateMatchingMode(value)}>
                  {label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// True/False Canvas Component
const TrueFalseCanvas = ({ question, onUpdateQuestion }) => {
  const selectAnswer = (value) => {
    onUpdateQuestion({ ...question, correctAnswer: value });
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Select the correct answer <span className="text-red-500">*</span>
      </label>

      <div className="grid grid-cols-2 gap-4">
        {/* TRUE Card */}
        <button
          type="button"
          onClick={() => selectAnswer(true)}
          className={`h-32 flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-200 ${
            question.correctAnswer === true
              ? 'border-[#10B981] bg-[#F0FDF4] text-[#0F172A] font-bold shadow-md'
              : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
          }`}
        >
          <span className="text-4xl mb-2">
            {question.correctAnswer === true ? '✓' : '⭕'}
          </span>
          <span className="text-lg font-semibold">TRUE</span>
        </button>

        {/* FALSE Card */}
        <button
          type="button"
          onClick={() => selectAnswer(false)}
          className={`h-32 flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-200 ${
            question.correctAnswer === false
              ? 'border-[#10B981] bg-[#F0FDF4] text-[#0F172A] font-bold shadow-md'
              : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
          }`}
        >
          <span className="text-4xl mb-2">
            {question.correctAnswer === false ? '✓' : '❌'}
          </span>
          <span className="text-lg font-semibold">FALSE</span>
        </button>
      </div>

      {/* Validation Hint */}
      {question.correctAnswer === null && (
        <p className="text-xs text-gray-500 mt-2 italic">
          Click on the correct answer to select it
        </p>
      )}
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
