import React, { useState } from 'react';
import './App.css';
import Header from './webSections/Header/Header.jsx';
import MenuDropdown from './webSections/menuDropdown/MenuDropdown.jsx';
import BodyAds from './webSections/bodyAds/BodyAds.jsx';
import Footer from './webSections/Footer/Footer.jsx';
import Info from './webSections/Info/Info.jsx';
import FirebaseProvider from './firebase/FirebaseProvider.jsx';
import FeaturedModal from './components/FeaturedModal/FeaturedModal.jsx';
import TopButton from './components/topButton/TopButton.jsx';
import { useFeaturedModal } from './hooks/useFeaturedModal.js';
import { useAnnouncements } from './firebase/useMenu.js';
import { MenuSDK } from './firebase/menuSDK.js';
import { MENU_CONFIG } from './firebase/config.js';

// Initialize Firebase SDK
const menuSDK = new MenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);

function App() {
  const [selectedMenu, setSelectedMenu] = useState(null);
  
  return (
    <FirebaseProvider>
      <AppContent onSelectMenu={setSelectedMenu} selectedMenu={selectedMenu} />
    </FirebaseProvider>
  );
}

function AppContent({ onSelectMenu, selectedMenu }) {
  // Get announcements for the modal
  const { announcements } = useAnnouncements(menuSDK);
  
  // Use the featured modal hook
  const { isModalOpen, featuredAnnouncement, closeModal } = useFeaturedModal(announcements);
  
  return (
    <>
      <Header onSelect={onSelectMenu} />
      {selectedMenu && <MenuDropdown menuType={selectedMenu} />}
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
