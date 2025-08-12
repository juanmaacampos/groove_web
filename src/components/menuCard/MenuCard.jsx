import React from 'react';
import { FaCoffee, FaPizzaSlice, FaCocktail } from 'react-icons/fa'; // Importing additional icons
import { MdFastfood } from "react-icons/md";
import './menuCard.css';

export const menus = {
  desayuno: {
    title: 'Nuestro Café',
    desc: 'Café de especialidad, y variedad de opciones para tu desayuno y merienda.',
    icon: <FaCoffee className="menu-icon" />
  },
  almuerzo: {
    title: 'Almuerzo/Cena',
    desc: 'Disfruta de nuestras pizzas, ensaladas, picadas, burgers, pastas y comida de nuestro chef',
    icon: <MdFastfood className="menu-icon" />
  },
  bebidas: {
    title: 'Cócteles',
    desc: 'Desde los clasicos como el Fernet Branca, hasta aperitivos, vermucitos y gin',
    icon: <FaCocktail className="menu-icon" />
  }
};

export const MenuCard = ({ type, onMore }) => {
  const data = menus[type];
  if(!data) return null;
  return (
    <div className="menu-card">
      {data.icon} {/* Displaying the specific icon */}
      <h2>{data.title}</h2>
      <p>{data.desc}</p>
      <button onClick={onMore}>Ver Menú</button>
    </div>
  );
};

export default MenuCard;
