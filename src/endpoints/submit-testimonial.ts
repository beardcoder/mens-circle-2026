import type { PayloadHandler } from 'payload';

export const submitTestimonialEndpoint: PayloadHandler = async (req) => {
  const { payload } = req;
  const data = await req.json!();

  const { content, authorName, authorRole, email } = data;

  if (!content || !email) {
    return Response.json(
      { error: 'Bitte fülle alle Pflichtfelder aus (Erfahrungsbericht und E-Mail).' },
      { status: 400 },
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return Response.json({ error: 'Bitte gib eine gültige E-Mail-Adresse an.' }, { status: 400 });
  }

  await payload.create({
    collection: 'testimonials',
    overrideAccess: true,
    draft: false,
    data: {
      content,
      authorName: authorName || undefined,
      authorRole: authorRole || undefined,
      email: email.toLowerCase().trim(),
      published: false,
      sortOrder: 0,
    },
  });

  return Response.json({
    success: true,
    message: 'Vielen Dank für deinen Erfahrungsbericht! Er wird nach Prüfung veröffentlicht.',
  });
};
