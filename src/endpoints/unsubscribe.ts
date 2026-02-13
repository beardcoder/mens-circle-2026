import type { PayloadHandler } from 'payload';

export const unsubscribeEndpoint: PayloadHandler = async (req) => {
  const { payload, routeParams } = req;
  const token = routeParams?.token as string;

  if (!token) {
    return Response.json({ error: 'Ungültiger Link.' }, { status: 400 });
  }

  const subscriptions = await payload.find({
    collection: 'newsletter-subscriptions',
    where: { token: { equals: token } },
    limit: 1,
    overrideAccess: true,
  });

  if (subscriptions.docs.length === 0) {
    return Response.json({ error: 'Abonnement nicht gefunden.' }, { status: 404 });
  }

  const subscription = subscriptions.docs[0];

  if (subscription.status === 'unsubscribed') {
    return Response.json({
      success: true,
      message: 'Du bist bereits abgemeldet.',
    });
  }

  await payload.update({
    collection: 'newsletter-subscriptions',
    id: subscription.id,
    overrideAccess: true,
    data: { status: 'unsubscribed', unsubscribedAt: new Date().toISOString() },
  });

  return Response.json({
    success: true,
    message: 'Du wurdest erfolgreich vom Newsletter abgemeldet.',
  });
};
