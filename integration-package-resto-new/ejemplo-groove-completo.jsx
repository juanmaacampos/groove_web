/**
 * 🍽️ EJEMPLO COMPLETO - IMPLEMENTACIÓN GROOVE v3.0
 * Ejemplo real basado en la implementación exitosa del proyecto Groove
 * 
 * CARACTERÍSTICAS:
 * ✅ Múltiples menús dinámicos desde Firebase
 * ✅ Estructura nueva: businesses/{id}/menus/{menuId}/categories/{categoryId}/items
 * ✅ Hooks especializados para cada funcionalidad
 * ✅ Carrito con validación de stock
 * ✅ Diseño responsive y moderno
 */

import React, { useState } from 'react';
import { createMenuSDK } from './menu-sdk-v3.js';
import { useGrooveMenus, useMenuCategories, useCart } from './useMenu-v3.js';
import { MENU_CONFIG } from './config.js';
import './MenuComponents.css';

// 🎯 COMPONENTE PRINCIPAL - Implementación completa
export function GrooveRestaurantApp() {
  // Crear instancia del SDK
  const menuSDK = React.useMemo(() => 
    createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId),
    []
  );

  return (
    <div className="groove-restaurant-app">
      <RestaurantHeader />
      <MenuSystem menuSDK={menuSDK} />
    </div>
  );
}

// 🏠 Header del restaurante
function RestaurantHeader() {
  return (
    <header className="restaurant-header">
      <div className="container">
        <div className="header-content">
          <img src="/groove-logo.svg" alt="Groove" className="logo" />
          <div className="header-text">
            <h1>Groove Restaurant</h1>
            <p>Menús dinámicos desde Firebase CMS</p>
          </div>
        </div>
      </div>
    </header>
  );
}

// 🍽️ Sistema de menús principal
function MenuSystem({ menuSDK }) {
  const [selectedMenu, setSelectedMenu] = useState(null);
  
  // Cargar lista de menús disponibles
  const { menus, loading: menusLoading, error: menusError } = useGrooveMenus(menuSDK);
  
  // Cargar categorías del menú seleccionado
  const { categories, loading: categoriesLoading, error: categoriesError } = useMenuCategories(menuSDK, selectedMenu);
  
  // Carrito con validación de stock
  const { cart, addToCart, removeFromCart, cartTotal, cartCount, validationErrors } = useCart(menuSDK);

  // Estados de carga
  if (menusLoading) {
    return <LoadingState message="Cargando menús disponibles..." />;
  }

  if (menusError) {
    return <ErrorState message={menusError} />;
  }

  // Auto-seleccionar primer menú si no hay uno seleccionado
  React.useEffect(() => {
    if (menus.length > 0 && !selectedMenu) {
      setSelectedMenu(menus[0].id);
    }
  }, [menus, selectedMenu]);

  return (
    <div className="menu-system">
      <div className="container">
        {/* Selector de menús */}
        {menus.length > 1 && (
          <MenuSelector 
            menus={menus}
            selectedMenu={selectedMenu}
            onSelectMenu={setSelectedMenu}
          />
        )}

        {/* Contenido del menú */}
        <div className="menu-content">
          <main className="menu-main">
            {selectedMenu ? (
              categoriesLoading ? (
                <LoadingState message={`Cargando ${menus.find(m => m.id === selectedMenu)?.name || 'menú'}...`} />
              ) : categoriesError ? (
                <ErrorState message={categoriesError} />
              ) : (
                <MenuCategories 
                  categories={categories}
                  onAddToCart={addToCart}
                  menuName={menus.find(m => m.id === selectedMenu)?.name}
                />
              )
            ) : (
              <div className="no-menu-selected">
                <p>Selecciona un menú para comenzar</p>
              </div>
            )}
          </main>

          {/* Carrito flotante */}
          <CartSidebar 
            cart={cart}
            cartTotal={cartTotal}
            cartCount={cartCount}
            onRemoveItem={removeFromCart}
            validationErrors={validationErrors}
          />
        </div>
      </div>
    </div>
  );
}

// 📋 Selector de menús
function MenuSelector({ menus, selectedMenu, onSelectMenu }) {
  return (
    <div className="menu-selector">
      <h2>Nuestros Menús</h2>
      <div className="menu-cards">
        {menus.map(menu => (
          <div
            key={menu.id}
            className={`menu-card ${selectedMenu === menu.id ? 'selected' : ''}`}
            onClick={() => onSelectMenu(menu.id)}
          >
            <div className="menu-card-header">
              <h3>{menu.name}</h3>
              {selectedMenu === menu.id && <span className="selected-badge">Seleccionado</span>}
            </div>
            {menu.description && (
              <p className="menu-description">{menu.description}</p>
            )}
            <div className="menu-card-footer">
              <span className="select-action">
                {selectedMenu === menu.id ? 'Ver menú' : 'Seleccionar'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 📂 Categorías del menú con acordeón
function MenuCategories({ categories, onAddToCart, menuName }) {
  const [openCategories, setOpenCategories] = useState(new Set([categories[0]?.id].filter(Boolean)));

  const toggleCategory = (categoryId) => {
    const newOpen = new Set(openCategories);
    if (newOpen.has(categoryId)) {
      newOpen.delete(categoryId);
    } else {
      newOpen.add(categoryId);
    }
    setOpenCategories(newOpen);
  };

  if (categories.length === 0) {
    return (
      <div className="no-items">
        <h3>No hay elementos disponibles</h3>
        <p>Este menú no tiene productos disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div className="menu-categories">
      {menuName && <h2 className="menu-title">{menuName}</h2>}
      
      <div className="category-accordion">
        {categories.map(category => (
          <div 
            key={category.id} 
            className={`category-section ${openCategories.has(category.id) ? 'open' : ''}`}
          >
            <div 
              className="category-header"
              onClick={() => toggleCategory(category.id)}
            >
              <h3>{category.name}</h3>
              <div className="category-meta">
                <span className="items-count">{category.items.length} productos</span>
                <span className="toggle-icon">
                  {openCategories.has(category.id) ? '−' : '+'}
                </span>
              </div>
            </div>
            
            {openCategories.has(category.id) && (
              <div className="category-content">
                <div className="product-grid">
                  {category.items.map(item => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      onAddToCart={onAddToCart}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 🍽️ Tarjeta de producto individual
function ProductCard({ item, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(item, quantity);
    setQuantity(1); // Reset quantity after adding
  };

  const isAvailable = item.isAvailable !== false && !item.isHidden;
  const hasStock = !item.trackStock || item.stock > 0;
  const canOrder = isAvailable && hasStock;

  return (
    <div className={`product-card ${!canOrder ? 'unavailable' : ''}`}>
      {/* Imagen del producto */}
      <div className="product-image">
        {item.images && item.images.length > 0 && !imageError ? (
          <img 
            src={item.images[0]} 
            alt={item.name}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="image-placeholder">
            🍽️
          </div>
        )}
        
        {/* Indicador de múltiples imágenes */}
        {item.images && item.images.length > 1 && (
          <div className="image-count">+{item.images.length - 1}</div>
        )}
        
        {/* Indicador de stock */}
        {item.trackStock && (
          <div className={`stock-indicator ${item.stock <= 5 ? 'low' : item.stock <= 0 ? 'out' : ''}`}>
            {item.stock <= 0 ? 'Agotado' : item.stock <= 5 ? `Quedan ${item.stock}` : 'Disponible'}
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="product-info">
        <h4 className="product-name">{item.name}</h4>
        
        {item.description && (
          <p className="product-description">{item.description}</p>
        )}
        
        <div className="product-details">
          <span className="product-price">${item.price}</span>
          
          {item.isFeatured && <span className="featured-badge">⭐ Destacado</span>}
        </div>

        {/* Controles de cantidad y botón agregar */}
        {canOrder && (
          <div className="product-actions">
            <div className="quantity-selector">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="quantity">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                disabled={item.trackStock && quantity >= item.stock}
              >
                +
              </button>
            </div>
            
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCart}
            >
              Agregar ${(item.price * quantity).toFixed(2)}
            </button>
          </div>
        )}

        {!canOrder && (
          <div className="unavailable-message">
            {!isAvailable ? 'No disponible' : 'Sin stock'}
          </div>
        )}
      </div>
    </div>
  );
}

// 🛒 Carrito lateral
function CartSidebar({ cart, cartTotal, cartCount, onRemoveItem, validationErrors }) {
  const [isOpen, setIsOpen] = useState(false);

  if (cartCount === 0) {
    return (
      <div className="cart-sidebar empty">
        <div className="cart-header">
          <h3>🛒 Carrito</h3>
        </div>
        <div className="empty-cart">
          <p>Tu carrito está vacío</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="cart-header" onClick={() => setIsOpen(!isOpen)}>
        <h3>🛒 Carrito ({cartCount})</h3>
        <span className="cart-toggle">{isOpen ? '×' : '→'}</span>
      </div>

      {isOpen && (
        <div className="cart-content">
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>Cantidad: {item.quantity}</p>
                  <p className="item-price">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => onRemoveItem(item.id)}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {validationErrors.length > 0 && (
            <div className="validation-errors">
              <h4>⚠️ Errores de stock:</h4>
              {validationErrors.map((error, index) => (
                <p key={index} className="error">{error.message}</p>
              ))}
            </div>
          )}

          <div className="cart-footer">
            <div className="cart-total">
              <strong>Total: ${cartTotal.toFixed(2)}</strong>
            </div>
            <button className="checkout-btn">
              Proceder al pago
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 📡 Estados de carga
function LoadingState({ message }) {
  return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}

// ❌ Estados de error
function ErrorState({ message }) {
  return (
    <div className="error-state">
      <h3>❌ Error</h3>
      <p>{message}</p>
      <button onClick={() => window.location.reload()}>
        Reintentar
      </button>
    </div>
  );
}

// 🎨 Estilos adicionales específicos para el ejemplo
const additionalStyles = `
.groove-restaurant-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.restaurant-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  width: 50px;
  height: 50px;
}

.header-text h1 {
  color: white;
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.header-text p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.menu-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  padding: 2rem 0;
}

@media (max-width: 768px) {
  .menu-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .cart-sidebar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid #ddd;
    z-index: 1000;
  }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.image-count {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.stock-indicator {
  position: absolute;
  bottom: 8px;
  left: 8px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background: #10b981;
  color: white;
}

.stock-indicator.low {
  background: #f59e0b;
}

.stock-indicator.out {
  background: #ef4444;
}

.featured-badge {
  background: #fbbf24;
  color: #92400e;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = additionalStyles;
  document.head.appendChild(styleSheet);
}

// 🚀 Exportar componente principal
export default GrooveRestaurantApp;
