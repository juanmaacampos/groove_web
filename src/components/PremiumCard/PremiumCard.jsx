import React, { useState } from 'react';
import './premiumCard.css';
import panaderiaImage from '../../assets/img/panaderia.png';
import eventosImage from '../../assets/img/eventos.png';

/**
 * PremiumCard
 * Props:
 * - title: string
 * - subtitle: string
 * - bullets?: string[]
 * - badges?: string[] - Additional badges to show after subtitle
 * - ctaLabel: string
 * - ctaHref: string
 * - ctaOnClick?: function - Función personalizada para manejar clicks
 * - imageSrc: string | array (imported asset or array of images)
 * - imageAlt: string
 * - currentImageIndex?: number (for image sliding)
 */
const PremiumCard = ({ title, subtitle, bullets = [], badges = [], ctaLabel, ctaHref = '#', ctaOnClick, imageSrc = panaderiaImage, imageAlt, currentImageIndex = 0 }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [images, setImages] = useState([]);
  
  // Debug badges
  React.useEffect(() => {
    console.log('🏷️ PremiumCard recibió badges:', badges, 'length:', badges.length);
  }, [badges]);
  
  // Procesar imageSrc para convertirlo en array de imágenes
  React.useEffect(() => {
    if (Array.isArray(imageSrc)) {
      setImages(imageSrc);
    } else {
      setImages([imageSrc]);
    }
    setImageFailed(false);
  }, [imageSrc]);
  
  // Manejar error de imagen
  const handleImageError = (imageIndex) => {
    console.warn('�️ PremiumCard: Error cargando imagen:', images[imageIndex]);
    if (!imageFailed && imageIndex === 0) {
      setImageFailed(true);
      setImages([panaderiaImage]); // Fallback a imagen local
    }
  };
  
  const handleCtaClick = (e) => {
    if (ctaOnClick) {
      e.preventDefault();
      ctaOnClick();
    }
  };

  return (
    <article className="premium-card">
      <div className="premium-card__media">
        {/* Slider de imágenes */}
        <div className="premium-card__slider">
          <div 
            className="premium-card__slides" 
            style={{ 
              transform: `translateX(-${currentImageIndex * 100}%)`,
              transition: 'transform 0.6s ease-in-out'
            }}
          >
            {images.map((imgSrc, index) => (
              <div key={index} className="premium-card__slide">
                <img 
                  src={imgSrc} 
                  alt={`${imageAlt} - imagen ${index + 1}`} 
                  loading="lazy" 
                  onError={() => handleImageError(index)}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="premium-card__overlay" aria-hidden="true" />
        {/* Título superpuesto sobre la imagen */}
        <h3 className="premium-card__title">{title}</h3>
      </div>
      <div className="premium-card__content">
        {subtitle && <p className="premium-card__subtitle">{subtitle}</p>}
        
        {/* Badges de Firebase debajo de la descripción */}
        {!!badges.length && (
          <div className="premium-card__badges">
            {console.log('🏷️ Renderizando', badges.length, 'badges')}
            {badges.map((badge, i) => {
              console.log('🏷️ Renderizando badge:', badge);
              return <span key={i} className="premium-card__badge">{badge}</span>
            })}
          </div>
        )}
        
        {!!bullets.length && (
          <ul className="premium-card__bullets">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}
        <a 
          className="premium-card__cta" 
          href={ctaHref}
          onClick={handleCtaClick}
          target={ctaOnClick ? "_blank" : undefined}
          rel={ctaOnClick ? "noopener noreferrer" : undefined}
        >
          <span>{ctaLabel}</span>
          <svg className="arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </article>
  );
};

export default PremiumCard;
