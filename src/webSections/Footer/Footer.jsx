import React from 'react';
import GrooveLogo from '../../assets/img/Groove_logo.svg';
import './footer.css';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { WHATSAPP_LINK, INSTAGRAM_CAFE } from '../../config/socials.js';

const Footer = () => {
  const year = new Date().getFullYear();
  // Links centralizados en config/socials.js

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-divider" aria-hidden="true" />
      <div className="footer-inner">
        <div className="footer-brand">
          <img src={GrooveLogo} alt="Groove Café" className="footer-logo" />
          <p className="footer-tagline">Café & Restó</p>
        </div>

        <nav className="footer-links" aria-label="Redes sociales">
          <a
            href={INSTAGRAM_CAFE.href}
            target="_blank"
            rel="noreferrer noopener"
            title={INSTAGRAM_CAFE.title}
            aria-label={INSTAGRAM_CAFE.title}
          >
            <FaInstagram aria-hidden="true" />
          </a>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer noopener"
            title="WhatsApp"
            aria-label="WhatsApp"
          >
            <FaWhatsapp aria-hidden="true" />
          </a>
        </nav>

        <div className="footer-meta">
          <small className="legal">© {year} Creado por <a href="https://jmcdev.site" target="_blank" rel="noreferrer noopener">JMCDEV</a>. Todos los derechos reservados.</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
