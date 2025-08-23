/**
 * 🔧 CONFIGURACIÓN FIREBASE PARA GROOVE INTEGRATION PACKAGE
 * 
 * IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase
 * 
 * INSTRUCCIONES:
 * 1. Ve a Firebase Console (https://console.firebase.google.com)
 * 2. Selecciona tu proyecto
 * 3. Ve a "Configuración del proyecto" > "General"  
 * 4. Copia la configuración de tu app web
 * 5. Reemplaza los valores de ejemplo con los tuyos
 */

export const MENU_CONFIG = {
  // 🔥 Configuración de Firebase (REEMPLAZAR CON TUS DATOS)
  firebaseConfig: {
    apiKey: "tu-api-key-aqui",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdefghijklmnop"
  },

  // 🏪 ID del Negocio Principal (REEMPLAZAR CON TU BUSINESS ID)
  businessId: "tu-business-id-aqui",
  
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
