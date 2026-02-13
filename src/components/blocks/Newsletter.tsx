'use client';

import { useState, FormEvent } from 'react';

interface NewsletterProps {
  eyebrow?: string | null;
  title?: string | null;
  text?: string | null;
}

export default function Newsletter({ eyebrow, title, text }: NewsletterProps) {
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      setMessage({
        text: data.message || data.error,
        type: data.success ? 'success' : 'error',
      });

      if (data.success) {
        e.currentTarget.reset();
      }
    } catch {
      setMessage({
        text: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.',
        type: 'error',
      });
    }
  };

  return (
    <section className="section newsletter-section" id="newsletter" aria-labelledby="newsletter-title">
      <div className="container">
        <div className="newsletter__layout fade-in">
          <div className="newsletter__content">
            {eyebrow && <p className="eyebrow eyebrow--secondary">{eyebrow}</p>}

            <h2
              className="section-title newsletter__title"
              id="newsletter-title"
              dangerouslySetInnerHTML={{ __html: title || 'Bleib informiert' }}
            />

            {text && <p className="newsletter__text">{text}</p>}
          </div>

          <div className="newsletter__form-wrapper">
            <form onSubmit={handleSubmit} className="newsletter__form" aria-label="Newsletter-Anmeldung">
              <label htmlFor="newsletter-email" className="sr-only">
                E-Mail-Adresse
              </label>
              <input
                type="email"
                id="newsletter-email"
                name="email"
                placeholder="Deine E-Mail-Adresse"
                required
                className="newsletter__input"
                autoComplete="email"
                inputMode="email"
              />
              <button type="submit" className="btn btn--primary">
                Anmelden
              </button>
              {message && (
                <div
                  className={`form-message form-message--${message.type}`}
                  role="status"
                  aria-live="polite"
                >
                  {message.text}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
