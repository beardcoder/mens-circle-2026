import type { PayloadHandler } from 'payload';
import nodemailer from 'nodemailer';

export const registerEndpoint: PayloadHandler = async (req) => {
  const { payload } = req;
  const data = await req.json!();

  const { firstName, lastName, email, phone, eventId, note } = data;

  if (!firstName || !lastName || !email || !phone || !eventId) {
    return Response.json({ error: 'Bitte fülle alle Pflichtfelder aus.' }, { status: 400 });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return Response.json({ error: 'Bitte gib eine gültige E-Mail-Adresse an.' }, { status: 400 });
  }

  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();

  // Check event exists and is published
  let event;
  try {
    event = await payload.findByID({ collection: 'events', id: eventId, overrideAccess: true });
  } catch {
    return Response.json({ error: 'Veranstaltung nicht gefunden.' }, { status: 404 });
  }

  if (!event.published) {
    return Response.json({ error: 'Diese Veranstaltung ist nicht verfügbar.' }, { status: 400 });
  }

  // Check event is not in the past
  if (new Date(event.eventDate as string) < new Date(new Date().toDateString())) {
    return Response.json({ error: 'Diese Veranstaltung liegt in der Vergangenheit.' }, { status: 400 });
  }

  // Find or create participant
  const existingParticipants = await payload.find({
    collection: 'participants',
    where: { email: { equals: normalizedEmail } },
    limit: 1,
    overrideAccess: true,
  });

  let participant;
  if (existingParticipants.docs.length > 0) {
    participant = existingParticipants.docs[0];
    await payload.update({
      collection: 'participants',
      id: participant.id,
      overrideAccess: true,
      data: { firstName, lastName, phone: phone || participant.phone },
    });
  } else {
    participant = await payload.create({
      collection: 'participants',
      overrideAccess: true,
      draft: false,
      data: { firstName, lastName, email: normalizedEmail, phone },
    });
  }

  // Check duplicate registration (same participant + event, not cancelled)
  const existingReg = await payload.find({
    collection: 'registrations',
    where: {
      and: [
        { event: { equals: eventId } },
        { participant: { equals: participant.id } },
        { status: { not_equals: 'cancelled' } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  });

  if (existingReg.docs.length > 0) {
    return Response.json({ error: 'Du bist bereits für diese Veranstaltung angemeldet.' }, { status: 409 });
  }

  // Check capacity (race-condition-safe: check right before create)
  const registrations = await payload.find({
    collection: 'registrations',
    where: {
      and: [{ event: { equals: eventId } }, { status: { equals: 'confirmed' } }],
    },
    limit: 0,
    overrideAccess: true,
  });

  const spotsUsed = registrations.totalDocs;
  if (spotsUsed >= (event.maxParticipants as number)) {
    return Response.json(
      {
        error:
          'Diese Veranstaltung ist leider ausgebucht. Melde dich für unseren Newsletter an, um über neue Termine informiert zu werden.',
      },
      { status: 409 },
    );
  }

  const registration = await payload.create({
    collection: 'registrations',
    overrideAccess: true,
    draft: false,
    data: {
      event: eventId,
      participant: participant.id,
      status: 'confirmed',
      consentTimestamp: new Date().toISOString(),
      note: note || undefined,
    },
  });

  // Send confirmation email
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const siteUrl = process.env.SITE_URL || 'http://localhost:4400';
    const eventDate = new Date(event.eventDate as string).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM || 'hallo@mens-circle.de',
      to: normalizedEmail,
      subject: `Anmeldung bestätigt: ${event.title}`,
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
          <h2>Hallo ${firstName},</h2>
          <p>deine Anmeldung für <strong>${event.title}</strong> wurde bestätigt.</p>
          <table style="margin:1rem 0;border-collapse:collapse;">
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Datum:</td><td>${eventDate}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Uhrzeit:</td><td>${event.startTime} – ${event.endTime} Uhr</td></tr>
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Ort:</td><td>${event.location}${event.city ? `, ${event.city}` : ''}</td></tr>
          </table>
          <p>Wir freuen uns auf dich!</p>
          <p>Dein Männerkreis-Team</p>
          <hr style="margin:2rem 0;border:none;border-top:1px solid #ddd;">
          <p style="font-size:0.85rem;color:#666;">
            <a href="${siteUrl}/impressum">Impressum</a> · <a href="${siteUrl}/datenschutz">Datenschutz</a>
          </p>
        </div>
      `,
    });

    // Send admin notification
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || 'hallo@mens-circle.de',
        to: adminEmail,
        subject: `Neue Anmeldung: ${event.title}`,
        html: `
          <div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
            <h2>Neue Anmeldung</h2>
            <p><strong>${firstName} ${lastName}</strong> hat sich für <strong>${event.title}</strong> angemeldet.</p>
            <table style="margin:1rem 0;border-collapse:collapse;">
              <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">E-Mail:</td><td>${normalizedEmail}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Telefon:</td><td>${phone}</td></tr>
              ${note ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Anmerkung:</td><td>${note}</td></tr>` : ''}
              <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Plätze belegt:</td><td>${spotsUsed + 1} / ${event.maxParticipants}</td></tr>
            </table>
            <p><a href="${process.env.CMS_URL || 'http://localhost:3001'}/admin/collections/registrations/${registration.id}">Im Admin ansehen</a></p>
          </div>
        `,
      });
    }
  } catch (e) {
    console.error('Email send error:', e);
  }

  return Response.json({
    success: true,
    message: 'Deine Anmeldung war erfolgreich! Du erhältst eine Bestätigung per E-Mail.',
    status: registration.status,
  });
};
