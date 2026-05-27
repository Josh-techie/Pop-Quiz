import React, { createContext, useContext, useState, useCallback } from 'react';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  const [shouldBlockNavigation, setShouldBlockNavigation] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [showNavigationModal, setShowNavigationModal] = useState(false);

  const checkNavigation = useCallback((navigationCallback) => {
    if (shouldBlockNavigation) {
      setPendingNavigation(() => navigationCallback);
      setShowNavigationModal(true);
      return false; // Block navigation
    }
    // No unsaved changes - allow immediate navigation
    navigationCallback();
    return true;
  }, [shouldBlockNavigation]);

  const confirmNavigation = useCallback(() => {
    setShowNavigationModal(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  }, [pendingNavigation]);

  const cancelNavigation = useCallback(() => {
    setShowNavigationModal(false);
    setPendingNavigation(null);
  }, []);

  const setNavigationBlock = useCallback((block) => {
    setShouldBlockNavigation(block);
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        shouldBlockNavigation,
        setNavigationBlock,
        checkNavigation,
        showNavigationModal,
        confirmNavigation,
        cancelNavigation
      }}
    >
      {children}

      {/* Global Navigation Confirmation Modal */}
      {showNavigationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Unsaved Changes</h3>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <p className="text-gray-600 leading-relaxed">
                You have unsaved changes in your quiz. If you leave now, all your progress will be lost.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={cancelNavigation}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white transition-all"
              >
                Keep Editing
              </button>
              <button
                onClick={confirmNavigation}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
