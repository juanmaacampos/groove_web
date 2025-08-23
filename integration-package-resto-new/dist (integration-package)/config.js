// Configuración para la integración del menú CMS
// ⚠️ IMPORTANTE: Reemplaza estos valores con tu configuración real

export const MENU_CONFIG = {
  // Configuración de Firebase (copia desde tu Firebase Console)
  firebaseConfig: {
    apiKey: "AIzaSyDHi_a1trI35goPoKcNPUDBMOSLKjvZKyc",
    authDomain: "cms-menu-7b4a4.firebaseapp.com",
    projectId: "cms-menu-7b4a4",
    storageBucket: "cms-menu-7b4a4.firebasestorage.app",
    messagingSenderId: "509736809578",
    appId: "1:509736809578:web:15471af092f3b46392c613"
  },
  
  // ✅ Business ID (recomendado)
  businessId: "HsuTZWhRVkT88a0WOztELGzJUhl1",
  
  // 🔄 Restaurant ID (para compatibilidad - mismo valor que businessId)
  restaurantId: "HsuTZWhRVkT88a0WOztELGzJUhl1"
};

// Función para obtener el UID del business
// Instrucciones:
// 1. Ve a tu CMS panel y haz login con la cuenta del business
// 2. Abre las herramientas de desarrollador (F12)
// 3. En la consola ejecuta: firebase.auth().currentUser.uid
// 4. Copia ese UID y reemplaza "YOUR_BUSINESS_UID_HERE" arriba

export function validateConfig() {
  if (MENU_CONFIG.businessId === "YOUR_BUSINESS_UID_HERE" || 
      MENU_CONFIG.restaurantId === "YOUR_BUSINESS_UID_HERE") {
    console.warn("⚠️ Configuración incompleta!");
    console.log("📝 Para obtener tu Business UID:");
    console.log("1. Ve a tu panel CMS de menús");
    console.log("2. Haz login con la cuenta del business/restaurant");
    console.log("3. Abre las herramientas de desarrollador (F12)");
    console.log("4. En la consola ejecuta: firebase.auth().currentUser.uid");
    console.log("5. Copia ese UID a config.js");
    return false;
  }
  return true;
}
