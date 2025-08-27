import React, { useState } from 'react';
import './App.css';
import Header from './webSections/Header/Header.jsx';
import MenuDropdownOptimized from './components/MenuDropdownOptimized/MenuDropdownOptimized.jsx';
import BodyAds from './webSections/bodyAds/BodyAds.jsx';
import Footer from './webSections/Footer/Footer.jsx';
import Info from './webSections/Info/Info.jsx';
import FirebaseProvider from './firebase/FirebaseProvider.jsx';
import FeaturedModal from './components/FeaturedModal/FeaturedModal.jsx';
import TopButton from './components/topButton/TopButton.jsx';
import { useFeaturedModal } from './hooks/useFeaturedModal.js';
import { useAnnouncementsOptimized } from './firebase/useMenuOptimized.js';
import { MenuSDK } from './firebase/menuSDK.js';
import { MENU_CONFIG } from './firebase/config.js';

// Initialize Firebase SDK
const menuSDK = new MenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);

function App() {
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [activeSlide, setActiveSlide] = useState(null);
  const [manualClickKey, setManualClickKey] = useState(0);
  
  // Manejar selección manual (con scroll)
  const handleManualSelection = (menuType) => {
    setSelectedMenu(menuType);
    setManualClickKey(prev => prev + 1); // Incrementar key para forzar re-render
  };
  
  return (
    <FirebaseProvider>
      <AppContent 
        onSelectMenu={handleManualSelection} 
        selectedMenu={selectedMenu}
        onSlideChange={setActiveSlide}
        activeSlide={activeSlide}
        manualClickKey={manualClickKey}
      />
    </FirebaseProvider>
  );
}

function AppContent({ onSelectMenu, selectedMenu, onSlideChange, activeSlide, manualClickKey }) {
  // Usar hook optimizado para anuncios (reduce ~80% de lecturas Firebase)
  const { announcements } = useAnnouncementsOptimized(menuSDK, {
    enableRealtime: true,    // Solo cuando sea necesario
    cacheOnly: false,       // Permite tiempo real
    maxAge: 5 * 60 * 1000   // Cache por 5 minutos
  });
  
  // Use the featured modal hook
  const { isModalOpen, featuredAnnouncement, closeModal } = useFeaturedModal(announcements);
  
  return (
    <>
      <Header onSelect={onSelectMenu} onSlideChange={onSlideChange} />
      {/* Mostrar dropdown para el slide activo (automático) o el menú seleccionado manualmente */}
      {(activeSlide || selectedMenu) && (
        <MenuDropdownOptimized 
          key={selectedMenu ? `manual-${selectedMenu}-${manualClickKey}` : `auto-${activeSlide}`}
          menuType={selectedMenu || activeSlide} 
          autoScroll={!!selectedMenu} // Solo scroll automático si es selección manual
        />
      )}
      <BodyAds />
      <Info />
      <Footer />
      
      {/* Featured Announcement Modal */}
      <FeaturedModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        announcement={featuredAnnouncement}
      />

      {/* Scroll to top button */}
      <TopButton />

    </>
  );
}

export default App;
