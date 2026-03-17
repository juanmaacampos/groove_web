import React, { useState } from 'react';
import { useBusinessContact } from '../../hooks/useBusinessContact.js';
import { buildEventReservationMessage, buildWhatsAppLink } from '../../utils/whatsapp.js';
import './eventReservation.css';

const EVENT_TYPES = ['Cumpleaños', 'Evento empresarial', 'Reunión social', 'After office', 'Otro'];
const SLOTS = ['Tarde', 'Noche'];

const EventReservation = ({ visualMode }) => {
  const [submitted, setSubmitted] = useState(false);
  const { contactPhone, whatsAppHref, isInitialized } = useBusinessContact();

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const reservationData = {
      fullName: formData.get('fullName')?.toString().trim(),
      phone: formData.get('phone')?.toString().trim(),
      eventType: formData.get('eventType')?.toString().trim(),
      eventDate: formData.get('eventDate')?.toString().trim(),
      guests: formData.get('guests')?.toString().trim(),
      slot: formData.get('slot')?.toString().trim(),
      message: formData.get('message')?.toString().trim(),
    };
    const message = buildEventReservationMessage(reservationData);
    const submitLink = buildWhatsAppLink(contactPhone, message) || whatsAppHref;

    window.open(submitLink, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  return (
    <section id="reservas" className="event-reservation" aria-label="Reserva de eventos">
      <div className="event-reservation__inner">
        <div className="event-reservation__intro">
       
          <h2>Reservá tu lugar para tu próximo evento</h2>
         
        </div>

        <div className="event-reservation__card">
          {!submitted ? (
            <form className="event-form" onSubmit={handleSubmit}>
              <div className="event-form__grid">
                <label>
                  Nombre y apellido
                  <input type="text" name="fullName" required placeholder="Ej: Juan Pérez" autoComplete="name" enterKeyHint="next" />
                </label>

                <label>
                  WhatsApp
                  <input type="tel" name="phone" required placeholder="Ej: +54 9 11 1234-5678" autoComplete="tel" inputMode="tel" enterKeyHint="next" />
                </label>

                <label>
                  Tipo de evento
                  <select name="eventType" required defaultValue="" autoComplete="off">
                    <option value="" disabled>Seleccionar</option>
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Fecha estimada
                  <input type="date" name="eventDate" required enterKeyHint="next" />
                </label>

                <label>
                  Cantidad de personas
                  <input type="number" min="1" max="200" name="guests" required placeholder="Ej: 30" inputMode="numeric" enterKeyHint="next" />
                </label>

                <label>
                  Franja horaria
                  <select name="slot" required defaultValue="" autoComplete="off">
                    <option value="" disabled>Seleccionar</option>
                    {SLOTS.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="event-form__full">
                Comentario (opcional)
                <textarea name="message" rows="4" placeholder="Contanos brevemente qué tipo de evento querés organizar" autoComplete="off" enterKeyHint="done" />
              </label>

              <div className="event-form__actions">
                <button type="submit" className="event-form__submit" disabled={!whatsAppHref && isInitialized}>
                  Enviar por WhatsApp
                </button>
              </div>
            </form>
          ) : (
            <div className="event-form__success" role="status" aria-live="polite">
              <h3>¡Gracias por tu consulta!</h3>
              <p>Tu solicitud fue recibida. Te vamos a contactar pronto para coordinar los detalles.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EventReservation;
