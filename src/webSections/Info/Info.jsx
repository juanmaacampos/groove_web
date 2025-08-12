import React, { useEffect, useRef, useState } from 'react';
import './info.css';
import { FaMapMarkerAlt, FaWhatsapp, FaInstagram, FaClock } from 'react-icons/fa';
import { WHATSAPP_LINK, WHATSAPP_DISPLAY, INSTAGRAM_CAFE, INSTAGRAM_PAN } from '../../config/socials.js';

const MAP_QUERY = encodeURIComponent('Av. Int. Jorge Ruben Varela 512, B7223 Campana, Provincia de Buenos Aires');
const MAP_EMBED = `https://www.google.com/maps?q=${MAP_QUERY}&output=embed`;

const Info = () => {
  const sectionRef = useRef(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;

    // Trigger once when 20% of the section is visible
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setEntered(true);
            obs.disconnect();
          }
        });
      },
      { root: null, threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="info"
      className="info-section"
      aria-label="Información de contacto y ubicación"
      ref={sectionRef}
      data-entered={entered ? 'true' : 'false'}
    >
      <div className="info__inner">
        <div className="info__header">
          <h2 className="info__title">Encontranos</h2>
          <p className="info__subtitle">Ubicación, horarios y formas de contacto</p>
        </div>

        <div className="info__grid">
          {/* Left: details */}
          <div className="info__details" aria-label="Datos de contacto">
            <div className="info-item">
              <div className="info-item__icon" aria-hidden="true"><FaMapMarkerAlt /></div>
              <div className="info-item__content">
                <h3 className="info-item__title">Ubicación</h3>
                <p className="info-item__text">
                  Av. Int. Jorge Ruben Varela 512, B7223 Campana, Provincia de Buenos Aires
                </p>
                <a className="info-item__link" href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`} target="_blank" rel="noreferrer noopener">
                  Ver en Google Maps
                </a>
              </div>
            </div>

            <div className="info-item">
              <div className="info-item__icon" aria-hidden="true"><FaWhatsapp /></div>
              <div className="info-item__content">
                <h3 className="info-item__title">WhatsApp</h3>
                <p className="info-item__text">{WHATSAPP_DISPLAY}</p>
                <a className="info-item__link" href={WHATSAPP_LINK} target="_blank" rel="noreferrer noopener">
                  Escribinos por WhatsApp
                </a>
              </div>
            </div>

            <div className="info-item">
              <div className="info-item__icon" aria-hidden="true"><FaInstagram /></div>
              <div className="info-item__content">
                <h3 className="info-item__title">Instagram</h3>
                <div className="info-chips" role="list">
                  <a role="listitem" className="chip" href={INSTAGRAM_CAFE.href} target="_blank" rel="noreferrer noopener" title={INSTAGRAM_CAFE.title}>
                    @{INSTAGRAM_CAFE.handle}
                  </a>
                  <a role="listitem" className="chip" href={INSTAGRAM_PAN.href} target="_blank" rel="noreferrer noopener" title={INSTAGRAM_PAN.title}>
                    @{INSTAGRAM_PAN.handle}
                  </a>
                </div>
              </div>
            </div>

            <div className="info-item">
              <div className="info-item__icon" aria-hidden="true"><FaClock /></div>
              <div className="info-item__content">
                <h3 className="info-item__title">Horarios</h3>
                <ul className="info-hours">
                  <li><strong>Lun a Sab:</strong> 15:30 – 00:00</li>
                </ul>
                <p className="info-item__note">Reservas y eventos: escribinos y coordinamos tu fecha.</p>
              </div>
            </div>
          </div>

          {/* Right: map */}
          <div className="info__map" aria-label="Mapa de Google con la ubicación">
            <div className="map-card">
              <iframe
                title="Mapa de Groove Café en Campana"
                src={MAP_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Info;
