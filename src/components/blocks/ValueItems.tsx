interface ValueItemsProps {
  eyebrow?: string | null;
  title?: string | null;
  items: { number?: string | null; title: string; description?: string | null }[];
}

export default function ValueItems({ eyebrow, title, items }: ValueItemsProps) {
  return (
    <section className="section values-section">
      <div className="container">
        <div className="section__header fade-in">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}

          {title && <h2 className="section-title">{title}</h2>}
        </div>

        <div className="intro__values stagger-children">
          {items.map((item, index) => (
            <div key={index} className="value-item">
              {item.number && <span className="value-item__number">{item.number}</span>}

              <div className="value-item__content">
                {item.title && <h3>{item.title}</h3>}

                {item.description && <p>{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
