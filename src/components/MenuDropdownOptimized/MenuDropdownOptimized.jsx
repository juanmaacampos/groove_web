import React, { useMemo, useState, useRef, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useFirebase } from '../../firebase/FirebaseProvider.jsx';
import { useGrooveMenus } from '../../utils/menuMapper.js';
import { useMenuCategoriesLazy, useSmartCategoryExpansion } from '../../hooks/useLazyLoading.js';
import Modal from '../../components/Modal/Modal.jsx';
import grooveLogo from '/Groove_logo.svg';
import './menuDropdownOptimized.css';

/**
 * 🚀 MENU DROPDOWN OPTIMIZADO CON LAZY LOADING
 * Carga categorías primero, items bajo demanda al expandir
 */

// Componente de categoría optimizada con lazy loading
const LazyCategory = ({ category, isOpen, isLoading, onToggle, onImageClick, searchTerm }) => {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    if (!normalizedSearch) return category.items;
    return category.items.filter((item) =>
      [item.name, item.desc, item.price]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(normalizedSearch))
    );
  }, [category.items, normalizedSearch]);

  const handleToggle = () => {
    onToggle(category.id);
  };

  return (
    <div id={`category-${category.id}`} className={`md-cat lazy ${isOpen ? 'open' : ''} ${isLoading ? 'loading' : ''}`}>
      <button 
        className="md-cat-header" 
        onClick={handleToggle} 
        aria-expanded={isOpen}
        disabled={isLoading}
      >
        <span className="md-cat-name">
          {category.name}
          {category.itemCount > 0 && (
            <span className="md-cat-count">({category.itemCount})</span>
          )}
        </span>
        
        {isLoading ? (
          <span className="md-cat-loading" aria-hidden>
            <div className="mini-spinner"></div>
          </span>
        ) : (
          <span className="md-cat-arrow" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M6 9L12 15L18 9" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </button>
      
      <div 
        className="md-cat-panel" 
        style={{ 
          maxHeight: isOpen ? `${filteredItems.length * 128 + 24}px` : 0 
        }}
      >
        {isOpen && (
          <ul className="md-items">
            {category.loading ? (
              // Skeleton loading mientras cargan los items
              <li className="md-item-skeleton">
                <div className="skeleton-wrapper">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-price"></div>
                    <div className="skeleton-desc"></div>
                  </div>
                </div>
              </li>
            ) : category.error ? (
              // Error state
              <li className="md-item-error">
                <p>❌ Error cargando items: {category.error}</p>
                <button onClick={() => onToggle(category.id)}>
                  Reintentar
                </button>
              </li>
            ) : filteredItems.length === 0 ? (
              // Empty state
              <li className="md-item-empty">
                <p>{normalizedSearch ? '🔎 No hay resultados en esta categoría' : '📭 No hay items en esta categoría'}</p>
              </li>
            ) : (
              // Items normales
              filteredItems.map((item) => (
                <li key={item.id} className="md-item">
                  <div className="md-item-media">
                    <img 
                      src={item.img || grooveLogo} 
                      alt={item.name}
                      className={`md-item-image ${!item.img ? 'placeholder' : ''}`}
                      style={{ cursor: item.img ? 'pointer' : 'default' }}
                      onClick={() => item.img && onImageClick(item)}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = grooveLogo;
                        e.target.className = 'md-item-image placeholder';
                      }}
                    />
                  </div>
                  <div className="md-item-body">
                    <div className="md-item-row">
                      <h4 className="md-item-name">{item.name}</h4>
                      <span className="md-item-price">{item.price}</span>
                    </div>
                    <p className="md-item-desc">{item.desc}</p>
                    
                    {/* Stock information */}
                    {item.trackStock && (
                      <div className="md-item-stock">
                        {item.stock > 0 ? (
                          <span className={`stock-indicator ${item.stock <= 5 ? 'low' : 'normal'}`}>
                            {item.stock <= 5 ? `Quedan ${item.stock}` : 'Disponible'}
                          </span>
                        ) : (
                          <span className="stock-indicator out">Sin stock</span>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export const MenuDropdownOptimized = ({ menuType, autoScroll = true }) => {
  const sectionRef = useRef(null);
  const { menuSDK, isInitialized, error: firebaseError } = useFirebase();
  const { grooveMenus, loading: menusLoading } = useGrooveMenus(menuSDK);
  
  // Hook optimizado para lazy loading de categorías
  const { 
    categories, 
    loading: categoriesLoading, 
    error: categoriesError,
    loadCategoryItems
  } = useMenuCategoriesLazy(menuSDK, menuType);
  
  // Hook para gestión inteligente de expansión
  const { toggleCategory } = useSmartCategoryExpansion(
    categories, 
    loadCategoryItems, 
    menuType
  );
  
  // Estado local para controlar qué categoría está abierta (solo una a la vez)
  const [openCat, setOpenCat] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [hasScrolledToMenu, setHasScrolledToMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const visibleCategories = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return categories;

    return categories.filter((category) => {
      const categoryMatch = category.name?.toLowerCase().includes(normalizedSearch);
      const itemMatch = category.items?.some((item) =>
        [item.name, item.desc, item.price]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(normalizedSearch))
      );
      return categoryMatch || itemMatch;
    });
  }, [categories, searchTerm]);

  // Información del menú
  const menuInfo = useMemo(() => {
    if (menusLoading || !isInitialized || !grooveMenus[menuType]) return null;
    return grooveMenus[menuType];
  }, [grooveMenus, menuType, menusLoading, isInitialized]);

  // Estados de carga combinados
  const loading = menusLoading || categoriesLoading;

  // Resetear categoría abierta cuando cambie el tipo de menú
  useEffect(() => {
    setOpenCat(null);
    setHasScrolledToMenu(false); // Reset scroll flag when menu changes
    setSearchTerm('');
  }, [menuType]);

  // Auto-scroll cuando se cargan las categorías (solo la primera vez para cada menú y si autoScroll está habilitado)
  useEffect(() => {
    if (autoScroll && sectionRef.current && categories && categories.length > 0 && !hasScrolledToMenu) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHasScrolledToMenu(true);
    }
  }, [categories, hasScrolledToMenu, autoScroll]);

  // Función para toggle de categorías (solo una abierta a la vez)
  const handleToggleCategory = (categoryId) => {
    // Si la categoría ya está abierta, cerrarla
    if (openCat === categoryId) {
      setOpenCat(null);
    } else {
      // Abrir la nueva categoría (cerrando cualquier otra)
      setOpenCat(categoryId);
      // También activar la carga de items si es necesario
      toggleCategory(categoryId);
      
      // Scroll suave hacia la categoría que se está abriendo después de un pequeño delay
      // Este scroll siempre debe funcionar independientemente de autoScroll inicial
      setTimeout(() => {
        const categoryElement = document.getElementById(`category-${categoryId}`);
        if (categoryElement) {
          // Si no se ha hecho scroll inicial al menú y autoScroll está deshabilitado,
          // hacer scroll al menú primero, luego a la categoría
          if (!hasScrolledToMenu && !autoScroll && sectionRef.current) {
            sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setHasScrolledToMenu(true);
            // Esperar un poco más para el scroll a la categoría
            setTimeout(() => {
              categoryElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
              });
            }, 300);
          } else {
            // Scroll normal a la categoría
            categoryElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
          }
        }
      }, 100);
    }
  };

  const handleImageClick = (item) => {
    setSelectedItem(item);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedItem(null);
  };

  // Estados de carga y error
  if (!isInitialized) {
    return (
      <section className="menu-dropdown">
        <div className="md-container">
          <div className="loading-state">
            <div className="simple-loader"></div>
            <p>Inicializando...</p>
          </div>
        </div>
      </section>
    );
  }

  if (firebaseError) {
    return (
      <section className="menu-dropdown">
        <div className="md-container">
          <div className="error-state">
            <p>❌ Error de conexión: {firebaseError}</p>
            <p>Por favor, intenta recargar la página.</p>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="menu-dropdown">
        <div className="md-container">
          <div className="loading-state">
            <div className="simple-loader"></div>
            <p>Cargando categorías...</p>
          </div>
        </div>
      </section>
    );
  }

  if (categoriesError) {
    return (
      <section className="menu-dropdown">
        <div className="md-container">
          <div className="error-state">
            <p>❌ Error cargando menú: {categoriesError}</p>
            <p>Por favor, intenta nuevamente.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <section className="menu-dropdown">
        <div className="md-container">
          <div className="empty-state">
            <p>📭 No hay categorías disponibles en este menú.</p>
            <p>Intenta seleccionar otro menú.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="menu-dropdown">
      <div className="md-container">
        <h2 className="md-title">{menuInfo?.title || 'Menú'}</h2>

        <div className="md-search" role="search" aria-label="Búsqueda instantánea del menú">
          <div className="md-search__control">
            <FaSearch className="md-search__icon" aria-hidden="true" />
            <input
              id="menu-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar en el menú"
              aria-label="Buscar en el menú"
              className="md-search__input"
            />
          </div>
        </div>
        
        <div className="md-list">
          {visibleCategories.map(category => (
            <LazyCategory
              key={category.id}
              category={category}
              isOpen={openCat === category.id}
              isLoading={category.loading}
              onToggle={handleToggleCategory}
              onImageClick={handleImageClick}
              searchTerm={searchTerm}
            />
          ))}

          {searchTerm.trim() && visibleCategories.length === 0 && (
            <div className="md-search-empty">
              <p>Sin resultados para “{searchTerm}”. Probá con otra palabra clave.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal para imagen ampliada */}
      <Modal 
        isOpen={showImageModal} 
        onClose={closeImageModal}
        className="image-modal"
      >
        {selectedItem && (
          <div className="image-modal-content">
            <img 
              src={selectedItem.img} 
              alt={selectedItem.name}
              className="modal-enlarged-image"
            />
            <div className="image-modal-info">
              <h3 className="modal-item-name">{selectedItem.name}</h3>
              <p className="modal-item-price">{selectedItem.price}</p>
              {selectedItem.desc && (
                <p className="modal-item-desc">{selectedItem.desc}</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};

export default MenuDropdownOptimized;
