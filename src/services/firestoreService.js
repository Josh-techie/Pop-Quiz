import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../firebase";

// ==================== CATEGORIES ====================

/**
 * Create a new category
 */
export const createCategory = async (categoryData) => {
  try {
    const docRef = await addDoc(collection(db, "categories"), {
      ...categoryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all public categories + user's private categories
 */
export const getCategories = async (userId = null) => {
  try {
    let q;
    if (userId) {
      // Get public categories OR user's own categories
      q = query(
        collection(db, "categories"),
        where("isPublic", "==", true)
      );
    } else {
      // Get only public categories (for non-authenticated users)
      q = query(
        collection(db, "categories"),
        where("isPublic", "==", true)
      );
    }

    const querySnapshot = await getDocs(q);
    const categories = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });

    // Also get user's private categories if userId is provided
    if (userId) {
      const privateQuery = query(
        collection(db, "categories"),
        where("createdBy", "==", userId),
        where("isPublic", "==", false)
      );
      const privateSnapshot = await getDocs(privateQuery);
      privateSnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() });
      });
    }

    return { success: true, data: categories };
  } catch (error) {
    console.error("Error getting categories:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get a single category by ID
 */
export const getCategoryById = async (categoryId) => {
  try {
    const docRef = doc(db, "categories", categoryId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: "Category not found" };
    }
  } catch (error) {
    console.error("Error getting category:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update a category
 */
export const updateCategory = async (categoryId, updates) => {
  try {
    const docRef = doc(db, "categories", categoryId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (categoryId) => {
  try {
    await deleteDoc(doc(db, "categories", categoryId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message };
  }
};

// ==================== QUIZZES ====================

/**
 * Create a new quiz
 */
export const createQuiz = async (quizData) => {
  try {
    const docRef = await addDoc(collection(db, "quizzes"), {
      ...quizData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      stats: {
        views: 0,
        attempts: 0,
        totalScore: 0,
        averageScore: 0,
      },
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating quiz:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get quizzes by category
 */
export const getQuizzesByCategory = async (categoryId, userId = null) => {
  try {
    let q;
    if (userId) {
      // Get public quizzes OR user's own quizzes in this category
      q = query(
        collection(db, "quizzes"),
        where("category", "==", categoryId),
        orderBy("createdAt", "desc")
      );
    } else {
      // Get only public quizzes
      q = query(
        collection(db, "quizzes"),
        where("category", "==", categoryId),
        where("isPublic", "==", true),
        orderBy("createdAt", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    const quizzes = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Filter to show only public quizzes or user's own quizzes
      if (data.isPublic || (userId && data.createdBy === userId)) {
        quizzes.push({ id: doc.id, ...data });
      }
    });

    return { success: true, data: quizzes };
  } catch (error) {
    console.error("Error getting quizzes:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get a single quiz by ID
 */
export const getQuizById = async (quizId) => {
  try {
    const docRef = doc(db, "quizzes", quizId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Increment view count
      await updateDoc(docRef, {
        "stats.views": increment(1),
      });

      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: "Quiz not found" };
    }
  } catch (error) {
    console.error("Error getting quiz:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get quizzes created by a specific user
 */
export const getQuizzesByUser = async (userId) => {
  try {
    const q = query(
      collection(db, "quizzes"),
      where("createdBy", "==", userId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const quizzes = [];
    querySnapshot.forEach((doc) => {
      quizzes.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: quizzes };
  } catch (error) {
    console.error("Error getting user quizzes:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update a quiz
 */
export const updateQuiz = async (quizId, updates) => {
  try {
    const docRef = doc(db, "quizzes", quizId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating quiz:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a quiz
 */
export const deleteQuiz = async (quizId) => {
  try {
    await deleteDoc(doc(db, "quizzes", quizId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update quiz statistics after completion
 */
export const updateQuizStats = async (quizId, score) => {
  try {
    const docRef = doc(db, "quizzes", quizId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentStats = docSnap.data().stats;
      const newAttempts = currentStats.attempts + 1;
      const newTotalScore = currentStats.totalScore + score;
      const newAverageScore = newTotalScore / newAttempts;

      await updateDoc(docRef, {
        "stats.attempts": increment(1),
        "stats.totalScore": increment(score),
        "stats.averageScore": newAverageScore,
      });

      return { success: true };
    } else {
      return { success: false, error: "Quiz not found" };
    }
  } catch (error) {
    console.error("Error updating quiz stats:", error);
    return { success: false, error: error.message };
  }
};

// ==================== USER QUIZ ATTEMPTS ====================

/**
 * Save a quiz attempt
 */
export const saveQuizAttempt = async (attemptData) => {
  try {
    const docRef = await addDoc(collection(db, "quizAttempts"), {
      ...attemptData,
      completedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving quiz attempt:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user's quiz attempts
 */
export const getUserQuizAttempts = async (userId, quizId = null) => {
  try {
    let q;
    if (quizId) {
      // Get attempts for a specific quiz
      q = query(
        collection(db, "quizAttempts"),
        where("userId", "==", userId),
        where("quizId", "==", quizId),
        orderBy("completedAt", "desc")
      );
    } else {
      // Get all attempts by user
      q = query(
        collection(db, "quizAttempts"),
        where("userId", "==", userId),
        orderBy("completedAt", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    const attempts = [];
    querySnapshot.forEach((doc) => {
      attempts.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: attempts };
  } catch (error) {
    console.error("Error getting quiz attempts:", error);
    return { success: false, error: error.message };
  }
};

// ==================== LEADERBOARD ====================

/**
 * Get leaderboard for a specific quiz
 */
export const getQuizLeaderboard = async (quizId, limitCount = 10) => {
  try {
    const q = query(
      collection(db, "quizAttempts"),
      where("quizId", "==", quizId),
      orderBy("score", "desc"),
      orderBy("timeSpent", "asc"), // If scores are equal, faster time wins
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const leaderboard = [];
    querySnapshot.forEach((doc) => {
      leaderboard.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: leaderboard };
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get global leaderboard (top performers across all quizzes)
 */
export const getGlobalLeaderboard = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, "quizAttempts"),
      orderBy("score", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const leaderboard = [];
    querySnapshot.forEach((doc) => {
      leaderboard.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: leaderboard };
  } catch (error) {
    console.error("Error getting global leaderboard:", error);
    return { success: false, error: error.message };
  }
};

// ==================== USER PROFILE ====================

/**
 * Create or update user profile
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, {
      ...profileData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    // If document doesn't exist, create it
    try {
      await addDoc(collection(db, "users"), {
        userId,
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (createError) {
      console.error("Error creating user profile:", createError);
      return { success: false, error: createError.message };
    }
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: "User profile not found" };
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { success: false, error: error.message };
  }
};

// ==================== SEARCH ====================

/**
 * Search quizzes by title
 */
export const searchQuizzes = async (searchTerm) => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple implementation. For production, consider using Algolia or similar
    const q = query(
      collection(db, "quizzes"),
      where("isPublic", "==", true),
      orderBy("title")
    );

    const querySnapshot = await getDocs(q);
    const quizzes = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Filter by search term (case-insensitive)
      if (
        data.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        quizzes.push({ id: doc.id, ...data });
      }
    });

    return { success: true, data: quizzes };
  } catch (error) {
    console.error("Error searching quizzes:", error);
    return { success: false, error: error.message };
  }
};
