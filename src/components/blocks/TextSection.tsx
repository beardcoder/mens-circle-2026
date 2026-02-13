interface TextSectionProps {
  eyebrow?: string | null;
  title?: string | null;
  content: string;
}

export default function TextSection({ eyebrow, title, content }: TextSectionProps) {
  const sectionId = title ? title.toLowerCase().replace(/\s+/g, '-') : undefined;

  return (
    <section className="section" id={sectionId}>
      <div className="container container--narrow">
        <div className="section__header fade-in">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}

          {title && <h2 className="section-title">{title}</h2>}
        </div>

        {content && (
          <div
            className="section__content fade-in fade-in-delay-1"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </section>
  );
}
