import type { PayloadHandler } from 'payload';
import nodemailer from 'nodemailer';

export const confirmSubscriptionEndpoint: PayloadHandler = async (req) => {
  const { payload } = req;
  const url = new URL(req.url || '', 'http://localhost');
  const token = url.pathname.split('/').pop();

  if (!token) {
    return Response.json({ error: 'Ungültiger Bestätigungslink.' }, { status: 400 });
  }

  const subscriptions = await payload.find({
    collection: 'newsletter-subscriptions',
    where: { confirmToken: { equals: token } },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  });

  if (subscriptions.docs.length === 0) {
    return Response.json({ error: 'Bestätigungslink ungültig oder bereits verwendet.' }, { status: 404 });
  }

  const subscription = subscriptions.docs[0];

  if (subscription.status === 'confirmed') {
    return Response.json({ success: true, message: 'Deine Anmeldung wurde bereits bestätigt.' });
  }

  if (subscription.status === 'unsubscribed') {
    return Response.json({ error: 'Dieses Abonnement wurde abgemeldet.' }, { status: 410 });
  }

  await payload.update({
    collection: 'newsletter-subscriptions',
    id: subscription.id,
    overrideAccess: true,
    data: {
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
    },
  });

  // Send welcome email
  try {
    const participant = typeof subscription.participant === 'object' ? subscription.participant : null;
    if (participant?.email) {
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
        to: participant.email,
        subject: 'Willkommen beim Männerkreis Newsletter',
        html: `
          <h2>Willkommen!</h2>
          <p>Deine Newsletter-Anmeldung ist jetzt bestätigt.</p>
          <p>Wir informieren dich über kommende Treffen und Neuigkeiten.</p>
          <p>Falls du den Newsletter abbestellen möchtest, klicke <a href="${siteUrl}/newsletter/unsubscribe/${subscription.token}">hier</a>.</p>
          <p>Dein Männerkreis-Team</p>
        `,
      });
    }
  } catch (e) {
    console.error('Welcome email error:', e);
  }

  return Response.json({
    success: true,
    message: 'Deine Newsletter-Anmeldung wurde erfolgreich bestätigt!',
  });
};
