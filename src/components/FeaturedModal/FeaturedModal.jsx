import React, { useState, useEffect } from 'react';
import Modal from '../Modal/Modal.jsx';
import PremiumCard from '../PremiumCard/PremiumCard.jsx';
import defaultAnnouncementImg from '../../assets/img/eventos.png';

// Function to validate and normalize URLs (same as in BodyAds)
const validateImageUrl = (imageData) => {
  if (typeof imageData === 'string') {
    const trimmed = imageData.trim();
    if (trimmed === '') {
      return { valid: false, error: 'URL vacía' };
    }
    
    try {
      new URL(trimmed);
      return { valid: true, url: trimmed };
    } catch (e) {
      if (trimmed.includes('firebase') || trimmed.includes('storage') || trimmed.startsWith('/')) {
        return { valid: true, url: trimmed };
      }
      return { valid: false, error: 'URL string no válida', originalError: e.message };
    }
  }
  
  if (typeof imageData === 'object' && imageData !== null) {
    const url = imageData.url || imageData.src || imageData.downloadURL;
    if (url && typeof url === 'string') {
      const trimmed = url.trim();
      if (trimmed === '') {
        return { valid: false, error: 'URL en objeto vacía' };
      }
      
      try {
        new URL(trimmed);
        return { valid: true, url: trimmed };
      } catch (e) {
        return { valid: false, error: 'URL en objeto no válida', originalError: e.message };
      }
    }
    return { valid: false, error: 'Objeto no contiene URL válida' };
  }
  
  return { valid: false, error: 'Tipo de imagen no soportado' };
};

/**
 * FeaturedModal Component
 * Shows a featured announcement in a modal dialog
 */
const FeaturedModal = ({ isOpen, onClose, announcement }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Process images (same logic as BodyAds)
  let validImages = [defaultAnnouncementImg];
  
  if (announcement && announcement.images && Array.isArray(announcement.images) && announcement.images.length > 0) {
    const processedImages = [];
    announcement.images.forEach((img) => {
      const validation = validateImageUrl(img);
      if (validation.valid) {
        processedImages.push(validation.url);
      }
    });
    
    if (processedImages.length > 0) {
      validImages = processedImages;
    }
  }

  // Auto-rotate images if there are multiple
  useEffect(() => {
    if (!announcement || validImages.length <= 1 || !isOpen) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % validImages.length);
    }, 3500); // Slightly slower rotation in modal

    return () => clearInterval(interval);
  }, [announcement, validImages.length, isOpen]);

  // Reset image index when announcement changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [announcement?.id]);

  // Early return after hooks
  if (!announcement) return null;

  // Process badges
  const badges = announcement.badges?.filter(badge => {
    return badge && typeof badge === 'string' && badge.trim() !== '';
  }) || [];

  // Handle CTA click - go to top of page instead of external URL
  const handleCtaClick = () => {
    // Scroll to top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    onClose(); // Close modal after clicking CTA
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      className="featured-modal"
    >
      <PremiumCard
        title={announcement.title || "Anuncio especial"}
        subtitle={announcement.description || "Descubre más sobre esta oferta especial"}
        badges={badges}
        bullets={[]}
        isFeatured={false} // Don't show featured badge in modal
        ctaLabel={announcement.urlText || "Ver más"}
        ctaHref="#"
        ctaOnClick={handleCtaClick}
        imageSrc={validImages}
        imageAlt={announcement.title || "Anuncio"}
        currentImageIndex={currentImageIndex}
      />
    </Modal>
  );
};

export default FeaturedModal;
