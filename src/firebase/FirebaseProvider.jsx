import React, { createContext, useContext, useEffect, useState } from 'react';
import { createMenuSDK } from './menuSDK';
import { MENU_CONFIG } from './config';

/**
 * 🔥 CONTEXTO DE FIREBASE PARA GROOVE
 * Proveedor global del SDK de menús para toda la aplicación
 */

const FirebaseContext = createContext();

export function FirebaseProvider({ children }) {
  const [menuSDK, setMenuSDK] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initializeFirebase() {
      try {
        // Crear instancia del SDK
        const sdk = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
        
        // Probar conectividad básica
        const businessInfo = await sdk.getBusinessInfo();
        
        setMenuSDK(sdk);
        setIsInitialized(true);
      } catch (err) {
        console.error('Error inicializando Firebase SDK:', err);
        setError(err.message);
        setIsInitialized(true); // Marcar como inicializado aunque haya error
      }
    }

    initializeFirebase();
  }, []);

  const value = {
    menuSDK,
    isInitialized,
    error,
    config: MENU_CONFIG
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

/**
 * Hook para usar el contexto de Firebase
 */
export function useFirebase() {
  const context = useContext(FirebaseContext);
  
  if (!context) {
    throw new Error('useFirebase debe usarse dentro de un FirebaseProvider');
  }
  
  return context;
}

export default FirebaseProvider;
