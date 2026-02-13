import type { PayloadHandler } from 'payload';
import nodemailer from 'nodemailer';

interface Participant {
  email: string;
  firstName: string;
}

interface Subscription {
  participant: Participant;
  token: string;
  status: string;
}

export const sendNewsletterEndpoint: PayloadHandler = async (req) => {
  const { payload } = req;
  const data = await req.json!();
  const { newsletterId } = data;

  if (!newsletterId) {
    return Response.json({ error: 'Newsletter ID fehlt.' }, { status: 400 });
  }

  const newsletter = await payload.findByID({
    collection: 'newsletters',
    id: newsletterId,
    overrideAccess: true,
  });

  if (newsletter.status !== 'draft') {
    return Response.json({ error: 'Newsletter wurde bereits gesendet.' }, { status: 400 });
  }

  // Mark as sending
  await payload.update({
    collection: 'newsletters',
    id: newsletterId,
    overrideAccess: true,
    data: { status: 'sending' },
  });

  // Get all active subscriptions
  const subscriptions = await payload.find({
    collection: 'newsletter-subscriptions',
    where: { status: { equals: 'confirmed' } },
    limit: 10000,
    depth: 1,
    overrideAccess: true,
  });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const siteUrl = process.env.SITE_URL || 'http://localhost:4400';
  let sent = 0;
  let failed = 0;

  // Send in chunks of 50
  const chunks: Subscription[][] = [];
  const docs = subscriptions.docs as unknown as Subscription[];
  for (let i = 0; i < docs.length; i += 50) {
    chunks.push(docs.slice(i, i + 50));
  }

  for (const chunk of chunks) {
    await Promise.allSettled(
      chunk.map(async (sub) => {
        try {
          const participant = sub.participant as Participant;
          await transporter.sendMail({
            from: process.env.MAIL_FROM || 'hallo@mens-circle.de',
            to: participant.email,
            subject: newsletter.subject,
            html: `
              <div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
                <h2>${newsletter.subject}</h2>
                <div>${JSON.stringify(newsletter.content)}</div>
                <hr style="margin:2rem 0;border:none;border-top:1px solid #ddd;">
                <p style="font-size:0.85rem;color:#666;">
                  Du erhältst diese E-Mail, weil du den Newsletter des Männerkreis Niederbayern/ Straubing abonniert hast.
                  <a href="${siteUrl}/newsletter/unsubscribe/${sub.token}">Abmelden</a>
                </p>
              </div>
            `,
          });
          sent++;
        } catch {
          failed++;
        }
      }),
    );
  }

  // Mark as sent
  await payload.update({
    collection: 'newsletters',
    id: newsletterId,
    overrideAccess: true,
    data: { status: 'sent', sentAt: new Date().toISOString(), recipientsCount: sent },
  });

  return Response.json({
    success: true,
    message: `Newsletter an ${sent} Empfänger gesendet. ${failed > 0 ? `${failed} fehlgeschlagen.` : ''}`,
    sent,
    failed,
  });
};
