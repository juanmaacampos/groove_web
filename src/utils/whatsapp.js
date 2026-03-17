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
  fullName,
  phone,
  eventType,
  eventDate,
  guests,
  slot,
  message,
}) {
  const lines = [
    'Hola, quiero consultar por una reserva para un evento.',
    '',
    `Nombre: ${fullName || 'No informado'}`,
    `WhatsApp: ${phone || 'No informado'}`,
    `Tipo de evento: ${eventType || 'No informado'}`,
    `Fecha estimada: ${formatEventDate(eventDate)}`,
    `Cantidad de personas: ${guests || 'No informada'}`,
    `Franja horaria: ${slot || 'No informada'}`,
  ];

  if (message) {
    lines.push(`Comentario: ${message}`);
  }

  return lines.join('\n');
}