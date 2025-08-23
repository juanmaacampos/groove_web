import React from 'react';
import { createMenuSDK } from './menu-sdk.js';
import { MenuWithCart } from './MenuComponents.jsx';
import { CheckoutFlow } from './PaymentFlow.jsx';
import { useMenu, useCart } from './useMenu.js';
import { MENU_CONFIG } from './config.js';

// 🍽️ Ejemplo completo con información bancaria en tiempo real
function RestauranteConTransferencias() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
  const { restaurant, menu, loading, error } = useMenu(menuSDK);
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();

  if (loading) return <div className="menu-loading">Cargando menú...</div>;
  if (error) return <div className="menu-error">Error: {error}</div>;

  return (
    <div className="restaurant-app">
      {/* Header con información del restaurante */}
      <header className="restaurant-header">
        <h1>🍽️ {restaurant?.name || 'Restaurante'}</h1>
        <div className="restaurant-info">
          {restaurant?.address && (
            <p>📍 {restaurant.address}</p>
          )}
          {restaurant?.contactInfo && (
            <p>📞 {restaurant.contactInfo}</p>
          )}
        </div>
        
        {/* Mostrar métodos de pago disponibles */}
        {restaurant?.paymentMethods && (
          <div className="payment-methods-info">
            <h3>💳 Métodos de pago disponibles:</h3>
            <div className="payment-badges">
              {restaurant.paymentMethods.cash && (
                <span className="payment-badge">💵 Efectivo</span>
              )}
              {restaurant.paymentMethods.mercadoPago && (
                <span className="payment-badge">💳 MercadoPago</span>
              )}
              {restaurant.paymentMethods.transfer && (
                <span className="payment-badge">🏦 Transferencia</span>
              )}
            </div>
          </div>
        )}

        {/* Información bancaria si está disponible */}
        {restaurant?.paymentMethods?.transfer && restaurant?.bankInfo && (
          <div className="bank-info-preview">
            <h3>🏦 Para transferencias:</h3>
            <p>
              {restaurant.bankInfo.bankName && `${restaurant.bankInfo.bankName} • `}
              {restaurant.bankInfo.alias && `Alias: ${restaurant.bankInfo.alias}`}
            </p>
            <small>Los datos completos se mostrarán al finalizar el pedido</small>
          </div>
        )}
      </header>

      {/* Menú con carrito */}
      <main className="main-content">
        {cart.length > 0 ? (
          <div className="checkout-section">
            <h2>🛒 Finalizar Pedido</h2>
            <CheckoutFlow
              cart={cart}
              cartTotal={cartTotal}
              restaurant={restaurant}
              menuSDK={menuSDK}
              onOrderComplete={() => {
                clearCart();
                alert('¡Pedido realizado con éxito!');
              }}
            />
            <button 
              onClick={clearCart}
              className="back-to-menu-btn"
            >
              ← Volver al menú
            </button>
          </div>
        ) : (
          <MenuWithCart 
            menuSDK={menuSDK}
            showImages={true}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2025 {restaurant?.name || 'Restaurante'} - Sistema actualizado en tiempo real</p>
        <small>
          La información de pago y banco se actualiza automáticamente cuando el restaurante la modifica
        </small>
      </footer>
    </div>
  );
}

// Estilos adicionales para el ejemplo
const additionalStyles = `
  .restaurant-app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .restaurant-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    text-align: center;
  }

  .restaurant-header h1 {
    margin: 0 0 1rem 0;
    font-size: 2.5rem;
  }

  .restaurant-info p {
    margin: 0.5rem 0;
    opacity: 0.9;
  }

  .payment-methods-info {
    margin-top: 1.5rem;
  }

  .payment-methods-info h3 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
  }

  .payment-badges {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .payment-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    backdrop-filter: blur(10px);
  }

  .bank-info-preview {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
    text-align: left;
  }

  .bank-info-preview h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
  }

  .bank-info-preview p {
    margin: 0 0 0.5rem 0;
    font-family: monospace;
  }

  .bank-info-preview small {
    opacity: 0.8;
    font-style: italic;
  }

  .checkout-section {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .checkout-section h2 {
    margin: 0 0 1.5rem 0;
    color: #2d3748;
  }

  .back-to-menu-btn {
    background: #e2e8f0;
    color: #4a5568;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 1rem;
    font-size: 0.9rem;
    transition: background 0.3s ease;
  }

  .back-to-menu-btn:hover {
    background: #cbd5e0;
  }

  .app-footer {
    text-align: center;
    padding: 2rem 1rem;
    color: #718096;
    border-top: 1px solid #e2e8f0;
    margin-top: 2rem;
  }

  .app-footer p {
    margin: 0 0 0.5rem 0;
  }

  .app-footer small {
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    .restaurant-header {
      padding: 1.5rem;
    }
    
    .restaurant-header h1 {
      font-size: 2rem;
    }
    
    .checkout-section {
      padding: 1rem;
    }
    
    .payment-badges {
      flex-direction: column;
      align-items: center;
    }
  }
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = additionalStyles;
  document.head.appendChild(styleElement);
}

export default RestauranteConTransferencias;
