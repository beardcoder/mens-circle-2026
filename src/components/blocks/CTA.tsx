interface CTAProps {
  eyebrow?: string | null;
  title: string;
  text?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
}

export default function CTA({ eyebrow, title, text, buttonText, buttonLink }: CTAProps) {
  return (
    <section className="section section--large cta-section">
      <div className="container">
        <div className="cta__content fade-in">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}

          <h2 className="section-title cta__title" dangerouslySetInnerHTML={{ __html: title }} />

          {text && <p className="cta__text">{text}</p>}

          {buttonText && buttonLink && (
            <a
              href={buttonLink}
              className="btn btn--primary btn--large"
              data-umami-event="cta-click"
              data-umami-event-location="cta-block"
              data-umami-event-text={buttonText}
            >
              {buttonText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
