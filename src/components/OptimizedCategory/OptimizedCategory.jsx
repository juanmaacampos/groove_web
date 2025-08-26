import React, { memo, useMemo, useCallback, useState } from 'react';
import { useVirtualScroll } from '../hooks/useMenuOptimization.js';
import OptimizedMenuItem from '../OptimizedMenuItem/OptimizedMenuItem.jsx';

/**
 * 🚀 COMPONENTE CATEGORÍA OPTIMIZADA
 * Versión optimizada con virtualización para muchos items
 */

const OptimizedCategory = memo(({
  category,
  isOpen,
  onToggle,
  onImageClick,
  optimizationConfig = {},
  maxHeight = 600
}) => {
  const [showAllItems, setShowAllItems] = useState(false);
  
  // Configuración por defecto
  const config = {
    useVirtualScroll: false,
    maxInitialItems: 20,
    batchSize: 10,
    ...optimizationConfig
  };

  // Determinar qué items mostrar
  const displayItems = useMemo(() => {
    if (!isOpen) return [];
    
    const items = category.items || [];
    
    // Si hay pocos items, mostrar todos
    if (items.length <= config.maxInitialItems) {
      return items;
    }
    
    // Si no queremos mostrar todos, usar límite inicial
    if (!showAllItems) {
      return items.slice(0, config.maxInitialItems);
    }
    
    return items;
  }, [category.items, isOpen, showAllItems, config.maxInitialItems]);

  // Virtual scroll para listas muy largas
  const virtualScroll = useVirtualScroll(
    displayItems,
    128, // altura aproximada de cada item
    maxHeight
  );

  // Usar virtual scroll solo para listas muy largas
  const shouldUseVirtualScroll = config.useVirtualScroll && displayItems.length > 50;

  const handleToggle = useCallback(() => {
    onToggle(category.id);
  }, [category.id, onToggle]);

  const handleLoadMore = useCallback(() => {
    setShowAllItems(true);
  }, []);

  // Cálculo de altura dinámica optimizada
  const panelHeight = useMemo(() => {
    if (!isOpen) return 0;
    
    const itemCount = displayItems.length;
    const itemHeight = 128;
    const padding = 24;
    
    if (shouldUseVirtualScroll) {
      return Math.min(maxHeight, itemCount * itemHeight + padding);
    }
    
    return itemCount * itemHeight + padding;
  }, [isOpen, displayItems.length, shouldUseVirtualScroll, maxHeight]);

  const renderItems = () => {
    if (shouldUseVirtualScroll) {
      return (
        <div 
          className="virtual-scroll-container"
          style={{ height: maxHeight, overflowY: 'auto' }}
          onScroll={virtualScroll.handleScroll}
        >
          <div style={{ height: virtualScroll.totalHeight, position: 'relative' }}>
            {virtualScroll.visibleItems.map(item => (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  top: item.offsetTop,
                  left: 0,
                  right: 0,
                  height: 128
                }}
              >
                <OptimizedMenuItem
                  item={item}
                  onImageClick={onImageClick}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Renderizado normal para listas pequeñas/medianas
    return (
      <ul className="md-items">
        {displayItems.map(item => (
          <OptimizedMenuItem
            key={item.id}
            item={item}
            onImageClick={onImageClick}
          />
        ))}
        
        {/* Botón "Cargar más" si hay más items */}
        {!showAllItems && category.items.length > config.maxInitialItems && (
          <li className="md-item load-more">
            <button 
              className="load-more-button"
              onClick={handleLoadMore}
            >
              Ver más items ({category.items.length - config.maxInitialItems} restantes)
            </button>
          </li>
        )}
      </ul>
    );
  };

  return (
    <div className={`md-cat optimized ${isOpen ? 'open' : ''}`}>
      <button 
        className="md-cat-header" 
        onClick={handleToggle} 
        aria-expanded={isOpen}
      >
        <span className="md-cat-name">
          {category.name}
          {category.items.length > 0 && (
            <span className="md-cat-count">({category.items.length})</span>
          )}
        </span>
        <span className="md-cat-arrow" aria-hidden>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M6 9L12 15L18 9" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      
      <div 
        className="md-cat-panel" 
        style={{ 
          maxHeight: isOpen ? `${panelHeight}px` : 0,
          transition: 'max-height 0.3s ease-in-out'
        }}
      >
        {renderItems()}
      </div>
    </div>
  );
});

OptimizedCategory.displayName = 'OptimizedCategory';

export default OptimizedCategory;
