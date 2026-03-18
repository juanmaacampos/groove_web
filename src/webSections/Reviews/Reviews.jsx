import React, { useState } from 'react';
import { FaStar, FaGoogle } from 'react-icons/fa';
import './reviews.css';

// ─────────────────────────────────────────────────────────────
// CÓMO ACTUALIZAR LAS RESEÑAS:
//  1. Abrí Google Maps → buscá "Groove Café Campana"
//  2. Entrá a las reseñas y elegí las mejores de 5 estrellas
//  3. Para la foto: clic derecho en el avatar → "Copiar dirección de imagen"
//     y pegala en `avatar`. Sin foto → dejá null (se muestran iniciales).
//  4. En `date` poner la fecha real de la reseña — el tiempo relativo
//     se calcula solo y se actualiza con el paso del tiempo.
// ─────────────────────────────────────────────────────────────

// Calcula tiempo relativo en español a partir de una fecha
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years  = Math.floor(days / 365);

  if (mins < 60)   return mins <= 1 ? 'hace un momento' : `hace ${mins} minutos`;
  if (hours < 24)  return hours === 1 ? 'hace 1 hora' : `hace ${hours} horas`;
  if (days < 7)    return days === 1 ? 'hace 1 día' : `hace ${days} días`;
  if (weeks < 5)   return weeks === 1 ? 'hace 1 semana' : `hace ${weeks} semanas`;
  if (months < 12) return months === 1 ? 'hace 1 mes' : `hace ${months} meses`;
  return years === 1 ? 'hace 1 año' : `hace ${years} años`;
}

const REVIEWS = [
  {
    id: 1,
    author: 'florencia de Filippis Vidal',
    avatar: 'https://lh3.googleusercontent.com/a-/ALV-UjV2tFa4IPvjnvraOHyntkrpLLZQyZPEai1Z0VFUlw6eqzhDuapyYA=w90-h90-p-rp-mo-ba4-br100',
    rating: 5,
    text: 'El lugar es muy bonito, son super amables y la comida es exquisita. Súper recomendable',
    date: '2025-11-17'
  },
  {
    id: 2,
    author: 'Armando Deri',
    avatar: 'https://lh3.googleusercontent.com/a/ACg8ocLJlMfZE4mwW0ubsu_6tnIsd8HOJ4ZVJwwRDIVSlBeYiQFNfA=w90-h90-p-rp-mo-br100',
    rating: 5,
    text: 'Gran variedad y excelente la comida. Muy recomendable. Gracias x la atención y amabilidad',
    date: '2026-03-10'
  },
  {
    id: 3,
    author: 'Eliana Charcuetti',
    avatar: 'https://lh3.googleusercontent.com/a-/ALV-UjU2RrPOLveKBI6-9UYTtRKSCYSDoiPJZd7uCcvjabkdl2k2E3n1ZQ=w90-h90-p-rp-mo-br100',
    rating: 5,
    text: 'Hermoso el patio, muy buena atención y el smottie on the beach riquisimooo. Súper recomendable',
    date: '2025-11-17'
  }
];

// Link al perfil de Google Maps del local — reemplazá con el link real
// Para obtenerlo: Google Maps → Groove Café → "Compartir" → "Copiar link"
const GOOGLE_MAPS_URL = 'https://www.google.com/maps/search/Groove+Café+Av.+Int.+Jorge+Ruben+Varela+512+Campana';

// Avatar con fallback a iniciales cuando no hay foto disponible
function ReviewAvatar({ src, name }) {
  const [imgError, setImgError] = useState(false);
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  if (src && !imgError) {
    return (
      <img
        className="review-card__avatar"
        src={src}
        alt={`Foto de perfil de ${name}`}
        loading="lazy"
        decoding="async"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="review-card__avatar review-card__avatar--initials" aria-hidden="true">
      {initials}
    </div>
  );
}

const Reviews = ({ visualMode }) => {
  return (
    <section
      id="resenas"
      className="reviews-section"
      data-mode={visualMode === 'day' ? 'day' : 'bar'}
      aria-label="Reseñas destacadas de Google Maps"
    >
      <div className="reviews__inner">
        <div className="reviews__header">

          <h2 className="reviews__title">Lo que dicen en Google Maps</h2>
        </div>

        <div className="reviews__grid">
          {REVIEWS.map((review) => (
            <article key={review.id} className="review-card">
              <header className="review-card__header">
                <ReviewAvatar src={review.avatar} name={review.author} />
                <div className="review-card__identity">
                  <span className="review-card__author">{review.author}</span>
                  <span className="review-card__when">{timeAgo(review.date)}</span>
                </div>
              </header>

              <div className="review-card__rating" aria-label={`${review.rating} estrellas`}>
                {Array.from({ length: review.rating }).map((_, idx) => (
                  <FaStar key={`${review.id}-star-${idx}`} />
                ))}
              </div>
              <p className="review-card__text">“{review.text}”</p>
            </article>
          ))}
        </div>

        <div className="reviews__footer">
          <a
            href={GOOGLE_MAPS_URL}
            className="reviews__cta"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ver todas las reseñas de Groove Café en Google Maps"
          >
            <FaGoogle aria-hidden="true" />
            Ver todas las reseñas en Google Maps
          </a>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
