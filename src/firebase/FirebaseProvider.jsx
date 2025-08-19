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
        console.log('🚀 Inicializando Firebase SDK para Groove...');
        console.log('🔧 Config:', MENU_CONFIG.firebaseConfig);
        console.log('🏪 Business ID:', MENU_CONFIG.businessId);
        
        // Crear instancia del SDK
        const sdk = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
        console.log('✅ SDK creado correctamente');
        
        // Probar conectividad básica
        console.log('🔍 Probando conectividad con Firebase...');
        const businessInfo = await sdk.getBusinessInfo();
        console.log('✅ Conectividad verificada, info del negocio:', businessInfo);
        
        setMenuSDK(sdk);
        setIsInitialized(true);
        
        console.log('✅ Firebase SDK inicializado correctamente');
      } catch (err) {
        console.error('❌ Error inicializando Firebase SDK:', err);
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
