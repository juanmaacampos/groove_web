export function normalizeWhatsAppPhone(phone) {
  if (!phone) {
    return '';
  }

  return String(phone).replace(/\D/g, '');
}

export function buildWhatsAppLink(phone, message = '') {
  const normalizedPhone = normalizeWhatsAppPhone(phone);

  if (!normalizedPhone) {
    return '';
  }

  const textParam = message ? `&text=${encodeURIComponent(message)}` : '';
  return `https://api.whatsapp.com/send/?phone=${normalizedPhone}${textParam}&type=phone_number&app_absent=0`;
}

export function buildWaMeLink(phone) {
  const normalizedPhone = normalizeWhatsAppPhone(phone);

  if (!normalizedPhone) {
    return '';
  }

  return `https://wa.me/${normalizedPhone}`;
}

const formatEventDate = (value) => {
  if (!value) {
    return 'Sin definir';
  }

  const [year, month, day] = value.split('-');
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
};

export function buildEventReservationMessage({
  reservationMode,
  fullName,
  phone,
  eventType,
  eventDate,
  guests,
  message,
}) {
  const contactLink = buildWaMeLink(phone);
  const isTableReservation = reservationMode === 'table';
  const lines = [
    isTableReservation ? 'Hola, quiero hacer una reserva de mesa.' : 'Hola, quiero consultar por un evento privado.',
    '',
    `Tipo de solicitud: ${isTableReservation ? 'Reserva de mesa' : 'Evento privado'}`,
    `Nombre: ${fullName || 'No informado'}`,
    `WhatsApp: ${contactLink || phone || 'No informado'}`,
    `Fecha estimada: ${formatEventDate(eventDate)}`,
    `Cantidad de personas: ${guests || 'No informada'}`,
  ];

  if (!isTableReservation) {
    lines.splice(4, 0, `Tipo de evento: ${eventType || 'No informado'}`);
  }

  if (message) {
    lines.push(`Comentario: ${message}`);
  }

  return lines.join('\n');
}