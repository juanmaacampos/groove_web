import React, { useState, useRef, useEffect, useCallback } from 'react';
import MenuCard from '../menuCard/MenuCard.jsx';
import { useFirebase } from '../../firebase/FirebaseProvider.jsx';
import { useGrooveMenus } from '../../utils/menuMapper.js';
import './menuSlider.css';

export const MenuSlider = ({ onSelect }) => {
  const { menuSDK, isInitialized } = useFirebase();
  const { grooveMenus, loading, error } = useGrooveMenus(menuSDK);
  // Obtener las keys de los menús disponibles (dinámico desde Firebase)
  const keys = Object.keys(grooveMenus);
  
  // Estados siempre declarados al inicio
  const [currentIndex, setCurrentIndex] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [currentDrag, setCurrentDrag] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Referencias siempre declaradas al inicio
  const trackRef = useRef(null);
  const slidesRef = useRef([]);
  const carouselRef = useRef(null);
  
  // Calculate and set the translation to center the active slide
  const centerActiveSlide = useCallback(() => {
    if (!carouselRef.current || !trackRef.current || !slidesRef.current[currentIndex]) {
      return;
    }
    const carouselWidth = carouselRef.current.offsetWidth;
    const trackWidth = trackRef.current.scrollWidth;
    const activeSlide = slidesRef.current[currentIndex];
    const slideOffsetLeft = activeSlide.offsetLeft;
    const slideWidth = activeSlide.offsetWidth;
    
    // Calcular la posición ideal para centrar el slide
    let newTranslateX = (carouselWidth / 2) - (slideOffsetLeft + slideWidth / 2);
    
    // Aplicar límites para evitar scroll horizontal
    const maxTranslateX = 0; // No puede ir más a la derecha del inicio
    const minTranslateX = Math.min(0, carouselWidth - trackWidth); // No puede ir más a la izquierda
    
    // Limitar el translateX a los bounds válidos
    newTranslateX = Math.max(minTranslateX, Math.min(maxTranslateX, newTranslateX));
    
    setTranslateX(newTranslateX);
  }, [currentIndex]);
  
  // Efecto para establecer el elemento del medio cuando se cargan los menús
  useEffect(() => {
    if (keys.length > 0 && !hasInitialized) {
      const middleIndex = Math.floor(keys.length / 2);
      setCurrentIndex(middleIndex);
      setHasInitialized(true);
    }
  }, [keys.length, hasInitialized]);
  
  // Efecto para forzar recalculo cuando se inicializa
  useEffect(() => {
    if (hasInitialized) {
      const timer = setTimeout(() => {
        centerActiveSlide();
      }, 50); // Un poco más de delay para asegurar que el DOM esté listo
      
      return () => clearTimeout(timer);
    }
  }, [hasInitialized, centerActiveSlide]);
  
  console.log('🎬 MenuSlider render:', { 
    isInitialized, 
    loading, 
    error, 
    menuSDKExists: !!menuSDK, 
    keysLength: keys.length,
    grooveMenus 
  });

  useEffect(() => {
    // Recalculate on index change and resize
    // Usar setTimeout para asegurar que el DOM esté actualizado
    const timer = setTimeout(() => {
      centerActiveSlide();
    }, 10);
    
    window.addEventListener('resize', centerActiveSlide);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', centerActiveSlide);
    };
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
      // Agregar event listeners para mouse y touch
      const handleMouseMove = (e) => handleDragMove(e);
      const handleTouchMove = (e) => handleDragMove(e);
      
      trackElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      trackElement.addEventListener('mousemove', handleMouseMove, { passive: false });
      
      return () => {
        trackElement.removeEventListener('touchmove', handleTouchMove);
        trackElement.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [isDragging]); // Agregar isDragging como dependencia

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

  // Funciones para navegación con botones
  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(prev + 1, keys.length - 1));
  };

  // Función para manejar click en slides inactivos
  const handleSlideClick = (index, e) => {
    // Solo cambiar si no es el slide activo
    if (index !== currentIndex) {
      e.stopPropagation(); // Evitar interferir con el drag
      setCurrentIndex(index);
    }
  };

  return (
    <div className="menu-carousel" ref={carouselRef}>
      {/* Botón anterior - solo visible en desktop */}
      <button 
        className="carousel-nav-btn carousel-nav-btn--prev"
        onClick={goToPrevious}
        disabled={currentIndex === 0}
        aria-label="Menú anterior"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

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
              onClick={(e) => handleSlideClick(index, e)}
              style={{ cursor: isActive ? 'default' : 'pointer' }}
            >
              <MenuCard type={key} menuData={grooveMenus[key]} onMore={() => onSelect && onSelect(key)} />
            </div>
          );
        })}
      </div>

      {/* Botón siguiente - solo visible en desktop */}
      <button 
        className="carousel-nav-btn carousel-nav-btn--next"
        onClick={goToNext}
        disabled={currentIndex === keys.length - 1}
        aria-label="Menú siguiente"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

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
