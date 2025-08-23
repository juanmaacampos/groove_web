import React, { useState } from 'react';
import { useMenu, useCart } from './useMenu.js';
import './MenuComponents.css';

// Funciones helper para manejo de stock
function getStockClass(item) {
  if (!item.trackStock) return 'stock-unlimited';
  if (item.stock <= 0 || item.isAvailable === false) return 'stock-out';
  if (item.stock <= (item.minStock || 5)) return 'stock-low';
  return 'stock-normal';
}

function getStockIcon(item) {
  if (!item.trackStock) return '∞';
  if (item.stock <= 0 || item.isAvailable === false) return '❌';
  if (item.stock <= (item.minStock || 5)) return '⚠️';
  return '✅';
}

function getStockText(item) {
  if (!item.trackStock) return 'Ilimitado';
  if (item.stock <= 0 || item.isAvailable === false) return 'Sin stock';
  if (item.stock <= (item.minStock || 5)) return `${item.stock} (Últimas unidades)`;
  return `${item.stock} disponibles`;
}

function isItemAvailable(item) {
  if (item.isAvailable === false) return false;
  if (!item.trackStock) return true;
  return item.stock > 0;
}

function getButtonClass(item) {
  if (!isItemAvailable(item)) return 'add-button disabled';
  if (item.trackStock && item.stock <= (item.minStock || 5)) return 'add-button warning';
  return 'add-button';
}

function getButtonText(item, terminology = {}) {
  if (item.isAvailable === false) return 'No disponible';
  if (item.trackStock && item.stock <= 0) return 'Sin stock';
  if (item.trackStock && item.stock <= (item.minStock || 5)) return `Agregar (quedan ${item.stock})`;
  return terminology.addToCart || 'Agregar al carrito';
}

// Componente para navegación de categorías
export function CategoryNav({ categories, terminology = {}, className = "" }) {
  if (!categories || categories.length === 0) return null;

  return (
    <nav className={`category-nav ${className}`}>
      <h3 className="category-nav-title">
        {terminology.categoriesOfMenu || 'Categorías'}
      </h3>
      <div className="category-nav-items">
        {categories.map(category => (
          <a 
            key={category.id}
            href={`#category-${category.id}`}
            className="category-nav-item"
          >
            {category.name}
            {category.items && <span className="item-count">({category.items.length})</span>}
          </a>
        ))}
      </div>
    </nav>
  );
}

// Componente para galería de imágenes de productos
function ProductImageGallery({ images, itemName, className = "item-image" }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Si no hay imágenes o el array está vacío, usar el fallback
  if (!images || !Array.isArray(images) || images.length === 0) {
    return <div className={`${className} item-placeholder`}>🍽️</div>;
  }

  const currentImage = images[currentImageIndex];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className={`${className} product-gallery`}>
      <ImageWithFallback 
        src={currentImage.url} 
        alt={`${itemName} - Imagen ${currentImageIndex + 1}`} 
        className="gallery-main-image"
      />
      
      {hasMultipleImages && (
        <>
          {/* Botones de navegación */}
          <button 
            className="gallery-nav-btn gallery-prev" 
            onClick={prevImage}
            aria-label="Imagen anterior"
          >
            ‹
          </button>
          <button 
            className="gallery-nav-btn gallery-next" 
            onClick={nextImage}
            aria-label="Siguiente imagen"
          >
            ›
          </button>
          
          {/* Indicador de múltiples imágenes */}
          <div className="gallery-indicator">
            <span className="gallery-icon">📷</span>
            <span className="gallery-count">{images.length}</span>
          </div>
          
          {/* Dots indicadores */}
          <div className="gallery-dots">
            {images.map((_, index) => (
              <button
                key={index}
                className={`gallery-dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => goToImage(index)}
                aria-label={`Ver imagen ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Componente para imagen con loading y error handling mejorado
function ImageWithFallback({ src, alt, className, placeholder = "🍽️" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    console.warn(`Error al cargar imagen: ${src}`);
  };

  // Si no hay src, mostrar placeholder directamente
  if (!src) {
    return <div className={`${className} item-placeholder`}>{placeholder}</div>;
  }

  // Si hubo error, mostrar placeholder
  if (error) {
    return <div className={`${className} item-placeholder`}>{placeholder}</div>;
  }

  return (
    <div className={className} style={{ position: 'relative' }}>
      {loading && <div className="item-placeholder">🔄</div>}
      <img 
        src={src} 
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        style={{ 
          display: loading ? 'none' : 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </div>
  );
}

// Componente principal del menú
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
  if (loading) {
    return <div className="menu-loading">🍽️ Cargando {terminology.menuName || 'menú'} delicioso...</div>;
  }

  if (error) {
    return <div className="menu-error">❌ Error: {error}</div>;
  }

  if (!menu || menu.length === 0) {
    return <div className="menu-empty">📋 No hay {terminology.items || 'platos'} disponibles</div>;
  }

  return (
    <div className="menu-display">
      {menu.map(category => (
        <div key={category.id} className="menu-category">
          <h2 className="category-title">{category.name}</h2>
          {category.description && (
            <p className="category-description">{category.description}</p>
          )}
          <div className="menu-items">
            {category.items.map(item => (
              <MenuItem
                key={item.id}
                item={item}
                onAddToCart={onAddToCart}
                showImage={showImages}
                showPrice={showPrices}
                showDescription={showDescription}
                terminology={terminology}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente individual del item
export function MenuItem({ 
  item, 
  onAddToCart, 
  showImage = true, 
  showPrice = true, 
  showDescription = true,
  terminology = {}
}) {
  // Determinar qué imagen usar: múltiples imágenes o imagen única
  const getItemImages = (item) => {
    // Si tiene múltiples imágenes, usarlas
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images;
    }
    // Si tiene imageUrl (compatibilidad), crear array con una imagen
    if (item.imageUrl) {
      return [{ url: item.imageUrl, id: 'legacy-image' }];
    }
    // Sin imágenes
    return [];
  };

  const itemImages = getItemImages(item);

  return (
    <div className="menu-item">
      {showImage && (
        <ProductImageGallery 
          images={itemImages}
          itemName={item.name}
          className="item-image"
        />
      )}
      
      <div className="item-content">
        <div className="item-header">
          <h3 className="item-name">{item.name}</h3>
          {showPrice && <span className="item-price">${item.price}</span>}
        </div>
        
        {showDescription && item.description && (
          <p className="item-description">{item.description}</p>
        )}
        
        <div className="item-tags">
          {item.isFeatured && <span className="tag featured">⭐ Destacado</span>}
          {!item.isAvailable && <span className="tag unavailable">No disponible</span>}
          {item.trackStock && typeof item.stock === 'number' && (
            <span className={`tag stock ${getStockClass(item)}`}>
              {getStockIcon(item)} Stock: {getStockText(item)}
            </span>
          )}
        </div>
        
        {onAddToCart && (
          <button 
            className={`add-button ${getButtonClass(item)}`}
            onClick={() => onAddToCart(item)}
            disabled={!isItemAvailable(item)}
          >
            {getButtonText(item, terminology)}
          </button>
        )}
      </div>
    </div>
  );
}

// Componente solo para platos destacados
export function FeaturedItems({ 
  featuredItems, 
  menu,
  onAddToCart, 
  loading, 
  error,
  title,
  terminology = {}
}) {
  // Si se pasa menu, extraer destacados de ahí
  const itemsToShow = featuredItems || (menu ? 
    menu.flatMap(category => 
      category.items.filter(item => item.isFeatured && item.isAvailable)
        .map(item => ({ ...item, categoryName: category.name }))
    ) : []
  );

  const displayTitle = title || terminology.featuredProducts || "Platos Destacados";

  if (loading) {
    return <div className="menu-loading">🌟 Cargando destacados...</div>;
  }

  if (error) {
    return <div className="menu-error">❌ Error: {error}</div>;
  }

  if (!itemsToShow || itemsToShow.length === 0) {
    return <div className="menu-empty">⭐ No hay {terminology.items || 'platos'} destacados</div>;
  }

  return (
    <div className="featured-items">
      <h2 className="featured-title">{displayTitle}</h2>
      <div className="menu-items">
        {itemsToShow.map(item => (
          <MenuItem
            key={item.id}
            item={item}
            onAddToCart={onAddToCart}
            showImage={true}
            showPrice={true}
            showDescription={true}
            terminology={terminology}
          />
        ))}
      </div>
    </div>
  );
}

// Componente de carrito
export function Cart({ 
  cart, 
  onUpdateQuantity, 
  onRemove, 
  onClear,
  total,
  title = "Carrito" 
}) {
  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <h3>{title}</h3>
        <p>Tu carrito está vacío</p>
        <span className="cart-icon">🛒</span>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart-header">
        <h3>{title} ({cart.length})</h3>
        <button onClick={onClear} className="clear-button">
          Limpiar
        </button>
      </div>
      
      <div className="cart-items">
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <span className="cart-item-name">{item.name}</span>
              <span className="cart-item-price">${item.price}</span>
            </div>
            <div className="cart-item-controls">
              <button 
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                className="quantity-btn"
              >
                -
              </button>
              <span className="quantity">{item.quantity}</span>
              <button 
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="quantity-btn"
              >
                +
              </button>
              <button 
                onClick={() => onRemove(item.id)} 
                className="remove-btn"
              >
                ✕
              </button>
            </div>
            <div className="cart-item-total">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="cart-footer">
        <div className="cart-total">
          <strong>Total: ${total.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
}

// Componente completo con menú y carrito integrado
export function MenuWithCart({ menuSDK, showImages = true, terminology = {} }) {
  const { restaurant, business, menu, loading, error } = useMenu(menuSDK);
  const { 
    cart, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    cartTotal 
  } = useCart();

  // Usar business si está disponible, sino restaurant para compatibilidad
  const businessData = business || restaurant;
  const businessType = businessData?.businessType || 'restaurant';
  const icon = businessType === 'store' ? '🏪' : '🍽️';

  return (
    <div className="menu-with-cart">
      <div className="menu-section">
        {businessData && (
          <div className="restaurant-header">
            <h1>{icon} {businessData.name}</h1>
            {businessData.description && (
              <p className="restaurant-description">{businessData.description}</p>
            )}
          </div>
        )}
        
        <MenuDisplay
          menu={menu}
          onAddToCart={addToCart}
          loading={loading}
          error={error}
          showImages={showImages}
          terminology={terminology}
        />
      </div>
      
      <div className="cart-section">
        <Cart
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onClear={clearCart}
          total={cartTotal}
          title={terminology.orderSummary || "Carrito"}
        />
      </div>
    </div>
  );
}
