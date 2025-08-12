import React, { useState } from 'react';
import './App.css';
import Header from './webSections/Header/Header.jsx';
import MenuDropdown from './webSections/menuDropdown/MenuDropdown.jsx';

function App() {
  const [selectedMenu, setSelectedMenu] = useState(null);
  return (
    <>
      <Header onSelect={setSelectedMenu} />
      {selectedMenu && <MenuDropdown menuType={selectedMenu} />}
    </>
  );
}

export default App;
