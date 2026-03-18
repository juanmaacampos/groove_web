import React, { useEffect } from 'react';
import { FaGoogle } from 'react-icons/fa';
import { MdMenuBook, MdCampaign, MdEventAvailable, MdInfoOutline } from 'react-icons/md';
import GrooveLogo from '../../assets/img/Groove_logo.svg';
import HeaderBg from '../headerBg/HeaderBg.jsx';
import './landingModal.css';

const NAV_ITEMS = [
  { label: 'Menú',               target: null,         Icon: MdMenuBook },
  { label: 'Novedades',          target: '#nosotros',  Icon: MdCampaign },
  { label: 'Reseñas',            target: '#resenas',   Icon: FaGoogle },
  { label: 'Reservas',           target: '#reservas',  Icon: MdEventAvailable },
  { label: 'Acerca de nosotros', target: '#info',      Icon: MdInfoOutline },
];

const LandingModal = ({ open, onClose, visualMode = 'bar' }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const handleClick = (target) => {
    onClose();
    if (!target) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Delay slightly so the modal unmounts before scroll fires
    requestAnimationFrame(() => {
      const el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  };

  return (
    <div className="landing-modal" role="dialog" aria-modal="true" aria-label="Menú de navegación">
      <HeaderBg mode={visualMode} />
      <div className="landing-modal__inner">
        <img src={GrooveLogo} alt="Groove Café" className="landing-modal__logo" />
        <nav className="landing-modal__nav" aria-label="Secciones principales">
          {NAV_ITEMS.map(({ label, target, Icon }) => (
            <button
              key={label}
              className="landing-modal__btn"
              onClick={() => handleClick(target)}
              type="button"
            >
              <Icon className="landing-modal__btn-icon" aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default LandingModal;
