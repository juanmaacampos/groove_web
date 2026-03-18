import React, { useState, useEffect, useCallback } from 'react';
import { FaGoogle } from 'react-icons/fa';
import { MdMenuBook, MdCampaign, MdEventAvailable, MdInfoOutline, MdMenu, MdClose } from 'react-icons/md';
import GrooveLogo from '../../assets/img/Groove_logo.svg';
import './navbar.css';

const NAV_ITEMS = [
  { label: 'Menú',               target: null,         Icon: MdMenuBook },
  { label: 'Novedades',          target: '#nosotros',  Icon: MdCampaign },
  { label: 'Reseñas',            target: '#resenas',   Icon: FaGoogle },
  { label: 'Reservas',           target: '#reservas',  Icon: MdEventAvailable },
  { label: 'Acerca de nosotros', target: '#info',      Icon: MdInfoOutline },
];

const SCROLL_THRESHOLD = 80;

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = useCallback(() => {
    const isScrolled = window.scrollY > SCROLL_THRESHOLD;
    setVisible(isScrolled);
    if (!isScrolled) setMenuOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleNavClick = (target) => {
    setMenuOpen(false);
    if (!target) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    requestAnimationFrame(() => {
      const el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  };

  return (
    <nav
      className={`navbar${visible ? ' navbar--visible' : ''}`}
      aria-label="Navegación principal"
    >
      <div className="navbar__inner">
        <button
          className="navbar__logo-btn"
          onClick={() => handleNavClick(null)}
          aria-label="Ir al inicio"
          type="button"
        >
          <img src={GrooveLogo} alt="Groove Café" className="navbar__logo" />
        </button>

        <div className="navbar__nav" aria-label="Secciones principales">
          {NAV_ITEMS.map(({ label, target, Icon }) => (
            <button
              key={label}
              className="navbar__desktop-item"
              onClick={() => handleNavClick(target)}
              type="button"
            >
              <Icon className="navbar__desktop-item-icon" aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <button
          className={`navbar__hamburger${menuOpen ? ' navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="navbar-drawer"
          type="button"
        >
          {menuOpen ? <MdClose /> : <MdMenu />}
        </button>
      </div>

      <div
        id="navbar-drawer"
        className={`navbar__drawer${menuOpen ? ' navbar__drawer--open' : ''}`}
        role="menu"
      >
        {NAV_ITEMS.map(({ label, target, Icon }) => (
          <button
            key={label}
            className="navbar__item"
            onClick={() => handleNavClick(target)}
            type="button"
            role="menuitem"
          >
            <Icon className="navbar__item-icon" aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
