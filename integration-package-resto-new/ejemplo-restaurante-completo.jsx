import React from 'react';
import { createMenuSDK } from './cms-menu/menu-sdk.js';
import { MenuWithCart } from './cms-menu/MenuComponents.jsx';
import { QuickMercadoPagoTest } from './cms-menu/MercadoPagoTester.jsx';
import { MENU_CONFIG } from './cms-menu/config.js';
import { isTestingMode } from './cms-menu/mercadopago-test-config.js';

// 🍽️ Ejemplo completo de restaurante con testing de MercadoPago
function RestauranteApp() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);

  return (
    <div className="restaurant-app">
      {/* Header */}
      <header className="app-header">
        <h1>🍽️ Mi Restaurante</h1>
        <p>Menú online con pagos via MercadoPago</p>
        
        {/* Mostrar indicador de testing si está en modo testing */}
        {isTestingMode() && (
          <div className="testing-indicator">
            🧪 MODO TESTING - <QuickMercadoPagoTest />
          </div>
        )}
      </header>

      {/* Menú completo con carrito y checkout */}
      <main>
        <MenuWithCart 
          menuSDK={menuSDK}
          showImages={true}
        />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2025 Mi Restaurante - Powered by CMS Menu SDK</p>
      </footer>
    </div>
  );
}

export default RestauranteApp;
