import React, { useEffect } from 'react';
import { auth } from '../../firebase';

/**
 * Developer Tools Component
 * Shows current user ID in console for debugging
 * Remove this in production
 */
const DevTools = () => {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('=================================');
        console.log('🔧 DEV TOOLS - User Information');
        console.log('=================================');
        console.log('User ID:', user.uid);
        console.log('Email:', user.email);
        console.log('=================================');
        console.log('Copy the User ID above to fix category ownership');
        console.log('=================================');
      }
    });

    return () => unsubscribe();
  }, []);

  return null; // This component doesn't render anything
};

export default DevTools;
