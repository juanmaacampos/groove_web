import React from 'react';
import { FaStar, FaGoogle } from 'react-icons/fa';
import './reviews.css';

const MOCK_REVIEWS = [
  {
    id: 1,
    author: 'Sofía M.',
    rating: 5,
    text: 'Excelente atención y tragos increíbles. El ambiente de noche es espectacular para venir con amigos.',
    when: 'Hace 2 días'
  },
  {
    id: 2,
    author: 'Lucas R.',
    rating: 5,
    text: 'Probamos brunch y cafetería. Todo fresco, rico y con porciones muy buenas. Volvemos seguro.',
    when: 'Hace 1 semana'
  },
  {
    id: 3,
    author: 'Emily T.',
    rating: 5,
    text: 'Great spot in Campana. Fast service, quality cocktails, and very cozy vibe for dinner.',
    when: 'Hace 3 días'
  }
];

const Reviews = ({ visualMode }) => {
  return (
    <section
      className="reviews-section"
      data-mode={visualMode === 'day' ? 'day' : 'bar'}
      aria-label="Reseñas destacadas de Google Maps"
    >
      <div className="reviews__inner">
        <div className="reviews__header">
          <span className="reviews__eyebrow">
            <FaGoogle aria-hidden="true" />
            Opiniones destacadas
          </span>
          <h2 className="reviews__title">Lo que dicen en Google Maps</h2>
          
        </div>

        <div className="reviews__grid">
          {MOCK_REVIEWS.map((review) => (
            <article key={review.id} className="review-card">
              <div className="review-card__rating" aria-label={`${review.rating} estrellas`}>
                {Array.from({ length: review.rating }).map((_, idx) => (
                  <FaStar key={`${review.id}-star-${idx}`} />
                ))}
              </div>
              <p className="review-card__text">“{review.text}”</p>
              <footer className="review-card__meta">
                <span className="review-card__author">{review.author}</span>
                <span className="review-card__when">{review.when}</span>
              </footer>
            </article>
          ))}
        </div>

        <p className="reviews__disclaimer">*Contenido de ejemplo visual para demo.</p>
      </div>
    </section>
  );
};

export default Reviews;
