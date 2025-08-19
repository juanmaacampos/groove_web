import React, { useMemo, useState, useEffect, useRef } from 'react';
import './menuDropdown.css';
import { useFirebase } from '../../firebase/FirebaseProvider.jsx';
import { useGrooveMenus, useMenuCategories } from '../../utils/menuMapper.js';
import grooveLogo from '/Groove_logo.svg';

// Función para obtener imagen por defecto si no hay imagen en Firebase
const getDefaultImage = () => {
  return grooveLogo;
};

const Category = ({ cat, open, onToggle }) => {
  return (
    <div className={`md-cat ${open ? 'open' : ''}`}>
      <button className="md-cat-header" onClick={() => onToggle(cat.id)} aria-expanded={open}>
        <span className="md-cat-name">{cat.name}</span>
        <span className="md-cat-arrow" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
      <div className="md-cat-panel" style={{ maxHeight: open ? `${cat.items.length * 128 + 24}px` : 0 }}>
        <ul className="md-items">
          {cat.items.map((item, index) => (
            <li key={item.id} className="md-item">
              <div className="md-item-media">
                <img 
                  src={item.img || getDefaultImage()} 
                  alt={item.name}
                  className={!item.img ? 'placeholder' : ''}
                  onError={(e) => {
                    e.target.src = getDefaultImage();
                    e.target.className = 'placeholder';
                  }}
                />
              </div>
              <div className="md-item-body">
                <div className="md-item-row">
                  <h4 className="md-item-name">{item.name}</h4>
                  <span className="md-item-price">{item.price}</span>
                </div>
                <p className="md-item-desc">{item.desc}</p>
                {/* Mostrar estado de stock si aplica */}
                {item.trackStock && (
                  <div className="md-item-stock">
                    {item.stock > 0 ? (
                      <span className={`stock-indicator ${item.stock <= 5 ? 'low' : 'normal'}`}>
                        {item.stock <= 5 ? `Quedan ${item.stock}` : 'Disponible'}
                      </span>
                    ) : (
                      <span className="stock-indicator out">Sin stock</span>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const MenuDropdown = ({ menuType }) => {
  const sectionRef = useRef(null);
  const { menuSDK, isInitialized, error: firebaseError } = useFirebase();
  const { grooveMenus, loading: menusLoading } = useGrooveMenus(menuSDK);
  const { categories, loading: categoriesLoading, error } = useMenuCategories(menuSDK, menuType);
  const [openCat, setOpenCat] = useState(null);

  // Obtener información básica del menú seleccionado
  const menuInfo = useMemo(() => {
    if (menusLoading || !isInitialized || !grooveMenus[menuType]) return null;
    return grooveMenus[menuType];
  }, [grooveMenus, menuType, menusLoading, isInitialized]);

  // Estados de carga combinados
  const loading = menusLoading || categoriesLoading;

  useEffect(() => {
    setOpenCat(null);
  }, [menuType]);

  useEffect(() => {
    if (sectionRef.current && categories && categories.length > 0) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [categories]);

  const toggle = (id) => setOpenCat(prev => (prev === id ? null : id));

  // Estados de carga y error
  if (!isInitialized) {
    return (
      <section className="menu-dropdown">
        <div className="md-container">
          <div className="loading-state">
            <div className="simple-loader"></div>
          </div>
        </div>
      </section>
    );
  }

  if (firebaseError) {
    return (
      <section className="menu-dropdown">
        <div className="md-container">
          <div className="error-state">
            <p>❌ Error de conexión: {firebaseError}</p>
            <p>Por favor, intenta recargar la página.</p>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="menu-dropdown">
        <div className="md-container">
          <div className="loading-state">
            <div className="simple-loader"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="menu-dropdown">
        <div className="md-container">
          <div className="error-state">
            <p>❌ Error cargando menú: {error}</p>
            <p>Por favor, intenta nuevamente.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <section className="menu-dropdown">
        <div className="md-container">
          <div className="empty-state">
            <p>📭 No hay elementos disponibles en este menú.</p>
            <p>Intenta seleccionar otro menú.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="menu-dropdown" className="menu-dropdown">
      <div className="md-container">
        <h2 className="md-title">{menuInfo?.title || 'Menú'}</h2>
        <div className="md-list">
          {categories.map(cat => (
            <Category key={cat.id} cat={cat} open={openCat === cat.id} onToggle={toggle} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuDropdown;
