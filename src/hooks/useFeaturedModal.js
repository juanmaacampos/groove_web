import { useState, useEffect } from 'react';

const MODAL_STORAGE_KEY = 'groove_featured_modal_shown';

/**
 * Custom hook to manage the featured announcement modal
 * Shows the modal when a new featured announcement appears
 */
export const useFeaturedModal = (announcements) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [featuredAnnouncement, setFeaturedAnnouncement] = useState(null);

  useEffect(() => {
    if (!announcements || announcements.length === 0) return;

    // Find the first featured announcement
    const featured = announcements.find(announcement => announcement.isFeatured);
    
    if (featured) {
      setFeaturedAnnouncement(featured);
      
      // Check if this specific announcement was already shown
      let shownAnnouncements = {};
      try {
        const stored = localStorage.getItem(MODAL_STORAGE_KEY);
        if (stored) {
          // Try to parse as JSON (new format)
          const parsed = JSON.parse(stored);
          if (typeof parsed === 'object' && parsed !== null) {
            shownAnnouncements = parsed;
          } else {
            // Old format (just a date string), clear it
            localStorage.removeItem(MODAL_STORAGE_KEY);
          }
        }
      } catch (error) {
        // Invalid JSON or old format, clear it
        console.log('Clearing old modal storage format');
        localStorage.removeItem(MODAL_STORAGE_KEY);
        shownAnnouncements = {};
      }
      
      const today = new Date().toDateString();
      
      // Check if this announcement ID was shown today
      const wasShownToday = shownAnnouncements[featured.id] === today;
      
      if (!wasShownToday) {
        // Show modal after a small delay to ensure page is loaded
        const timer = setTimeout(() => {
          setIsModalOpen(true);
          
          // Mark this announcement as shown today
          const updatedShown = {
            ...shownAnnouncements,
            [featured.id]: today
          };
          localStorage.setItem(MODAL_STORAGE_KEY, JSON.stringify(updatedShown));
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [announcements]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Force show modal (for testing or manual trigger)
  const showModal = () => {
    if (featuredAnnouncement) {
      setIsModalOpen(true);
    }
  };

  return {
    isModalOpen,
    featuredAnnouncement,
    closeModal,
    showModal
  };
};
