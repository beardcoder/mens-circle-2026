import { getSettings, getPage, getTestimonials } from '@/lib/payload-api';
import BlockRenderer from '@/components/blocks/BlockRenderer';

export default async function Home() {
  const settings = await getSettings().catch(() => null);
  const testimonials = await getTestimonials().catch(() => []);

  // Get homepage slug from settings
  const homepageSlug =
    typeof settings?.homepage === 'object' && settings.homepage && 'slug' in settings.homepage
      ? settings.homepage.slug
      : 'home';

  const page = await getPage(homepageSlug || 'home').catch(() => null);

  const blocks = page?.content || [];
  const hasTestimonialsBlock = blocks.some((b: any) => b?.blockType === 'testimonials');

  if (!page || blocks.length === 0) {
    // Fallback content if no page data
    return (
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__circles" aria-hidden="true">
          <div className="hero__circle hero__circle--1" />
          <div className="hero__circle hero__circle--2" />
          <div className="hero__circle hero__circle--3" />
        </div>
        <div className="container">
          <div className="hero__content">
            <p className="hero__label">Willkommen</p>
            <h1 className="hero__title">
              <span className="hero__title-line">Männerkreis Niederbayern</span>
            </h1>
            <div className="hero__bottom">
              <p className="hero__description">
                Ein Raum für echte Begegnung unter Männern. Erstelle Inhalte im CMS unter{' '}
                <a href="/admin">/admin</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return <BlockRenderer blocks={blocks} testimonials={hasTestimonialsBlock ? testimonials : []} />;
}
