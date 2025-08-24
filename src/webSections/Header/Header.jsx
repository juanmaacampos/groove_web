import React, { useEffect, useState } from 'react';
import GrooveLogo from '../../assets/img/Groove_logo.svg';
import HeaderBg from '../../components/headerBg/HeaderBg.jsx';
import MenuSlider from '../../components/menuSlider/MenuSlider.jsx';
import Typewriter from '../../components/Typewriter/Typewriter.jsx';
import './header.css';

export const Header = ({ onSelect }) => {
  // Trigger entrance animations once mounted
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <header className="site-header" data-entered={entered ? 'true' : 'false'}>
      <HeaderBg />
      <div className="header-inner">
        <div className="logo-wrapper">
          <img src={GrooveLogo} alt="Groove Cafe" className="logo" />
        </div>
        <h2 className="header-title header-title--stack" aria-live="polite">
          <span className="header-title__top">Nuestros</span>
          <span className="header-title__bottom">
            <Typewriter
              prefix=""
              words={[
                'cocteles',
                'cafés',
                'desayunos',
                'tragos',
                'tapeos',
              ]}
            />
          </span>
        </h2>
  <MenuSlider onSelect={onSelect} />
      </div>

      {/* CTA inferior */}
      <a href="#nosotros" className="scroll-cue" aria-label="¿Querés saber más de nosotros?">
        <span className="text">¿Querés saber más de nosotros?</span>
        <span className="arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </a>
    </header>
  );
};

export default Header;
