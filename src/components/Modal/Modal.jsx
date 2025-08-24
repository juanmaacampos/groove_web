import React, { useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import './modal.css';

/**
 * Modal Component
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - children: React nodes
 * - showCloseButton?: boolean (default: true)
 * - closeOnBackdropClick?: boolean (default: true)
 * - className?: string
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  showCloseButton = true,
  closeOnBackdropClick = true,
  className = '' 
}) => {
  // Close modal on ESC key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={handleBackdropClick}
    >
      <div className={`modal-content ${className}`}>
        {showCloseButton && (
          <button 
            className="modal-close" 
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <HiX />
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
