interface IntroProps {
  eyebrow?: string | null;
  title: string;
  text: string;
  quote?: string | null;
  values?: { number?: string | null; title: string; description?: string | null }[];
}

export default function Intro({ eyebrow, title, text, quote, values }: IntroProps) {
  return (
    <section className="intro-section" id="ueber" aria-labelledby="intro-title">
      <div className="intro__layout">
        <div className="intro__left">
          {eyebrow && <p className="eyebrow fade-in">{eyebrow}</p>}

          <h2
            className="section-title intro__title fade-in fade-in-delay-1"
            id="intro-title"
            dangerouslySetInnerHTML={{ __html: title }}
          />

          <p className="intro__text fade-in fade-in-delay-2">{text}</p>

          {values && values.length > 0 && (
            <div className="intro__values stagger-children">
              {values.map((value, index) => (
                <div key={index} className="value-item">
                  {value.number && <span className="value-item__number">{value.number}</span>}
                  <div className="value-item__content">
                    {value.title && <h3>{value.title}</h3>}
                    {value.description && <p>{value.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="intro__right">
          <div className="intro__image-area">
            <div className="intro__image-circles"></div>
            {quote && <p className="intro__image-text" dangerouslySetInnerHTML={{ __html: quote }} />}
          </div>
        </div>
      </div>
    </section>
  );
}
