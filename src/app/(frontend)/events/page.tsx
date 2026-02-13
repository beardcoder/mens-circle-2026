import type { Metadata } from 'next';
import Link from 'next/link';
import { getUpcomingEvents, getPastEvents } from '@/lib/payload-api';

export const metadata: Metadata = {
  title: 'Veranstaltungen',
  description: 'Alle Treffen des Männerkreis Niederbayern/Straubing – kommende und vergangene Termine.',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    weekday: d.toLocaleDateString('de-DE', { weekday: 'long' }),
    date: d.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }),
    short: d.toLocaleDateString('de-DE'),
  };
}

export default async function EventsPage() {
  const upcoming = await getUpcomingEvents().catch(() => []);
  const past = await getPastEvents().catch(() => []);

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
            <p className="hero__label">Männerkreis</p>
            <h1 className="hero__title">
              <span className="hero__title-line">Veranstaltungen</span>
            </h1>
            <div className="hero__bottom">
              <p className="hero__description">Finde das nächste Treffen und melde dich an.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="events-list-section">
        <div className="container">
          {upcoming.length > 0 ? (
            <>
              <div className="events-list__header fade-in">
                <p className="eyebrow">Kommende Termine</p>
                <h2 className="section-title">
                  Nächste <span className="text-italic">Treffen</span>
                </h2>
              </div>
              <div className="events-list__grid stagger-children">
                {upcoming.map((event) => {
                  const date = formatDate(event.eventDate);
                  return (
                    <Link
                      key={event.id}
                      href={`/events/${event.slug}`}
                      className="event-card fade-in"
                    >
                      <div className="event-card__date">
                        <span className="event-card__weekday">{date.weekday}</span>
                        <span className="event-card__day">{date.short}</span>
                      </div>
                      <div className="event-card__content">
                        <h3 className="event-card__title">{event.title}</h3>
                        {event.description && (
                          <p className="event-card__description">{event.description}</p>
                        )}
                        <div className="event-card__meta">
                          <span>{event.location}</span>
                          {event.startTime && <span>{event.startTime} Uhr</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="events-list__empty fade-in">
              <p>Aktuell sind keine Termine geplant. Schau bald wieder vorbei!</p>
            </div>
          )}

          {past.length > 0 && (
            <>
              <div className="events-list__header fade-in" style={{ marginTop: '4rem' }}>
                <p className="eyebrow">Vergangene Termine</p>
                <h2 className="section-title">Rückblick</h2>
              </div>
              <div className="events-list__grid stagger-children">
                {past.map((event) => {
                  const date = formatDate(event.eventDate);
                  return (
                    <div key={event.id} className="event-card event-card--past fade-in">
                      <div className="event-card__date">
                        <span className="event-card__weekday">{date.weekday}</span>
                        <span className="event-card__day">{date.short}</span>
                      </div>
                      <div className="event-card__content">
                        <h3 className="event-card__title">{event.title}</h3>
                        {event.description && (
                          <p className="event-card__description">{event.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
