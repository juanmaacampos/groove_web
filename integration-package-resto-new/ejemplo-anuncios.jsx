import React from 'react';
import { MenuSDK } from './menu-sdk.js';
import { AnnouncementsSection } from './MenuComponents.jsx';
import './MenuComponents.css';

/**
 * 📢 EJEMPLO DE IMPLEMENTACIÓN DE ANUNCIOS
 * Muestra cómo integrar el sistema de anuncios en una aplicación web
 * 
 * CARACTERÍSTICAS:
 * - Carga anuncios activos en tiempo real desde Firebase
 * - Soporte para múltiples imágenes por anuncio
 * - Enlaces clickeables con URL personalizada
 * - Hasta 4 badges promocionales por anuncio
 * - Auto-avance cada 5 segundos si hay múltiples anuncios
 * - Responsive design
 */

const EjemploAnuncios = () => {
  // Configuración de Firebase (reemplaza con tus datos)
  const firebaseConfig = {
    apiKey: "tu-api-key",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "tu-app-id"
  };

  // ID del negocio
  const businessId = "tu-business-id";

  // Inicializar SDK
  const menuSDK = new MenuSDK(firebaseConfig, businessId);

  return (
    <div className="ejemplo-anuncios">
      <div className="container">
        <header>
          <h1>🍽️ Restaurante Demo</h1>
          <p>Ejemplo de integración con sistema de anuncios</p>
        </header>

        {/* Sección de anuncios */}
        <AnnouncementsSection menuSDK={menuSDK} />

        {/* Contenido adicional de tu app */}
        <main>
          <h2>Menú del día</h2>
          <p>Aquí iría el resto del contenido de tu aplicación...</p>
          
          {/* Aquí podrías agregar otros componentes como MenuSlider, etc. */}
        </main>
      </div>
    </div>
  );
};

export default EjemploAnuncios;

/**
 * 🔧 GUÍA DE INTEGRACIÓN RÁPIDA:
 * 
 * 1. Instala las dependencias:
 *    npm install firebase
 * 
 * 2. Configura Firebase en tu proyecto:
 *    - Reemplaza firebaseConfig con tu configuración real
 *    - Asegúrate de que las reglas de Firestore permitan leer announcements
 * 
 * 3. Usa el componente en tu app:
 *    import { AnnouncementsSection } from './MenuComponents.jsx';
 *    import { MenuSDK } from './menu-sdk.js';
 *    
 *    const sdk = new MenuSDK(firebaseConfig, businessId);
 *    return <AnnouncementsSection menuSDK={sdk} />;
 * 
 * 4. Estructura esperada en Firestore:
 *    businesses/{businessId}/announcements/{announcementId}
 *    {
 *      title: "Título del anuncio",
 *      description: "Descripción del anuncio",
 *      images: ["url1", "url2", ...],
 *      url: "https://ejemplo.com",
 *      urlText: "Ver más",
 *      badges: [
 *        { text: "¡Oferta!" },
 *        { text: "Nuevo" },
 *        ...
 *      ],
 *      isActive: true,
 *      createdAt: serverTimestamp()
 *    }
 * 
 * 5. El componente maneja automáticamente:
 *    - Estados de carga y error
 *    - Actualizaciones en tiempo real
 *    - Responsive design
 *    - Auto-avance de slides
 *    - Enlaces externos seguros
 */
