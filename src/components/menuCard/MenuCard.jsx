import React from 'react';
import { FaCoffee, FaPizzaSlice, FaCocktail, FaLeaf, FaUtensils } from 'react-icons/fa';
import { MdFastfood } from "react-icons/md";
import './menuCard.css';

// 🍽️ Configuración de iconos y descripciones por defecto para Groove
// Esta estructura se mantiene para compatibilidad visual pero ahora acepta datos dinámicos
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

// Función para obtener el icono apropiado basado en el nombre del menú
const normalizeMenuName = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const getMenuIcon = (menuName) => {
  if (!menuName) return <MdFastfood className="menu-icon" />;

  const name = normalizeMenuName(menuName);

  const iconByExactName = {
    'gluten free': <FaLeaf className="menu-icon" />,
    cena: <FaUtensils className="menu-icon" />,
    'nuestros cocteles': <FaCocktail className="menu-icon" />,
    cafeteria: <FaCoffee className="menu-icon" />
  };

  if (iconByExactName[name]) {
    return iconByExactName[name];
  }
  
  // Mapear iconos basados en palabras clave en el nombre
  if (name.includes('cafe') || name.includes('desayuno') || name.includes('breakfast')) {
    return <FaCoffee className="menu-icon" />;
  }
  if (name.includes('bebida') || name.includes('cocteleria') || name.includes('cocktail') || name.includes('bar')) {
    return <FaCocktail className="menu-icon" />;
  }
  if (name.includes('pizza')) {
    return <FaPizzaSlice className="menu-icon" />;
  }
  
  // Por defecto usar icono de comida
  return <MdFastfood className="menu-icon" />;
};

export const MenuCard = ({ type, menuData, onMore, isPriority = false }) => {
  // Priorizar datos dinámicos de Firebase sobre configuración estática
  let data;
  
  if (menuData) {
    // Usar datos dinámicos de Firebase
    data = {
      title: menuData.title || 'Menú',
      desc: menuData.description || 'Descubre nuestros deliciosos platos',
      icon: getMenuIcon(menuData.title)
    };
  } else if (menus[type]) {
    // Fallback a datos estáticos solo si no hay datos de Firebase
    data = menus[type];
  } else {
    // Fallback final usando el type como título
    data = {
      title: type.charAt(0).toUpperCase() + type.slice(1),
      desc: 'Descubre nuestros deliciosos platos',
      icon: getMenuIcon(type)
    };
  }
  
  if (!data) return null;

  const handleKeyDown = (e) => {
    // Activate on Enter or Space
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onMore && onMore();
    }
  };

  return (
    <div
      className={`menu-card clickable ${isPriority ? 'menu-card--priority' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onMore && onMore()}
      onKeyDown={handleKeyDown}
      aria-label={`Ver menú ${data.title}`}
    >
      {isPriority && (
        <span className="menu-card-priority" aria-hidden="true">Destacado</span>
      )}
      {data.icon}
      <h2>{data.title}</h2>
      <p>{data.desc}</p>
  <div className="menu-card-cta" aria-hidden="true">Ver Menú</div>
    </div>
  );
};

export default MenuCard;
