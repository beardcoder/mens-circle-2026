import type { Media } from '@/payload-types';
import { getMediaUrl, getMediaAlt } from '@/lib/payload-api';

interface ModeratorProps {
  eyebrow?: string | null;
  name: string;
  bio: string;
  quote?: string | null;
  photo?: Media | number | null;
}

export default function Moderator({ eyebrow, name, bio, quote, photo }: ModeratorProps) {
  const photoUrl = getMediaUrl(photo);
  const photoAlt = getMediaAlt(photo);

  return (
    <section className="section moderator-section" id="moderator">
      <div className="container">
        <div className="moderator__layout">
          <div className="moderator__photo-wrapper fade-in">
            <div className="moderator__photo">
              {photoUrl ? (
                <img src={photoUrl} alt={photoAlt || name} loading="lazy" decoding="async" />
              ) : (
                <div className="moderator__photo-placeholder">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                  </svg>
                  <span>Foto</span>
                </div>
              )}
            </div>
            <div className="moderator__photo-accent"></div>
          </div>

          <div className="moderator__content fade-in fade-in-delay-1">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}

            {name && <h2 className="moderator__name" dangerouslySetInnerHTML={{ __html: name }} />}

            {bio && <div className="moderator__bio" dangerouslySetInnerHTML={{ __html: bio }} />}

            {quote && (
              <blockquote className="moderator__quote">
                <p>{quote}</p>
              </blockquote>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
