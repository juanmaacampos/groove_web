import React, { useState } from 'react';
import './App.css';
import Header from './webSections/Header/Header.jsx';
import MenuDropdown from './webSections/menuDropdown/MenuDropdown.jsx';
import BodyAds from './webSections/bodyAds/BodyAds.jsx';
import Footer from './webSections/Footer/Footer.jsx';
import Info from './webSections/Info/Info.jsx';
import FirebaseProvider from './firebase/FirebaseProvider.jsx';

function App() {
  const [selectedMenu, setSelectedMenu] = useState(null);
  
  return (
    <FirebaseProvider>
      <Header onSelect={setSelectedMenu} />
      {selectedMenu && <MenuDropdown menuType={selectedMenu} />}
      <BodyAds />
      <Info />
      <Footer />
    </FirebaseProvider>
  );
}

export default App;
