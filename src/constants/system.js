/**
 * System Constants
 *
 * Contains system-wide configuration values
 */

// System User ID - This account has admin privileges
// Can delete/modify all categories and quizzes (including system categories)
export const SYSTEM_USER_ID = 'MM9DnTJdfdS82wg6NzRNovenTNf1';

// Helper function to check if current user is system user
export const isSystemUser = (currentUserId) => {
  return currentUserId === SYSTEM_USER_ID;
};
