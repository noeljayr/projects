import { useState, useEffect, useCallback } from "react";

export const useUrlModal = (paramName: string) => {
  const [isOpen, setIsOpen] = useState(false);

  // Function to check URL parameters and update modal state
  const updateModalState = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    setIsOpen(params.has(paramName));
  }, [paramName]);

  useEffect(() => {
    // Check initial URL state
    updateModalState();

    // Listen for browser navigation events
    const handlePopState = () => {
      updateModalState();
    };

    window.addEventListener("popstate", handlePopState);

    // Listen for pushstate/replacestate events (for programmatic navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      updateModalState();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      updateModalState();
    };

    // Cleanup
    return () => {
      window.removeEventListener("popstate", handlePopState);
      // Restore original methods
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [updateModalState]);

  return {
    isOpen,
    updateModalState,
  };
};