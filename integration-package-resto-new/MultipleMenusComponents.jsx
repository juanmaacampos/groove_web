/**
 * 🏆 COMPONENTES PARA MÚLTIPLES MENÚS
 * Componentes React para mostrar y navegar entre múltiples menús
 */
import React, { useState } from 'react';
import { useMultipleMenus, useCartWithMultipleMenus } from './useMultipleMenus.js';

/**
 * 📋 Selector de Menús - Permite elegir entre los menús disponibles
 */
export function MenuSelector({ menus, currentMenuId, onSelectMenu, terminology, className = "" }) {
  if (!menus || menus.length <= 1) {
    return null; // No mostrar selector si solo hay un menú o ninguno
  }

  return (
    <div className={`menu-selector ${className}`}>
      <h2>📋 Selecciona un {terminology.menuSingular}</h2>
      <div className="menu-cards">
        {menus.map(menu => (
          <div
            key={menu.id}
            className={`menu-card ${currentMenuId === menu.id ? 'selected' : ''}`}
            onClick={() => onSelectMenu(menu.id)}
          >
            <div className="menu-card-header">
              <h3>{menu.name}</h3>
              {currentMenuId === menu.id && (
                <span className="selected-badge">✓ Actual</span>
              )}
            </div>
            
            {menu.description && (
              <p className="menu-description">{menu.description}</p>
            )}
            
            <div className="menu-meta">
              <span className="categories-count">
                {menu.categoriesCount || 0} {terminology.categoryPlural}
              </span>
              {menu.active && (
                <span className="active-badge">Activo</span>
              )}
            </div>
            
            <div className="menu-card-footer">
              {currentMenuId === menu.id ? (
                <span className="current-indicator">Menú actual</span>
              ) : (
                <span className="select-action">Hacer clic para cambiar</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 📂 Navegador de Categorías con Acordeón
 */
export function CategoryAccordion({ categories, onAddToCart, terminology, showImages = true }) {
  const [openCategories, setOpenCategories] = useState(new Set());

  const toggleCategory = (categoryId) => {
    setOpenCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  if (!categories || categories.length === 0) {
    return (
      <div className="no-categories">
        <p>No hay {terminology.categoryPlural} disponibles en este {terminology.menuSingular}</p>
      </div>
    );
  }

  return (
    <div className="category-accordion">
      {categories.map(category => (
        <div 
          key={category.id} 
          className={`category-section ${openCategories.has(category.id) ? 'open' : ''}`}
        >
          <button
            className="category-header"
            onClick={() => toggleCategory(category.id)}
            aria-expanded={openCategories.has(category.id)}
          >
            <h3>{category.name}</h3>
            <span className="toggle-icon">
              {openCategories.has(category.id) ? '▼' : '▶'}
            </span>
            <span className="items-count">
              ({category.items.length} {category.items.length === 1 ? terminology.itemSingular : terminology.itemPlural})
            </span>
          </button>
          
          {openCategories.has(category.id) && (
            <div className="category-content">
              <ProductGrid 
                items={category.items}
                onAddToCart={onAddToCart}
                terminology={terminology}
                showImages={showImages}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * 🎯 Grid de Productos
 */
export function ProductGrid({ items, onAddToCart, terminology, showImages = true, className = "" }) {
  if (!items || items.length === 0) {
    return (
      <div className="no-items">
        <p>No hay {terminology.itemPlural} disponibles</p>
      </div>
    );
  }

  return (
    <div className={`product-grid ${className}`}>
      {items.map(item => (
        <ProductCard
          key={item.id}
          item={item}
          onAddToCart={onAddToCart}
          terminology={terminology}
          showImage={showImages}
        />
      ))}
    </div>
  );
}

/**
 * 🍽️ Tarjeta de Producto Individual
 */
export function ProductCard({ item, onAddToCart, terminology, showImage = true, className = "" }) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart(item, quantity);
    setQuantity(1); // Reset quantity after adding
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  // Determinar la imagen a mostrar
  const getItemImage = () => {
    if (item.images && item.images.length > 0) {
      return item.images[0]; // Primera imagen del array
    }
    return item.imageUrl || null; // Fallback a imageUrl legacy
  };

  const itemImage = getItemImage();

  return (
    <div className={`product-card ${!item.isAvailable ? 'unavailable' : ''} ${className}`}>
      {showImage && itemImage && (
        <div className="product-image">
          <img 
            src={itemImage} 
            alt={item.name}
            onError={handleImageError}
            loading="lazy"
          />
        </div>
      )}
      
      <div className="product-info">
        <h4 className="product-name">{item.name}</h4>
        
        {item.description && (
          <p className="product-description">{item.description}</p>
        )}
        
        <div className="product-details">
          <span className="product-price">
            ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
          </span>
          
          {item.menuName && (
            <span className="product-menu-origin">
              📋 {item.menuName}
            </span>
          )}
        </div>
        
        {item.isAvailable !== false ? (
          <div className="product-actions">
            <div className="quantity-selector">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="quantity">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
            
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCart}
            >
              {terminology.addToCartText}
            </button>
          </div>
        ) : (
          <div className="unavailable-notice">
            No disponible
          </div>
        )}
        
        {item.isFeatured && (
          <div className="featured-badge">⭐ Destacado</div>
        )}
      </div>
    </div>
  );
}

/**
 * 🛒 Carrito Flotante para Múltiples Menús
 */
export function MultiMenuCart({ 
  cart, 
  cartTotal, 
  cartCount, 
  cartByMenu,
  onRemoveItem, 
  onUpdateQuantity,
  onClearCart,
  terminology,
  showMenuOrigin = true,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (cartCount === 0) {
    return null;
  }

  return (
    <div className={`multi-menu-cart floating ${isOpen ? 'open' : ''} ${className}`}>
      {/* Botón flotante */}
      <button 
        className="cart-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        🛒 {cartCount} {cartCount === 1 ? terminology.itemSingular : terminology.itemPlural}
        <span className="cart-total">${cartTotal.toFixed(2)}</span>
      </button>
      
      {/* Contenido del carrito */}
      {isOpen && (
        <div className="cart-content">
          <div className="cart-header">
            <h3>Tu {terminology.cartName}</h3>
            <button 
              className="close-cart"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="cart-items">
            {showMenuOrigin && cartByMenu ? (
              // Mostrar agrupado por menú
              Object.values(cartByMenu).map(menuGroup => (
                <div key={menuGroup.menuId} className="menu-group">
                  <h4 className="menu-group-title">
                    📋 {menuGroup.menuName}
                    <span className="menu-total">${menuGroup.total.toFixed(2)}</span>
                  </h4>
                  {menuGroup.items.map(cartItem => (
                    <CartItem
                      key={`${cartItem.item.id}-${cartItem.item.menuId}`}
                      cartItem={cartItem}
                      onRemove={() => onRemoveItem(cartItem.item.id, cartItem.item.menuId)}
                      onUpdateQuantity={(newQuantity) => 
                        onUpdateQuantity(cartItem.item.id, newQuantity, cartItem.item.menuId)
                      }
                    />
                  ))}
                </div>
              ))
            ) : (
              // Mostrar lista simple
              cart.map(cartItem => (
                <CartItem
                  key={`${cartItem.item.id}-${cartItem.item.menuId || 'no-menu'}`}
                  cartItem={cartItem}
                  onRemove={() => onRemoveItem(cartItem.item.id, cartItem.item.menuId)}
                  onUpdateQuantity={(newQuantity) => 
                    onUpdateQuantity(cartItem.item.id, newQuantity, cartItem.item.menuId)
                  }
                />
              ))
            )}
          </div>
          
          <div className="cart-footer">
            <div className="cart-total-section">
              <strong>Total: ${cartTotal.toFixed(2)}</strong>
            </div>
            
            <div className="cart-actions">
              <button 
                className="clear-cart-btn"
                onClick={onClearCart}
              >
                Vaciar {terminology.cartName}
              </button>
              
              <button className="checkout-btn">
                Proceder al pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 🛍️ Item individual del carrito
 */
function CartItem({ cartItem, onRemove, onUpdateQuantity }) {
  return (
    <div className="cart-item">
      <div className="item-info">
        <h5>{cartItem.item.name}</h5>
        <span className="item-price">${cartItem.item.price.toFixed(2)}</span>
      </div>
      
      <div className="item-controls">
        <div className="quantity-controls">
          <button 
            onClick={() => onUpdateQuantity(cartItem.quantity - 1)}
            disabled={cartItem.quantity <= 1}
          >
            -
          </button>
          <span>{cartItem.quantity}</span>
          <button onClick={() => onUpdateQuantity(cartItem.quantity + 1)}>
            +
          </button>
        </div>
        
        <button 
          className="remove-item"
          onClick={onRemove}
          title="Eliminar del carrito"
        >
          🗑️
        </button>
      </div>
      
      <div className="item-total">
        ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
      </div>
    </div>
  );
}

/**
 * 📱 Página Principal de Múltiples Menús
 */
export function MultipleMenusPage({ menuSDK, config }) {
  const {
    menus,
    currentMenuId,
    currentMenu,
    businessInfo,
    loading,
    error,
    switchToMenu,
    terminology
  } = useMultipleMenus(menuSDK);

  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    cartByMenu
  } = useCartWithMultipleMenus(
    config?.cart?.persistBetweenMenus,
    config?.cart?.showMenuOrigin
  );

  if (loading) {
    return (
      <div className="multiple-menus-loading">
        <div className="loading-spinner"></div>
        <p>Cargando {terminology.menuPlural}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="multiple-menus-error">
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Intentar nuevamente
        </button>
      </div>
    );
  }

  if (!menus || menus.length === 0) {
    return (
      <div className="no-menus">
        <h2>📋 No hay {terminology.menuPlural} disponibles</h2>
        <p>Contacta al administrador del negocio</p>
      </div>
    );
  }

  return (
    <div className="multiple-menus-page">
      {/* Información del negocio */}
      {businessInfo && (
        <div className="business-header">
          <h1>{businessInfo.name}</h1>
          {businessInfo.description && (
            <p className="business-description">{businessInfo.description}</p>
          )}
        </div>
      )}

      {/* Selector de menús (si hay más de uno) */}
      <MenuSelector
        menus={menus}
        currentMenuId={currentMenuId}
        onSelectMenu={switchToMenu}
        terminology={terminology}
      />

      {/* Menú actual */}
      {currentMenu && (
        <div className="current-menu">
          <div className="menu-header">
            <h2>📋 {currentMenu.menuInfo?.name}</h2>
            {currentMenu.menuInfo?.description && (
              <p className="menu-description">{currentMenu.menuInfo.description}</p>
            )}
          </div>

          {/* Navegación por categorías */}
          <CategoryAccordion
            categories={currentMenu.categories}
            onAddToCart={addToCart}
            terminology={terminology}
            showImages={config?.multipleMenus?.ui?.showProductImages}
          />
        </div>
      )}

      {/* Carrito flotante */}
      <MultiMenuCart
        cart={cart}
        cartTotal={cartTotal}
        cartCount={cartCount}
        cartByMenu={cartByMenu}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onClearCart={clearCart}
        terminology={terminology}
        showMenuOrigin={config?.cart?.showMenuOrigin}
      />
    </div>
  );
}
