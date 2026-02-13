import type { Testimonial } from '@/payload-types';

interface TestimonialsProps {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  testimonials: Testimonial[];
}

export default function Testimonials({ eyebrow, title, subtitle, testimonials }: TestimonialsProps) {
  // ItemList Schema.org Structured Data for Testimonials
  const testimonialsSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Teilnehmerstimmen',
    description: 'Authentische Einblicke von Männern, die den Männerkreis erleben',
    numberOfItems: testimonials.length,
    itemListElement: testimonials.map((testimonial, index) => ({
      '@type': 'Review',
      position: index + 1,
      reviewBody: testimonial.content,
      author: {
        '@type': 'Person',
        name: testimonial.authorName || 'Anonymer Teilnehmer',
      },
      itemReviewed: {
        '@type': 'Organization',
        '@id': `${process.env.NEXT_PUBLIC_SITE_URL || ''}#organization`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(testimonialsSchema) }}
      />

      <section className="section section--large testimonials-section" id="stimmen" aria-labelledby="testimonials-title">
        <div className="container">
          <div className="testimonials__header fade-in">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && (
              <h2
                className="section-title testimonials__title"
                id="testimonials-title"
                dangerouslySetInnerHTML={{ __html: title }}
              />
            )}
            {subtitle && <p className="testimonials__subtitle">{subtitle}</p>}
          </div>

          <div className="testimonials__grid stagger-children">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-card__quote-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M10 16C10 13.7909 8.20914 12 6 12V8C10.4183 8 14 11.5817 14 16V22C14 23.1046 13.1046 24 12 24H8C6.89543 24 6 23.1046 6 22V18C6 16.8954 6.89543 16 8 16H10ZM24 16C24 13.7909 22.2091 12 20 12V8C24.4183 8 28 11.5817 28 16V22C28 23.1046 27.1046 24 26 24H22C20.8954 24 20 23.1046 20 22V18C20 16.8954 20.8954 16 22 16H24Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>

                <blockquote className="testimonial-card__quote">{testimonial.content}</blockquote>

                {(testimonial.authorName || testimonial.authorRole) && (
                  <div className="testimonial-card__author">
                    {testimonial.authorName && <cite className="testimonial-card__name">{testimonial.authorName}</cite>}
                    {testimonial.authorRole && <span className="testimonial-card__role">{testimonial.authorRole}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
