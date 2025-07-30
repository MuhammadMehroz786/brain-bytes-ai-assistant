import { useState, useEffect } from 'react';

const FEEDBACK_INTERVAL = 12 * 24 * 60 * 60 * 1000; // 12 days in milliseconds
const FEEDBACK_STORAGE_KEY = 'last-feedback-shown';

export const useFeedbackModal = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    const checkShouldShowFeedback = () => {
      const lastShown = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      const now = Date.now();
      
      if (!lastShown) {
        // First time user - show after 3 days
        const firstShowTime = now + (3 * 24 * 60 * 60 * 1000);
        localStorage.setItem(FEEDBACK_STORAGE_KEY, firstShowTime.toString());
        return;
      }

      const lastShownTime = parseInt(lastShown);
      const timeSinceLastShown = now - lastShownTime;
      
      // Show feedback modal if it's been more than the interval
      if (timeSinceLastShown >= FEEDBACK_INTERVAL) {
        setShowFeedbackModal(true);
      }
    };

    // Check on component mount
    checkShouldShowFeedback();

    // Set up interval to check periodically (every hour)
    const interval = setInterval(checkShouldShowFeedback, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    // Update the last shown time
    localStorage.setItem(FEEDBACK_STORAGE_KEY, Date.now().toString());
  };

  return {
    showFeedbackModal,
    closeFeedbackModal,
  };
};