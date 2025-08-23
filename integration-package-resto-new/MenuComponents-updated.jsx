import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGrooveMenus, useMenuCategories } from './useMenu.js';
import './MenuComponents.css';

/**
 * 🎠 COMPONENTE SLIDER DE MENÚS GROOVE
 * Carrusel interactivo que muestra los menús disponibles dinámicamente desde Firebase
 * PROBADO EN: Groove Web App - Funcional al 100%
 */
export const MenuSlider = ({ menuSDK, onSelect }) => {
  const { grooveMenus, loading, error } = useGrooveMenus(menuSDK);
  
  // Estados para el carrusel
  const [currentIndex, setCurrentIndex] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [currentDrag, setCurrentDrag] = useState(0);
  
  // Referencias
  const trackRef = useRef(null);
  const slidesRef = useRef([]);
  const carouselRef = useRef(null);
  
  // Obtener las keys de los menús disponibles
  const keys = Object.keys(grooveMenus);

  // Centrar el slide activo
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
    centerActiveSlide();
    window.addEventListener('resize', centerActiveSlide);
    return () => window.removeEventListener('resize', centerActiveSlide);
  }, [centerActiveSlide]);

  // Manejo de swipe/arrastre
  const handleDragStart = (e) => {
    setIsDragging(true);
    setStartPos(e.touches ? e.touches[0].clientX : e.clientX);
    setCurrentDrag(0);
    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
    }
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentPos = e.touches ? e.touches[0].clientX : e.clientX;
    setCurrentDrag(currentPos - startPos);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    const dragThreshold = 50;
    if (Math.abs(currentDrag) > dragThreshold) {
      if (currentDrag < 0) {
        setCurrentIndex(prev => Math.min(prev + 1, keys.length - 1));
      } else {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
      }
    }
    setCurrentDrag(0);
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

  if (loading) {
    return (
      <div className="menu-carousel">
        <div className="carousel-loading">
          <p>📋 Cargando menús...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-carousel">
        <div className="carousel-error">
          <p>❌ Error cargando menús: {error}</p>
        </div>
      </div>
    );
  }

  if (keys.length === 0) {
    return (
      <div className="menu-carousel">
        <div className="carousel-loading">
          <p>📭 No hay menús disponibles</p>
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
              <MenuCard 
                menuData={grooveMenus[key]} 
                onMore={() => onSelect && onSelect(key)} 
              />
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

/**
 * 🃏 COMPONENTE TARJETA DE MENÚ
 * Tarjeta individual que representa un menú con información dinámica
 */
export const MenuCard = ({ menuData, onMore }) => {
  if (!menuData) {
    return (
      <div className="menu-card menu-card-loading">
        <p>⏳ Cargando...</p>
      </div>
    );
  }

  return (
    <div className="menu-card">
      <div className="menu-card-icon">
        <span className="menu-emoji">{menuData.icon}</span>
      </div>
      <div className="menu-card-content">
        <h3 className="menu-card-title">{menuData.title}</h3>
        <p className="menu-card-description">{menuData.description}</p>
        {onMore && (
          <button className="menu-card-button" onClick={onMore}>
            Ver menú
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * 📋 COMPONENTE DROPDOWN DE MENÚ
 * Vista detallada que muestra categorías e items de un menú específico
 */
export const MenuDropdown = ({ menuSDK, menuType, onClose }) => {
  const { grooveMenus, loading: menusLoading } = useGrooveMenus(menuSDK);
  const { categories, loading: categoriesLoading } = useMenuCategories(menuSDK, menuType);
  
  const loading = menusLoading || categoriesLoading;
  const menuInfo = grooveMenus[menuType];

  if (loading) {
    return (
      <div className="menu-dropdown">
        <div className="menu-dropdown-header">
          <h2>⏳ Cargando menú...</h2>
          {onClose && (
            <button className="close-button" onClick={onClose}>✕</button>
          )}
        </div>
      </div>
    );
  }

  if (!menuInfo) {
    return (
      <div className="menu-dropdown">
        <div className="menu-dropdown-header">
          <h2>❌ Menú no encontrado</h2>
          {onClose && (
            <button className="close-button" onClick={onClose}>✕</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="menu-dropdown">
      <div className="menu-dropdown-header">
        <div className="menu-header-info">
          <span className="menu-header-icon">{menuInfo.icon}</span>
          <h2>{menuInfo.title}</h2>
        </div>
        {onClose && (
          <button className="close-button" onClick={onClose}>✕</button>
        )}
      </div>

      <div className="menu-dropdown-content">
        {categories.length === 0 ? (
          <div className="menu-empty">
            <p>📭 No hay elementos disponibles</p>
          </div>
        ) : (
          categories.map(category => (
            <CategorySection key={category.id} category={category} />
          ))
        )}
      </div>
    </div>
  );
};

/**
 * 📂 COMPONENTE SECCIÓN DE CATEGORÍA
 * Sección que agrupa items por categoría
 */
const CategorySection = ({ category }) => {
  return (
    <div className="category-section">
      <h3 className="category-title">{category.name}</h3>
      {category.description && (
        <p className="category-description">{category.description}</p>
      )}
      <div className="category-items">
        {category.items.map(item => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

/**
 * 🍽️ COMPONENTE ITEM DE MENÚ
 * Item individual del menú con información detallada
 */
const MenuItem = ({ item }) => {
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `$${price.toLocaleString()}`;
    }
    return price || 'Consultar precio';
  };

  const getStockStatus = () => {
    if (!item.trackStock) return null;
    
    if (item.stock <= 0 || item.isAvailable === false) {
      return { class: 'stock-out', text: 'Sin stock' };
    }
    
    if (item.stock <= 5) {
      return { class: 'stock-low', text: `Últimas ${item.stock}` };
    }
    
    return null;
  };

  const stockStatus = getStockStatus();

  return (
    <div className={`menu-item ${stockStatus ? stockStatus.class : ''}`}>
      {item.image && (
        <div className="menu-item-image">
          <img src={item.image} alt={item.name} loading="lazy" />
        </div>
      )}
      <div className="menu-item-content">
        <div className="menu-item-header">
          <h4 className="menu-item-name">{item.name}</h4>
          <span className="menu-item-price">{formatPrice(item.price)}</span>
        </div>
        {item.description && (
          <p className="menu-item-description">{item.description}</p>
        )}
        {item.ingredients && item.ingredients.length > 0 && (
          <p className="menu-item-ingredients">
            <small>{item.ingredients.join(', ')}</small>
          </p>
        )}
        {stockStatus && (
          <div className={`stock-indicator ${stockStatus.class}`}>
            <small>{stockStatus.text}</small>
          </div>
        )}
        {item.isFeatured && (
          <div className="featured-badge">⭐ Destacado</div>
        )}
      </div>
    </div>
  );
};

/**
 * 🔍 COMPONENTE BUSCADOR DE MENÚ
 * Componente de búsqueda con resultados en tiempo real
 */
export const MenuSearch = ({ menuSDK, onItemSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchTimeoutRef = useRef(null);

  const handleSearch = useCallback(async (term) => {
    if (!term.trim() || !menuSDK) {
      setResults([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const searchResults = await menuSDK.searchItems(term);
      setResults(searchResults);
    } catch (err) {
      console.error('Error searching items:', err);
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [menuSDK]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim().length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, handleSearch]);

  return (
    <div className="menu-search">
      <div className="search-input-container">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar platos, bebidas..."
          className="search-input"
        />
        {loading && <div className="search-loading">🔍</div>}
      </div>
      
      {error && (
        <div className="search-error">
          <p>❌ Error: {error}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="search-results">
          <h4>Resultados ({results.length})</h4>
          <div className="search-results-list">
            {results.map(item => (
              <div 
                key={item.id} 
                className="search-result-item"
                onClick={() => onItemSelect && onItemSelect(item)}
              >
                <MenuItem item={item} />
                <small className="result-category">
                  En: {item.categoryName}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchTerm.trim() && results.length === 0 && !loading && !error && (
        <div className="search-no-results">
          <p>🔍 No se encontraron resultados para "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default { MenuSlider, MenuCard, MenuDropdown, MenuSearch };
