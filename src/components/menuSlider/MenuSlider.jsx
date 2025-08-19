import React, { useState, useRef, useEffect, useCallback } from 'react';
import MenuCard from '../menuCard/MenuCard.jsx';
import { useFirebase } from '../../firebase/FirebaseProvider.jsx';
import { useGrooveMenus } from '../../utils/menuMapper.js';
import './menuSlider.css';

export const MenuSlider = ({ onSelect }) => {
  const { menuSDK, isInitialized } = useFirebase();
  const { grooveMenus, loading, error } = useGrooveMenus(menuSDK);
  
  // Estados siempre declarados al inicio
  const [currentIndex, setCurrentIndex] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [currentDrag, setCurrentDrag] = useState(0);
  
  // Referencias siempre declaradas al inicio
  const trackRef = useRef(null);
  const slidesRef = useRef([]);
  const carouselRef = useRef(null);
  
  // Obtener las keys de los menús disponibles (dinámico desde Firebase)
  const keys = Object.keys(grooveMenus);
  
  console.log('🎬 MenuSlider render:', { 
    isInitialized, 
    loading, 
    error, 
    menuSDKExists: !!menuSDK, 
    keysLength: keys.length,
    grooveMenus 
  });

  // Calculate and set the translation to center the active slide
  const centerActiveSlide = useCallback(() => {
    if (!carouselRef.current || !trackRef.current || !slidesRef.current[currentIndex]) {
      return;
    }
    const carouselWidth = carouselRef.current.offsetWidth;
    const activeSlide = slidesRef.current[currentIndex];
    const slideOffsetLeft = activeSlide.offsetLeft;
    const slideWidth = activeSlide.offsetWidth;
    
    const newTranslateX = (carouselWidth / 2) - (slideOffsetLeft + slideWidth / 2);
    setTranslateX(newTranslateX);
  }, [currentIndex]);

  useEffect(() => {
    // Recalculate on index change and resize
    centerActiveSlide();
    window.addEventListener('resize', centerActiveSlide);
    return () => window.removeEventListener('resize', centerActiveSlide);
  }, [centerActiveSlide]);

  // --- Swipe Logic ---
  const handleDragStart = (e) => {
    setIsDragging(true);
    setStartPos(e.touches ? e.touches[0].clientX : e.clientX);
    setCurrentDrag(0);
    if (trackRef.current) {
      trackRef.current.style.transition = 'none'; // Disable transition while dragging
    }
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    // Prevent vertical scroll while swiping horizontally
    e.preventDefault();
    const currentPos = e.touches ? e.touches[0].clientX : e.clientX;
    setCurrentDrag(currentPos - startPos);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'; // Re-enable transition
    }

    const dragThreshold = 50; // Min drag distance to trigger a slide change
    if (Math.abs(currentDrag) > dragThreshold) {
      if (currentDrag < 0) {
        // Swiped left
        setCurrentIndex(prev => Math.min(prev + 1, keys.length - 1));
      } else {
        // Swiped right
        setCurrentIndex(prev => Math.max(prev - 1, 0));
      }
    }
    setCurrentDrag(0); // Reset drag offset
  };

  useEffect(() => {
    const trackElement = trackRef.current;
    if (trackElement) {
      trackElement.addEventListener('touchmove', handleDragMove, { passive: false });
      return () => {
        trackElement.removeEventListener('touchmove', handleDragMove);
      };
    }
  }, []);

  // Estados condicionales DESPUÉS de todos los hooks
  if (!isInitialized) {
    return (
      <div className="menu-carousel">
        <div className="carousel-loading">
          <div className="simple-loader"></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="menu-carousel">
        <div className="carousel-loading">
          <div className="simple-loader"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-carousel">
        <div className="carousel-error">
          <p>Error cargando menús: {error}</p>
        </div>
      </div>
    );
  }

  if (keys.length === 0) {
    return (
      <div className="menu-carousel">
        <div className="carousel-loading">
          <div className="simple-loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-carousel" ref={carouselRef}>
      <div
        className="carousel-track"
        ref={trackRef}
        style={{ transform: `translateX(calc(${translateX}px + ${currentDrag}px))` }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onMouseMove={handleDragMove}
        onTouchMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onTouchEnd={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {keys.map((key, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={key}
              className={`carousel-slide ${isActive ? 'active' : ''}`}
              ref={el => slidesRef.current[index] = el}
            >
              <MenuCard type={key} menuData={grooveMenus[key]} onMore={() => onSelect && onSelect(key)} />
            </div>
          );
        })}
      </div>
      <div className="carousel-dots">
        {keys.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuSlider;
