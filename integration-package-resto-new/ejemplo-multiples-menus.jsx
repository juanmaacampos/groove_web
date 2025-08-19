/**
 * 🏆 EJEMPLO COMPLETO - MÚLTIPLES MENÚS
 * Implementación completa del sistema de múltiples menús para un negocio
 * 
 * CARACTERÍSTICAS:
 * ✅ Múltiples menús dentro de un negocio
 * ✅ Navegación por categorías con acordeón
 * ✅ Carrito que persiste entre menús
 * ✅ Terminología adaptativa
 * ✅ Diseño responsivo moderno
 */
import React from 'react';
import { createMenuSDK } from './menu-sdk-multiples-menus.js';
import { useMultipleMenus, useCartWithMultipleMenus } from './useMultipleMenus.js';
import { 
  MultipleMenusPage,
  MenuSelector, 
  CategoryAccordion, 
  ProductGrid,
  MultiMenuCart 
} from './MultipleMenusComponents.jsx';
import { MENU_CONFIG } from './config.js';
import './MenuComponents.css';
import './MultipleMenusStyles.css';

// 🎯 COMPONENTE PRINCIPAL
function EjemploMultiplesMenus() {
  // Crear instancia del SDK
  const menuSDK = React.useMemo(() => 
    createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId),
    []
  );

  return (
    <MultipleMenusPage 
      menuSDK={menuSDK}
      config={MENU_CONFIG}
    />
  );
}

// 🔧 EJEMPLO PERSONALIZADO
function EjemploPersonalizado() {
  const menuSDK = React.useMemo(() => 
    createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId),
    []
  );

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
  } = useCartWithMultipleMenus(true, true); // persistir carrito, mostrar origen

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#0F172A',
        color: 'white'
      }}>
        <div>
          <div style={{ 
            width: '3rem', 
            height: '3rem', 
            border: '3px solid rgba(255,255,255,0.1)',
            borderTop: '3px solid #8A2BE2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Cargando {terminology.menuPlural}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem',
        background: '#0F172A',
        color: 'white',
        minHeight: '100vh'
      }}>
        <h2 style={{ color: '#EF4444' }}>❌ Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            background: '#8A2BE2',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }

  return (
    <div className="ejemplo-personalizado">
      {/* Header del negocio */}
      {businessInfo && (
        <header className="business-header">
          <h1>{businessInfo.name}</h1>
          {businessInfo.description && (
            <p>{businessInfo.description}</p>
          )}
        </header>
      )}

      {/* Selector de menús */}
      {menus.length > 1 && (
        <MenuSelector
          menus={menus}
          currentMenuId={currentMenuId}
          onSelectMenu={switchToMenu}
          terminology={terminology}
        />
      )}

      {/* Menú actual */}
      {currentMenu && (
        <main className="current-menu">
          <div className="menu-header">
            <h2>📋 {currentMenu.menuInfo?.name}</h2>
            {currentMenu.menuInfo?.description && (
              <p>{currentMenu.menuInfo.description}</p>
            )}
            <div className="menu-stats">
              <span>
                {currentMenu.categories.length} {terminology.categoryPlural} • 
                {currentMenu.categories.reduce((total, cat) => total + cat.items.length, 0)} {terminology.itemPlural}
              </span>
            </div>
          </div>

          {/* Navegación por categorías */}
          <CategoryAccordion
            categories={currentMenu.categories}
            onAddToCart={addToCart}
            terminology={terminology}
            showImages={MENU_CONFIG.multipleMenus.ui.showProductImages}
          />
        </main>
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
        showMenuOrigin={MENU_CONFIG.cart.showMenuOrigin}
      />

      {/* Debugging info (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '0.75rem',
          maxWidth: '300px',
          zIndex: 999
        }}>
          <h4>🔧 Debug Info</h4>
          <p>Menús disponibles: {menus.length}</p>
          <p>Menú actual: {currentMenuId}</p>
          <p>Items en carrito: {cartCount}</p>
          <p>Total carrito: ${cartTotal.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}

// 🚀 EJEMPLO SIMPLE PARA TESTEAR
function EjemploSimple() {
  const [menuSDK] = React.useState(() => 
    createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId)
  );

  const {
    menus,
    currentMenu,
    loading,
    error,
    terminology
  } = useMultipleMenus(menuSDK);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '2rem', background: '#0F172A', minHeight: '100vh', color: 'white' }}>
      <h1>🍽️ Menús Disponibles</h1>
      
      {menus.length > 0 ? (
        <div>
          <p>Se encontraron {menus.length} {terminology.menuPlural}</p>
          <ul>
            {menus.map(menu => (
              <li key={menu.id}>
                <strong>{menu.name}</strong>
                {menu.description && <p>{menu.description}</p>}
                <small>{menu.categoriesCount} categorías</small>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No se encontraron menús disponibles</p>
      )}

      {currentMenu && (
        <div>
          <h2>📋 Menú Actual: {currentMenu.menuInfo?.name}</h2>
          <p>Categorías: {currentMenu.categories.length}</p>
        </div>
      )}
    </div>
  );
}

// 🎯 EXPORTAR COMPONENTES
export default EjemploMultiplesMenus;
export { 
  EjemploPersonalizado, 
  EjemploSimple,
  MultipleMenusPage,
  MenuSelector,
  CategoryAccordion,
  ProductGrid,
  MultiMenuCart
};

// 🔧 CSS para animaciones (si no está en los archivos CSS)
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .menu-stats {
    color: #94A3B8;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
  
  .ejemplo-personalizado .menu-header {
    text-align: center;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 12px;
  }
`;
document.head.appendChild(style);
