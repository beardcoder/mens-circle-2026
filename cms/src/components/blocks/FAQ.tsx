'use client';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  eyebrow?: string | null;
  title?: string | null;
  intro?: string | null;
  items: FAQItem[];
}

export default function FAQ({ eyebrow, title, intro, items }: FAQProps) {
  // FAQ Schema.org Structured Data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="section section--large faq-section" id="faq">
        <div className="container">
          <div className="faq__layout">
            <div className="faq__header fade-in">
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}

              {title && (
                <h2
                  className="section-title faq__title"
                  dangerouslySetInnerHTML={{ __html: title }}
                />
              )}

              {intro && <p className="faq__intro">{intro}</p>}
            </div>

            <div className="faq__list fade-in fade-in-delay-1">
              {items.map((item, index) => (
                <details key={index} className="faq-item" name="faq-accordion">
                  <summary className="faq-item__question">
                    <span>{item.question}</span>
                    <span className="faq-item__icon" aria-hidden="true" />
                  </summary>
                  <div className="faq-item__answer">
                    <div
                      className="faq-item__answer-inner"
                      dangerouslySetInnerHTML={{ __html: item.answer }}
                    />
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
