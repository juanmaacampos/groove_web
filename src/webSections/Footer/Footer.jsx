import React from 'react';
import GrooveLogo from '../../assets/img/Groove_logo.svg';
import JMCDEVLogo from '../../assets/img/jmcdev_logo.webp';
import './footer.css';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { INSTAGRAM_CAFE } from '../../config/socials.js';
import { useBusinessContact } from '../../hooks/useBusinessContact.js';

const Footer = () => {
  const year = new Date().getFullYear();
  const { whatsAppHref } = useBusinessContact();

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
            href={whatsAppHref}
            target="_blank"
            rel="noreferrer noopener"
            title="WhatsApp"
            aria-label="WhatsApp"
          >
            <FaWhatsapp aria-hidden="true" />
          </a>
        </nav>

        <div className="footer-meta">
          <a
            className="footer-credit"
            href="https://jmcdev.site"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="JMCDEV"
          >
            <img src={JMCDEVLogo} alt="JMCDEV" className="footer-credit-logo" />
          </a>
          <strong>
            <small className="legal">
              © {year} Web creada por <a href="https://jmcdev.site" target="_blank" rel="noreferrer noopener">JMCDEV</a>. Todos los derechos reservados.
            </small>
          </strong>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
