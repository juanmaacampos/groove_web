/**
 * 🔧 CONFIGURACIÓN PARA MÚLTIPLES MENÚS
 * Un solo negocio puede tener múltiples menús (ej: Almuerzo, Cena, Bebidas)
 */

export const MENU_CONFIG = {
  // 🔥 Configuración de Firebase
  firebaseConfig: {
    apiKey: "AIzaSyDHi_a1trI35goPoKcNPUDBMOSLKjvZKyc",
    authDomain: "cms-menu-7b4a4.firebaseapp.com",
    projectId: "cms-menu-7b4a4",
    storageBucket: "cms-menu-7b4a4.firebasestorage.app",
    messagingSenderId: "509736809578",
    appId: "1:509736809578:web:15471af092f3b46392c613"
  },

  // 🏪 ID del Negocio Principal
  businessId: "HsuTZWhRVkT88a0WOztELGzJUhl1",
  
  // 📋 Configuración para Múltiples Menús
  multipleMenus: {
    enabled: true,
    showMenuSelector: true,
    defaultMenuId: null, // Si es null, muestra el selector automáticamente
    
    // 🎨 Configuración de UI
    ui: {
      showMenuDescriptions: true,
      menuCardStyle: "modern", // "modern" | "classic" | "minimal"
      categoryAccordion: true, // Categorías en acordeón vs lista
      showProductImages: true,
      compactMode: false // Modo compacto para pantallas pequeñas
    }
  },

  // 🛒 Configuración del Carrito
  cart: {
    persistBetweenMenus: true, // Mantener carrito al cambiar de menú
    showMenuOrigin: true, // Mostrar de qué menú viene cada producto
    allowMixedMenus: true // Permitir productos de diferentes menús en el carrito
  },

  // 🎯 Terminología Adaptativa
  terminology: {
    business: {
      restaurant: {
        menuSingular: "menú",
        menuPlural: "menús",
        itemSingular: "plato",
        itemPlural: "platos",
        categorySingular: "categoría", 
        categoryPlural: "categorías",
        cartName: "pedido",
        addToCartText: "Agregar al pedido"
      },
      store: {
        menuSingular: "catálogo",
        menuPlural: "catálogos", 
        itemSingular: "producto",
        itemPlural: "productos",
        categorySingular: "categoría",
        categoryPlural: "categorías", 
        cartName: "carrito",
        addToCartText: "Agregar al carrito"
      }
    }
  }
};

// 🎯 Helper function para obtener terminología
export function getTerminology(businessType = 'restaurant') {
  return MENU_CONFIG.terminology.business[businessType] || MENU_CONFIG.terminology.business.restaurant;
}

// 🔄 Compatibilidad con versión anterior
export const restaurantId = MENU_CONFIG.businessId;
