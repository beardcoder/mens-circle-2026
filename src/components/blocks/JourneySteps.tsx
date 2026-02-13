interface JourneyStep {
  number?: string | null;
  title: string;
  description?: string | null;
}

interface JourneyStepsProps {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  steps: JourneyStep[];
}

export default function JourneySteps({ eyebrow, title, subtitle, steps }: JourneyStepsProps) {
  // HowTo Schema.org Structured Data
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title || 'Deine Reise zum Männerkreis',
    description: subtitle || 'Wie du Teil des Männerkreis wirst',
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.description || step.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <section className="section section--large journey-section" id="reise" aria-labelledby="journey-title">
        <div className="container">
          <div className="journey__header fade-in">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}

            {title && (
              <h2
                className="section-title journey__title"
                id="journey-title"
                dangerouslySetInnerHTML={{ __html: title }}
              />
            )}

            {subtitle && <p className="journey__subtitle">{subtitle}</p>}
          </div>

          <div className="journey__steps stagger-children">
            {steps.map((step, index) => (
              <div key={index} className="journey__step">
                {step.number && (
                  <div className="journey__step-number" aria-hidden="true">
                    {step.number}
                  </div>
                )}

                {step.title && <h3 className="journey__step-title">{step.title}</h3>}

                {step.description && <p className="journey__step-text">{step.description}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
