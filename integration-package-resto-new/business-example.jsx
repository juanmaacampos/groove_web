/**
 * Ejemplo moderno usando el sistema de businesses
 * Soporta tanto restaurantes como tiendas con terminología dinámica
 */
import React from 'react';
import { createMenuSDK } from './menu-sdk.js';
import { MenuDisplay, CategoryNav, FeaturedItems } from './MenuComponents.jsx';
import { useMenuWithTerminology, useCart, useMenu } from './useMenu.js';
import { MENU_CONFIG } from './config.js';
import './MenuComponents.css';

// Componente principal que se adapta al tipo de negocio
function ModernBusinessPage() {
  // Usar businessId o restaurantId (ambos funcionan)
  const businessId = MENU_CONFIG.businessId || MENU_CONFIG.restaurantId;
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, businessId);
  
  // Hook que incluye terminología dinámica
  const { business, menu, loading, error, terminology } = useMenuWithTerminology(menuSDK);
  const { cart, addToCart, removeFromCart, cartTotal, cartCount } = useCart();

  if (loading) return <div className="loading">Cargando {terminology.menuName || 'menú'}...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="business-page">
      {/* Header adaptable */}
      <BusinessHeader business={business} terminology={terminology} />
      
      {/* Navegación de categorías */}
      <CategoryNav categories={menu} terminology={terminology} />
      
      {/* Productos/Platos destacados */}
      <FeaturedItems 
        menu={menu} 
        onAddToCart={addToCart}
        terminology={terminology}
      />
      
      {/* Menú completo */}
      <MenuDisplay 
        menu={menu}
        onAddToCart={addToCart}
        terminology={terminology}
        showImages={true}
      />
      
      {/* Carrito flotante */}
      <CartSummary 
        cart={cart} 
        cartTotal={cartTotal} 
        cartCount={cartCount}
        onRemoveItem={removeFromCart}
        terminology={terminology}
      />
    </div>
  );
}

// Componente de header que se adapta al tipo de negocio
function BusinessHeader({ business, terminology }) {
  const businessType = business?.businessType || 'restaurant';
  const icon = businessType === 'store' ? '🏪' : '🍽️';
  
  return (
    <header className="business-header">
      <div className="business-info">
        <h1>{icon} {business?.name}</h1>
        <p className="business-type">{terminology.businessName}</p>
        {business?.address && <p className="address">📍 {business.address}</p>}
      </div>
      
      {/* Opciones de servicio adaptables */}
      <div className="service-options">
        <h3>Opciones de {businessType === 'store' ? 'Envío' : 'Servicio'}</h3>
        <div className="options-grid">
          {Object.entries(business?.serviceOptions || {}).map(([key, enabled]) => {
            if (!enabled) return null;
            const label = terminology.serviceOptions?.[key] || key;
            return (
              <span key={key} className="service-option">
                ✅ {label}
              </span>
            );
          })}
        </div>
      </div>
    </header>
  );
}

// Componente de resumen del carrito adaptable
function CartSummary({ cart, cartTotal, cartCount, onRemoveItem, terminology }) {
  if (cartCount === 0) return null;

  return (
    <div className="cart-summary">
      <h3>
        {terminology.orderSummary || 'Resumen del Pedido'} 
        ({cartCount} {cartCount === 1 ? terminology.itemSingular : terminology.items})
      </h3>
      
      <div className="cart-items">
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <span>{item.name} x{item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
            <button onClick={() => onRemoveItem(item.id)}>❌</button>
          </div>
        ))}
      </div>
      
      <div className="cart-total">
        <strong>Total: ${cartTotal.toFixed(2)}</strong>
      </div>
      
      <button className="place-order-btn">
        {terminology.placeOrder || 'Realizar Pedido'}
      </button>
    </div>
  );
}

// Ejemplo de compatibilidad hacia atrás
function LegacyRestaurantPage() {
  // Código existente que usa restaurantId
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);
  const { restaurant, menu, loading, error } = useMenu(menuSDK);
  const { cart, addToCart } = useCart();

  // Esto sigue funcionando exactamente igual
  return (
    <div className="restaurant-page">
      <h1>{restaurant?.name}</h1>
      <MenuDisplay 
        menu={menu}
        onAddToCart={addToCart}
        loading={loading}
        error={error}
      />
    </div>
  );
}

export default ModernBusinessPage;
export { LegacyRestaurantPage };
