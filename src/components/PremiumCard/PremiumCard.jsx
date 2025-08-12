import React from 'react';
import './premiumCard.css';
import panaderiaImage from '../../assets/img/panaderia.png';
import eventosImage from '../../assets/img/eventos.png';

/**
 * PremiumCard
 * Props:
 * - title: string
 * - subtitle: string
 * - bullets?: string[]
 * - ctaLabel: string
 * - ctaHref: string
 * - imageSrc: string (imported asset)
 * - imageAlt: string
 */
const PremiumCard = ({ title, subtitle, bullets = [], ctaLabel, ctaHref = '#', imageSrc = panaderiaImage, imageAlt }) => {
  return (
    <article className="premium-card">
      <div className="premium-card__media">
        <img src={imageSrc} alt={imageAlt} loading="lazy" />
        <div className="premium-card__overlay" aria-hidden="true" />
      </div>
      <div className="premium-card__content">
        <h3 className="premium-card__title">{title}</h3>
        {subtitle && <p className="premium-card__subtitle">{subtitle}</p>}
        {!!bullets.length && (
          <ul className="premium-card__bullets">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}
        <a className="premium-card__cta" href={ctaHref}>
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
