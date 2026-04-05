import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { useBusinessContact } from '../../hooks/useBusinessContact.js';
import { buildEventReservationMessage, buildWhatsAppLink } from '../../utils/whatsapp.js';
import './eventReservation.css';

const EVENT_TYPES = ['Cumpleaños', 'Casamiento', 'Evento empresarial', 'Almuerzo ejecutivo', 'Brunch', 'Reunión social', 'After office', 'Otro'];
const RESERVATION_MODES = {
  table: 'Reserva de mesa',
  private: 'Evento Privado',
};

const EventReservation = ({ visualMode }) => {
  const [reservationMode, setReservationMode] = useState('table');
  const [guestCount, setGuestCount] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { contactPhone, whatsAppHref, isInitialized } = useBusinessContact();

  const isTableReservation = reservationMode === 'table';
  const guestMax = isTableReservation ? 10 : 200;

  const handleReservationModeChange = (mode) => {
    setReservationMode(mode);

    if (mode === 'table' && guestCount && Number(guestCount) > 10) {
      setGuestCount('10');
    }
  };

  const handleGuestCountChange = (event) => {
    const nextValue = event.target.value;

    if (!nextValue) {
      setGuestCount('');
      return;
    }

    const numericValue = Number(nextValue);
    if (Number.isNaN(numericValue)) {
      return;
    }

    setGuestCount(String(Math.min(numericValue, guestMax)));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const reservationData = {
      reservationMode,
      fullName: formData.get('fullName')?.toString().trim(),
      phone: formData.get('phone')?.toString().trim(),
      eventType: isTableReservation ? '' : formData.get('eventType')?.toString().trim(),
      eventDate: formData.get('eventDate')?.toString().trim(),
      eventTime: isTableReservation ? formData.get('eventTime')?.toString().trim() : '',
      guests: formData.get('guests')?.toString().trim(),
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
       
          <h2>Organizá tu próxima experiencia en Groove</h2>
         
        </div>

        <div className="event-reservation__card">
          {!submitted ? (
            <form className="event-form" onSubmit={handleSubmit}>
              <div className="event-form__mode-switch" role="tablist" aria-label="Tipo de solicitud">
                {Object.entries(RESERVATION_MODES).map(([mode, label]) => {
                  const isActive = reservationMode === mode;

                  return (
                    <button
                      key={mode}
                      type="button"
                      className={`event-form__mode-button${isActive ? ' event-form__mode-button--active' : ''}`}
                      onClick={() => handleReservationModeChange(mode)}
                      aria-pressed={isActive}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="event-form__grid">
                <label>
                  Nombre y apellido
                  <input type="text" name="fullName" required placeholder="Ej: Juan Pérez" autoComplete="name" enterKeyHint="next" />
                </label>

                <label>
                  WhatsApp
                  <input type="tel" name="phone" required placeholder="Ej: +54 9 11 1234-5678" autoComplete="tel" inputMode="tel" enterKeyHint="next" />
                </label>

                {!isTableReservation && (
                  <label>
                    Tipo de evento
                    <select name="eventType" required defaultValue="" autoComplete="off">
                      <option value="" disabled>Seleccionar</option>
                      {EVENT_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </label>
                )}

                <label>
                  Fecha estimada
                  <input type="date" name="eventDate" required enterKeyHint="next" />
                </label>

                {isTableReservation && (
                  <label>
                    Hora de la reserva
                    <input
                      type="time"
                      name="eventTime"
                      required
                      value={reservationTime}
                      onChange={(e) => setReservationTime(e.target.value)}
                      enterKeyHint="next"
                    />
                  </label>
                )}

                <label>
                  Cantidad de personas
                  <input
                    type="number"
                    min="1"
                    max={guestMax}
                    name="guests"
                    required
                    value={guestCount}
                    onChange={handleGuestCountChange}
                    placeholder={isTableReservation ? 'Hasta 10 personas' : 'Ej: 30'}
                    inputMode="numeric"
                    enterKeyHint="next"
                  />
                </label>
              </div>

              <label className="event-form__full">
                Comentario (opcional)
                <textarea
                  name="message"
                  rows="4"
                  placeholder={isTableReservation ? 'Si querés, agregá un comentario para tu reserva' : 'Contanos brevemente qué tipo de evento querés organizar'}
                  autoComplete="off"
                  enterKeyHint="done"
                />
              </label>

              <div className="event-form__actions">
                <button type="submit" className="event-form__submit" disabled={!whatsAppHref && isInitialized}>
                  <FaWhatsapp aria-hidden="true" />
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
