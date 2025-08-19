/**
 * 🆕 EJEMPLO MODERNO - Sistema de Businesses
 * Este ejemplo muestra cómo usar el nuevo sistema unificado que soporta
 * tanto restaurantes 🍽️ como tiendas 🏪 con terminología dinámica
 */
import React from 'react';
import { createMenuSDK } from './menu-sdk.js';
import { MenuDisplay, CategoryNav, FeaturedItems } from './MenuComponents.jsx';
import { useMenuWithTerminology, useCart } from './useMenu.js';
import { MENU_CONFIG } from './config.js';
import './MenuComponents.css';

// 🏆 EJEMPLO PRINCIPAL - Se adapta automáticamente al tipo de negocio
function ModernBusinessPage() {
  // ✅ Funciona con businessId o restaurantId
  const businessId = MENU_CONFIG.businessId || MENU_CONFIG.restaurantId;
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, businessId);
  
  // 🎯 Hook que incluye terminología dinámica automática
  const { business, menu, loading, error, terminology } = useMenuWithTerminology(menuSDK);
  const { cart, addToCart, removeFromCart, cartTotal, cartCount } = useCart();

  if (loading) return <div className="loading">Cargando {terminology.menuName || 'contenido'}...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="modern-business-page">
      {/* 🎨 Header que se adapta: Restaurante vs Tienda */}
      <AdaptiveHeader business={business} terminology={terminology} />
      
      {/* 📋 Navegación de categorías */}
      <CategoryNav 
        categories={menu} 
        terminology={terminology}
        className="category-nav-modern"
      />
      
      {/* ⭐ Productos/Platos destacados */}
      <section className="featured-section">
        <h2>
          {terminology.featuredProducts || 'Destacados'} ⭐
        </h2>
        <FeaturedItems 
          menu={menu} 
          onAddToCart={addToCart}
          terminology={terminology}
          showPrices={true}
        />
      </section>
      
      {/* 📦 Catálogo/Menú completo */}
      <section className="full-menu-section">
        <h2>
          {terminology.allProducts || 'Todo el Menú'} 📦
        </h2>
        <MenuDisplay 
          menu={menu}
          onAddToCart={addToCart}
          terminology={terminology}
          showImages={true}
          layout="grid"
        />
      </section>
      
      {/* 🛒 Carrito flotante adaptativo */}
      <AdaptiveCartSummary 
        cart={cart} 
        cartTotal={cartTotal}
        cartCount={cartCount}
        onRemoveItem={removeFromCart}
        terminology={terminology}
        businessType={business?.businessType}
      />
    </div>
  );
}

// 🎨 Header adaptativo que cambia según el tipo de negocio
function AdaptiveHeader({ business, terminology }) {
  const businessType = business?.businessType || 'restaurant';
  const isStore = businessType === 'store';
  
  // 🎯 Iconos y colores adaptativos
  const headerConfig = {
    restaurant: { icon: '🍽️', gradient: 'from-orange-500 to-red-600', bgColor: 'bg-red-50' },
    store: { icon: '🏪', gradient: 'from-blue-500 to-purple-600', bgColor: 'bg-blue-50' }
  };
  
  const config = headerConfig[businessType];
  
  return (
    <header className={`business-header ${config.bgColor} p-6 rounded-lg mb-6`}>
      <div className="business-main-info">
        <div className="business-title-section">
          <h1 className="text-3xl font-bold text-gray-800">
            {config.icon} {business?.name}
          </h1>
          <span className="business-type-badge">
            {terminology.businessName}
          </span>
        </div>
        
        {business?.address && (
          <p className="address text-gray-600">
            📍 {business.address}
          </p>
        )}
      </div>
      
      {/* 🚚 Opciones de servicio adaptables */}
      <div className="service-options-modern">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          {isStore ? '🚚 Opciones de Envío' : '🍽️ Opciones de Servicio'}
        </h3>
        <div className="options-grid grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(business?.serviceOptions || {}).map(([key, enabled]) => {
            if (!enabled) return null;
            const label = terminology.serviceOptions?.[key] || key;
            const emoji = getServiceEmoji(key, isStore);
            return (
              <div key={key} className="service-option bg-white rounded-lg p-2 shadow-sm">
                <span className="text-green-600 font-medium">
                  {emoji} {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}

// 🛒 Carrito adaptativo con terminología dinámica
function AdaptiveCartSummary({ cart, cartTotal, cartCount, onRemoveItem, terminology, businessType }) {
  if (cartCount === 0) return null;

  const isStore = businessType === 'store';
  const cartIcon = isStore ? '🛒' : '🍽️';
  const actionText = isStore ? 'Proceder al Checkout' : 'Realizar Pedido';

  return (
    <div className="adaptive-cart-summary fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 border border-gray-200 max-w-sm">
      <div className="cart-header flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800">
          {cartIcon} {terminology.orderSummary || 'Tu Pedido'}
        </h3>
        <span className="cart-count bg-blue-600 text-white rounded-full px-2 py-1 text-sm">
          {cartCount}
        </span>
      </div>
      
      <div className="cart-items space-y-2 max-h-40 overflow-y-auto">
        {cart.map(item => (
          <div key={item.id} className="cart-item flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="item-info flex-1">
              <span className="item-name font-medium">{item.name}</span>
              <span className="item-quantity text-gray-600 ml-2">x{item.quantity}</span>
            </div>
            <div className="item-actions flex items-center space-x-2">
              <span className="item-price font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
              <button 
                onClick={() => onRemoveItem(item.id)}
                className="remove-btn text-red-500 hover:text-red-700"
              >
                ❌
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="cart-footer mt-4 pt-3 border-t border-gray-200">
        <div className="cart-total text-xl font-bold text-gray-800 mb-3">
          Total: ${cartTotal.toFixed(2)}
        </div>
        <button className="place-order-btn w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
          {actionText} →
        </button>
      </div>
    </div>
  );
}

// 🎯 Helper para emojis de servicios
function getServiceEmoji(serviceKey, isStore) {
  const emojiMap = {
    // Para stores
    delivery: isStore ? '🚚' : '🛵',
    pickup: isStore ? '🏪' : '🥡',
    shipping: '📦',
    // Para restaurants
    dineIn: '🍽️',
    takeaway: '🥡'
  };
  return emojiMap[serviceKey] || '✅';
}

// 🔄 EJEMPLO DE MIGRACIÓN - Para código existente
function ExistingRestaurantPage() {
  console.log('💡 TIP: Este código sigue funcionando exactamente igual');
  
  // ✅ Tu código existente no necesita cambios
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);
  const { restaurant, menu, loading, error } = useMenu(menuSDK);
  const { cart, addToCart } = useCart();

  if (loading) return <div>Cargando menú...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="restaurant-page">
      <h1>🍽️ {restaurant?.name}</h1>
      <MenuDisplay 
        menu={menu}
        onAddToCart={addToCart}
        showImages={true}
      />
      {/* Tu código existente sigue funcionando */}
    </div>
  );
}

export default ModernBusinessPage;
export { ExistingRestaurantPage };
