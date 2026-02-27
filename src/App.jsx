import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Header from './webSections/Header/Header.jsx';
import MenuDropdownOptimized from './components/MenuDropdownOptimized/MenuDropdownOptimized.jsx';
import BodyAds from './webSections/bodyAds/BodyAds.jsx';
import Footer from './webSections/Footer/Footer.jsx';
import Info from './webSections/Info/Info.jsx';
import Reviews from './webSections/Reviews/Reviews.jsx';
import EventReservation from './webSections/EventReservation/EventReservation.jsx';
import FirebaseProvider from './firebase/FirebaseProvider.jsx';
import FeaturedModal from './components/FeaturedModal/FeaturedModal.jsx';
import TopButton from './components/topButton/TopButton.jsx';
import ModeTestControl from './components/ModeTestControl/ModeTestControl.jsx';
import { useFeaturedModal } from './hooks/useFeaturedModal.js';
import { useAnnouncementsOptimized } from './firebase/useMenuOptimized.js';
import { MenuSDK } from './firebase/menuSDK.js';
import { MENU_CONFIG } from './firebase/config.js';

// Initialize Firebase SDK
const menuSDK = new MenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
const DAY_MODE_START_HOUR = 7;
const DAY_MODE_END_HOUR = 19;

const getVisualModeFromTime = (date) => {
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const dayStart = DAY_MODE_START_HOUR * 60;
  const dayEnd = DAY_MODE_END_HOUR * 60;
  return currentMinutes >= dayStart && currentMinutes < dayEnd ? 'day' : 'bar';
};

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
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [manualMode, setManualMode] = useState(null);

  useEffect(() => {
    const intervalId = setInterval(() => setCurrentTime(new Date()), 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const automaticMode = useMemo(() => getVisualModeFromTime(currentTime), [currentTime]);
  const visualMode = manualMode || automaticMode;

  const handleModeSwitch = () => {
    setManualMode((prevMode) => {
      if (!prevMode) {
        return automaticMode === 'day' ? 'bar' : 'day';
      }
      return prevMode === 'day' ? 'bar' : 'day';
    });
  };

  const clearManualMode = () => {
    setManualMode(null);
  };

  useEffect(() => {
    document.body.setAttribute('data-mode', visualMode);
    return () => {
      document.body.removeAttribute('data-mode');
    };
  }, [visualMode]);

  // Usar hook optimizado para anuncios (reduce ~80% de lecturas Firebase)
  const { announcements } = useAnnouncementsOptimized(menuSDK, {
    enableRealtime: true,    // Solo cuando sea necesario
    cacheOnly: false,       // Permite tiempo real
    maxAge: 5 * 60 * 1000   // Cache por 5 minutos
  });
  
  // Use the featured modal hook
  const { isModalOpen, featuredAnnouncement, closeModal } = useFeaturedModal(announcements);
  
  return (
    <div className="app-shell" data-mode={visualMode}>
      <div className="web-test-badge" aria-label="Aviso de entorno de prueba">Web Test</div>
      <Header onSelect={onSelectMenu} onSlideChange={onSlideChange} mode={visualMode} />

      {/* Mostrar dropdown para el slide activo (automático) o el menú seleccionado manualmente */}
      {(activeSlide || selectedMenu) && (
        <MenuDropdownOptimized 
          key={selectedMenu ? `manual-${selectedMenu}-${manualClickKey}` : `auto-${activeSlide}`}
          menuType={selectedMenu || activeSlide} 
          autoScroll={!!selectedMenu} // Solo scroll automático si es selección manual
          visualMode={visualMode}
        />
      )}
      <BodyAds />
      <Reviews visualMode={visualMode} />
      <EventReservation visualMode={visualMode} />
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

      {/* Control temporal de testing visual (no va en producción final) */}
      <ModeTestControl
        visualMode={visualMode}
        onToggleMode={handleModeSwitch}
        dayStartHour={DAY_MODE_START_HOUR}
        dayEndHour={DAY_MODE_END_HOUR}
      />

    </div>
  );
}

export default App;
