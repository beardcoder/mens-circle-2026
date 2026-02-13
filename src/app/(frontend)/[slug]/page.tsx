import { notFound } from 'next/navigation';
import { getPage, getTestimonials } from '@/lib/payload-api';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug).catch(() => null);

  if (!page) {
    return {
      title: 'Seite nicht gefunden',
    };
  }

  const title = page.meta?.metaTitle || page.title;
  const description = page.meta?.metaDescription;

  return {
    title,
    description,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  const blocks = page.content || [];
  const hasTestimonialsBlock = blocks.some((b: any) => b?.blockType === 'testimonials');
  const testimonials = hasTestimonialsBlock ? await getTestimonials().catch(() => []) : [];

  // If no blocks, just show the page title
  if (blocks.length === 0) {
    return (
      <section className="legal-section">
        <div className="container container--narrow">
          <h1 className="legal__title">{page.title}</h1>
        </div>
      </section>
    );
  }

  return <BlockRenderer blocks={blocks} testimonials={testimonials} />;
}
