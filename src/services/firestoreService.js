import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
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
 * Get all categories (all categories are now visible to everyone)
 */
export const getCategories = async (userId = null) => {
  try {
    // Get all categories - no filtering by isPublic anymore
    const querySnapshot = await getDocs(collection(db, "categories"));
    const categories = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });

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

/**
 * Get user stats (streak, quizzes completed, total points)
 */
export const getUserStats = async (userId) => {
  try {
    // Get user attempts
    const attemptsQuery = query(
      collection(db, "quizAttempts"),
      where("userId", "==", userId),
      orderBy("completedAt", "desc")
    );

    const attemptsSnapshot = await getDocs(attemptsQuery);
    const attempts = [];
    attemptsSnapshot.forEach((doc) => {
      attempts.push({ id: doc.id, ...doc.data() });
    });

    // Calculate total points
    const totalPoints = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);

    // Calculate streak (consecutive days)
    let streak = 0;
    if (attempts.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const attemptDates = attempts.map(attempt => {
        const date = attempt.completedAt?.toDate() || new Date(attempt.completedAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      });

      // Get unique dates (remove duplicates from same day)
      const uniqueDates = [...new Set(attemptDates)].sort((a, b) => b - a);

      // Check if streak is still active (today or yesterday)
      const dayInMs = 24 * 60 * 60 * 1000;
      const todayMs = today.getTime();
      const yesterdayMs = todayMs - dayInMs;

      if (uniqueDates[0] === todayMs || uniqueDates[0] === yesterdayMs) {
        streak = 1;
        let currentDate = uniqueDates[0];

        for (let i = 1; i < uniqueDates.length; i++) {
          const expectedPrevDay = currentDate - dayInMs;
          if (uniqueDates[i] === expectedPrevDay) {
            streak++;
            currentDate = uniqueDates[i];
          } else {
            break;
          }
        }
      }
    }

    return {
      success: true,
      data: {
        streak,
        quizzesCompleted: attempts.length,
        totalPoints,
      },
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return {
      success: false,
      error: error.message,
      data: { streak: 0, quizzesCompleted: 0, totalPoints: 0 }
    };
  }
};

/**
 * Check if username is available (unique)
 */
export const checkUsernameAvailability = async (username) => {
  try {
    const q = query(
      collection(db, "users"),
      where("username", "==", username.toLowerCase())
    );
    const querySnapshot = await getDocs(q);
    return { success: true, available: querySnapshot.empty };
  } catch (error) {
    console.error("Error checking username:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Create user profile with username (for new signups)
 */
export const createUserProfile = async (userId, { username, email, displayName = null }) => {
  try {
    // Check if username is available
    const usernameCheck = await checkUsernameAvailability(username);
    if (!usernameCheck.success) {
      return { success: false, error: "Failed to validate username" };
    }
    if (!usernameCheck.available) {
      return { success: false, error: "Username already taken" };
    }

    // Create user document with userId as document ID
    await updateDoc(doc(db, "users", userId), {
      userId,
      username: username.toLowerCase(),
      displayName: displayName || username,
      email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    // If document doesn't exist, use setDoc instead
    try {
      const { setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "users", userId), {
        userId,
        username: username.toLowerCase(),
        displayName: displayName || username,
        email,
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
 * Get user by username (for login with username)
 */
export const getUserByUsername = async (username) => {
  try {
    const q = query(
      collection(db, "users"),
      where("username", "==", username.toLowerCase())
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: "User not found" };
    }

    const userDoc = querySnapshot.docs[0];
    return {
      success: true,
      data: { id: userDoc.id, ...userDoc.data() }
    };
  } catch (error) {
    console.error("Error getting user by username:", error);
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
