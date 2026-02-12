import type { Metadata } from 'next';
import { getTestimonials } from '@/lib/payload-api';

export const metadata: Metadata = {
  title: 'Erfahrungsberichte',
  description: 'Was Teilnehmer über den Männerkreis Niederbayern/Straubing sagen.',
};

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials().catch(() => []);

  return (
    <>
      <section className="hero">
        <div className="hero__bg"></div>
        <div className="hero__circles" aria-hidden="true">
          <div className="hero__circle hero__circle--1"></div>
          <div className="hero__circle hero__circle--2"></div>
        </div>
        <div className="container">
          <div className="hero__content">
            <p className="hero__label">Stimmen</p>
            <h1 className="hero__title">
              <span className="hero__title-line">Erfahrungsberichte</span>
            </h1>
            <div className="hero__bottom">
              <p className="hero__description">Was Teilnehmer über den Männerkreis sagen.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials-page-section">
        <div className="container">
          {testimonials.length > 0 ? (
            <div className="testimonials-page__grid stagger-children">
              {testimonials.map((t) => (
                <div key={t.id} className="testimonial-card fade-in">
                  <div className="testimonial-card__quote-icon" aria-hidden="true">
                    »
                  </div>
                  <blockquote className="testimonial-card__quote">
                    <p>{t.content}</p>
                  </blockquote>
                  <div className="testimonial-card__author">
                    <span className="testimonial-card__name">{t.authorName || 'Anonym'}</span>
                    {t.authorRole && <span className="testimonial-card__role">{t.authorRole}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="testimonials-page__empty fade-in">
              <p>Noch keine Erfahrungsberichte vorhanden.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
