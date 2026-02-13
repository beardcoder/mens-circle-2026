import type { PayloadHandler } from 'payload';
import nodemailer from 'nodemailer';

export const subscribeEndpoint: PayloadHandler = async (req) => {
  const { payload } = req;
  const data = await req.json!();

  const { email, firstName, lastName } = data;

  if (!email) {
    return Response.json({ error: 'Bitte gib deine E-Mail-Adresse an.' }, { status: 400 });
  }

  // Find or create participant
  const existingParticipants = await payload.find({
    collection: 'participants',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  });

  let participant;
  if (existingParticipants.docs.length > 0) {
    participant = existingParticipants.docs[0];
  } else {
    participant = await payload.create({
      collection: 'participants',
      overrideAccess: true,
      draft: false,
      data: {
        firstName: firstName || 'Newsletter',
        lastName: lastName || 'Abonnent',
        email,
      },
    });
  }

  // Check if already confirmed
  const existingSub = await payload.find({
    collection: 'newsletter-subscriptions',
    where: {
      and: [{ participant: { equals: participant.id } }, { status: { equals: 'confirmed' } }],
    },
    limit: 1,
    overrideAccess: true,
  });

  if (existingSub.docs.length > 0) {
    return Response.json({ error: 'Du bist bereits für den Newsletter angemeldet.' }, { status: 409 });
  }

  // Check for existing pending subscription and resend confirmation
  const pendingSub = await payload.find({
    collection: 'newsletter-subscriptions',
    where: {
      and: [{ participant: { equals: participant.id } }, { status: { equals: 'pending' } }],
    },
    limit: 1,
    overrideAccess: true,
  });

  let subscription;
  if (pendingSub.docs.length > 0) {
    subscription = pendingSub.docs[0];
  } else {
    subscription = await payload.create({
      collection: 'newsletter-subscriptions',
      overrideAccess: true,
      draft: false,
      data: {
        participant: participant.id,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      },
    });
  }

  // Send Double Opt-In confirmation email
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

    await transporter.sendMail({
      from: process.env.MAIL_FROM || 'hallo@mens-circle.de',
      to: email,
      subject: 'Bitte bestätige deine Newsletter-Anmeldung',
      html: `
        <h2>Fast geschafft!</h2>
        <p>Du hast dich für den Newsletter des Männerkreis Niederbayern/Straubing angemeldet.</p>
        <p>Bitte bestätige deine Anmeldung, indem du auf den folgenden Link klickst:</p>
        <p><a href="${siteUrl}/newsletter/confirm/${subscription.confirmToken}">Newsletter-Anmeldung bestätigen</a></p>
        <p>Falls du dich nicht angemeldet hast, kannst du diese E-Mail einfach ignorieren.</p>
        <p>Dein Männerkreis-Team</p>
      `,
    });
  } catch (e) {
    console.error('Email send error:', e);
  }

  return Response.json({
    success: true,
    message: 'Bitte bestätige deine Anmeldung über den Link in der E-Mail, die wir dir geschickt haben.',
  });
};
