/**
 * 🎯 EJEMPLO DE IMPLEMENTACIÓN COMPLETA - GROOVE INTEGRATION PACKAGE
 * 
 * Este archivo muestra cómo integrar el paquete completo en una app React
 * Basado en la implementación exitosa del proyecto Groove Web App
 */

import React, { useState, useEffect } from 'react';
import { createMenuSDK } from './menu-sdk.js';
import { useGrooveMenus, useMenuCategories, useMenuSearch } from './useMenu.js';
import { MenuSlider, MenuDropdown, MenuSearch } from './MenuComponents.jsx';
import { MENU_CONFIG } from './config.js';
import './MenuComponents.css';

/**
 * 🎠 EJEMPLO 1: SLIDER DE MENÚS DINÁMICO
 * Carrusel que muestra todos los menús disponibles desde Firebase
 */
export const MenuSliderExample = () => {
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [menuSDK, setMenuSDK] = useState(null);

  // Inicializar SDK
  useEffect(() => {
    const sdk = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
    setMenuSDK(sdk);
  }, []);

  if (!menuSDK) {
    return <div>🔥 Inicializando Firebase...</div>;
  }

  return (
    <div className="menu-example">
      <h1>Nuestros Menús</h1>
      
      {/* Carrusel de menús */}
      <MenuSlider 
        menuSDK={menuSDK}
        onSelect={(menuId) => setSelectedMenu(menuId)}
      />
      
      {/* Vista detallada del menú seleccionado */}
      {selectedMenu && (
        <MenuDropdown
          menuSDK={menuSDK}
          menuType={selectedMenu}
          onClose={() => setSelectedMenu(null)}
        />
      )}
    </div>
  );
};

/**
 * 🔍 EJEMPLO 2: BUSCADOR DE PLATOS
 * Búsqueda en tiempo real con resultados instantáneos
 */
export const MenuSearchExample = () => {
  const [menuSDK, setMenuSDK] = useState(null);

  useEffect(() => {
    const sdk = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
    setMenuSDK(sdk);
  }, []);

  const handleItemSelect = (item) => {
    console.log('Item seleccionado:', item);
    // Aquí puedes agregar lógica para mostrar detalles del item,
    // agregarlo al carrito, etc.
  };

  if (!menuSDK) {
    return <div>🔥 Inicializando Firebase...</div>;
  }

  return (
    <div className="search-example">
      <h1>Buscar en nuestro menú</h1>
      <MenuSearch
        menuSDK={menuSDK}
        onItemSelect={handleItemSelect}
      />
    </div>
  );
};

/**
 * 📋 EJEMPLO 3: MENÚ COMPLETO CON HOOKS PERSONALIZADOS
 * Usando los hooks directamente para mayor control
 */
export const CustomMenuExample = () => {
  const [menuSDK, setMenuSDK] = useState(null);
  const [selectedMenuId, setSelectedMenuId] = useState(null);

  // Inicializar SDK
  useEffect(() => {
    const sdk = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
    setMenuSDK(sdk);
  }, []);

  // Obtener lista de menús
  const { grooveMenus, loading: menusLoading, error: menusError } = useGrooveMenus(menuSDK);
  
  // Obtener categorías del menú seleccionado
  const { categories, loading: categoriesLoading, error: categoriesError } = useMenuCategories(menuSDK, selectedMenuId);

  // Lista de menús disponibles
  const menuKeys = Object.keys(grooveMenus);

  if (menusLoading) return <div>📋 Cargando menús...</div>;
  if (menusError) return <div>❌ Error: {menusError}</div>;

  return (
    <div className="custom-menu-example">
      <h1>Menú Personalizado</h1>
      
      {/* Selector de menús */}
      <div className="menu-selector">
        <h2>Selecciona un menú:</h2>
        <div className="menu-buttons">
          {menuKeys.map(menuId => (
            <button
              key={menuId}
              className={`menu-button ${selectedMenuId === menuId ? 'active' : ''}`}
              onClick={() => setSelectedMenuId(menuId)}
            >
              {grooveMenus[menuId].icon} {grooveMenus[menuId].title}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido del menú seleccionado */}
      {selectedMenuId && (
        <div className="menu-content">
          <h2>{grooveMenus[selectedMenuId].title}</h2>
          <p>{grooveMenus[selectedMenuId].description}</p>
          
          {categoriesLoading ? (
            <div>⏳ Cargando categorías...</div>
          ) : categoriesError ? (
            <div>❌ Error: {categoriesError}</div>
          ) : (
            <div className="categories">
              {categories.map(category => (
                <div key={category.id} className="category">
                  <h3>{category.name}</h3>
                  {category.description && <p>{category.description}</p>}
                  
                  <div className="items">
                    {category.items.map(item => (
                      <div key={item.id} className="menu-item">
                        <h4>{item.name}</h4>
                        <p>{item.description}</p>
                        <span className="price">${item.price}</span>
                        {item.isFeatured && <span className="featured">⭐ Destacado</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 🎯 EJEMPLO 4: IMPLEMENTACIÓN COMPLETA
 * Combinando todos los componentes en una sola aplicación
 */
export const GrooveMenuApp = () => {
  const [menuSDK, setMenuSDK] = useState(null);
  const [currentView, setCurrentView] = useState('slider'); // 'slider', 'search', 'custom'
  const [selectedMenu, setSelectedMenu] = useState(null);

  // Inicializar SDK
  useEffect(() => {
    const sdk = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
    setMenuSDK(sdk);
  }, []);

  if (!menuSDK) {
    return (
      <div className="loading-app">
        <h1>🍽️ Groove Menu</h1>
        <p>🔥 Conectando con Firebase...</p>
      </div>
    );
  }

  return (
    <div className="groove-menu-app">
      <header className="app-header">
        <h1>🍽️ Groove Menu</h1>
        <nav className="app-nav">
          <button 
            className={currentView === 'slider' ? 'active' : ''}
            onClick={() => setCurrentView('slider')}
          >
            🎠 Carrusel
          </button>
          <button 
            className={currentView === 'search' ? 'active' : ''}
            onClick={() => setCurrentView('search')}
          >
            🔍 Buscar
          </button>
          <button 
            className={currentView === 'custom' ? 'active' : ''}
            onClick={() => setCurrentView('custom')}
          >
            📋 Personalizado
          </button>
        </nav>
      </header>

      <main className="app-content">
        {currentView === 'slider' && (
          <div>
            <MenuSlider 
              menuSDK={menuSDK}
              onSelect={(menuId) => setSelectedMenu(menuId)}
            />
            {selectedMenu && (
              <MenuDropdown
                menuSDK={menuSDK}
                menuType={selectedMenu}
                onClose={() => setSelectedMenu(null)}
              />
            )}
          </div>
        )}

        {currentView === 'search' && (
          <MenuSearch
            menuSDK={menuSDK}
            onItemSelect={(item) => {
              console.log('Item seleccionado:', item);
              alert(`Has seleccionado: ${item.name}`);
            }}
          />
        )}

        {currentView === 'custom' && (
          <CustomMenuExample />
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by Groove Integration Package v4.0.0</p>
        <p>🔥 Firebase • ⚛️ React • 🎨 CSS</p>
      </footer>
    </div>
  );
};

/**
 * 🎮 EJEMPLO 5: INTEGRANDO CON CONTEXT PROVIDER
 * Para apps más grandes que necesitan el SDK en múltiples componentes
 */

// Context Provider
import { createContext, useContext } from 'react';

const MenuSDKContext = createContext(null);

export const MenuSDKProvider = ({ children }) => {
  const [menuSDK, setMenuSDK] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function initializeSDK() {
      try {
        const sdk = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
        
        // Probar conectividad
        await sdk.getBusinessInfo();
        
        setMenuSDK(sdk);
        setIsInitialized(true);
        console.log('✅ MenuSDK inicializado correctamente');
      } catch (error) {
        console.error('❌ Error inicializando MenuSDK:', error);
        setIsInitialized(true); // Marcar como inicializado aunque haya error
      }
    }

    initializeSDK();
  }, []);

  return (
    <MenuSDKContext.Provider value={{ menuSDK, isInitialized }}>
      {children}
    </MenuSDKContext.Provider>
  );
};

// Hook para usar el context
export const useMenuSDK = () => {
  const context = useContext(MenuSDKContext);
  if (!context) {
    throw new Error('useMenuSDK debe usarse dentro de MenuSDKProvider');
  }
  return context;
};

// Componente que usa el context
export const MenuWithContext = () => {
  const { menuSDK, isInitialized } = useMenuSDK();

  if (!isInitialized) {
    return <div>🔄 Inicializando...</div>;
  }

  if (!menuSDK) {
    return <div>❌ Error de conexión</div>;
  }

  return (
    <div>
      <h1>Menú con Context</h1>
      <MenuSlider menuSDK={menuSDK} onSelect={(id) => console.log(id)} />
    </div>
  );
};

// App principal con context
export const AppWithContext = () => {
  return (
    <MenuSDKProvider>
      <div className="app">
        <MenuWithContext />
      </div>
    </MenuSDKProvider>
  );
};

// Exports por defecto
export default GrooveMenuApp;

/**
 * 🎨 ESTILOS CSS BÁSICOS PARA LOS EJEMPLOS
 */

const styles = `
.menu-example, .search-example, .custom-menu-example {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.groove-menu-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: #f8f9fa;
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #dee2e6;
}

.app-nav {
  margin-top: 15px;
}

.app-nav button {
  margin: 0 10px;
  padding: 8px 16px;
  border: 2px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.app-nav button.active,
.app-nav button:hover {
  background: #007bff;
  color: white;
}

.app-content {
  flex: 1;
  padding: 20px;
}

.app-footer {
  background: #343a40;
  color: white;
  text-align: center;
  padding: 20px;
  margin-top: auto;
}

.menu-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.menu-button {
  padding: 10px 20px;
  border: 2px solid #28a745;
  background: white;
  color: #28a745;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-button.active,
.menu-button:hover {
  background: #28a745;
  color: white;
}

.categories {
  display: grid;
  gap: 20px;
}

.category {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
}

.items {
  display: grid;
  gap: 15px;
  margin-top: 15px;
}

.menu-item {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 15px;
  background: #f8f9fa;
}

.menu-item h4 {
  margin: 0 0 5px 0;
  color: #343a40;
}

.menu-item p {
  margin: 5px 0;
  color: #6c757d;
  font-size: 14px;
}

.price {
  font-weight: bold;
  color: #28a745;
}

.featured {
  background: #fff3cd;
  color: #856404;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-left: 10px;
}

.loading-app {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
}

@media (max-width: 768px) {
  .menu-buttons {
    flex-direction: column;
  }
  
  .app-nav button {
    margin: 5px;
  }
}
`;

// Inyectar estilos si no están presentes
if (typeof document !== 'undefined' && !document.getElementById('groove-example-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'groove-example-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
