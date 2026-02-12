import type { Media } from '@/payload-types';
import { getMediaUrl, getMediaAlt } from '@/lib/payload-api';

interface HeroProps {
  label?: string | null;
  title: string;
  description?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  backgroundImage?: Media | number | null;
}

export default function Hero({
  label,
  title,
  description,
  ctaText,
  ctaLink,
  backgroundImage,
}: HeroProps) {
  const bgImageUrl = getMediaUrl(backgroundImage);
  const bgImageAlt = getMediaAlt(backgroundImage);

  return (
    <section className="hero" role="banner">
      <div className="hero__bg">
        {bgImageUrl && (
          <img
            src={bgImageUrl}
            alt={bgImageAlt || title}
            className="hero__bg-image"
            loading="eager"
            fetchPriority="high"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="hero__circles" aria-hidden="true">
        <div className="hero__circle hero__circle--1"></div>
        <div className="hero__circle hero__circle--2"></div>
        <div className="hero__circle hero__circle--3"></div>
        <div className="hero__circle hero__circle--4"></div>
      </div>

      <div className="container">
        <div className="hero__content">
          {label && <p className="hero__label">{label}</p>}

          {title && (
            <h1 className="hero__title">
              <span dangerouslySetInnerHTML={{ __html: title }} />
            </h1>
          )}

          <div className="hero__bottom">
            {description && <p className="hero__description">{description}</p>}

            {ctaText && ctaLink && (
              <div className="hero__cta fade-in-delay-3">
                <a href={ctaLink} className="btn btn--primary btn--large">
                  {ctaText}
                </a>
                <div className="hero__scroll fade-in-delay-4">
                  <span>Entdecken</span>
                  <div className="hero__scroll-line" aria-hidden="true" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
