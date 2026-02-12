import type { Page, Testimonial } from '@/payload-types';
import Hero from './Hero';
import Intro from './Intro';
import ValueItems from './ValueItems';
import Moderator from './Moderator';
import JourneySteps from './JourneySteps';
import Testimonials from './Testimonials';
import FAQ from './FAQ';
import Newsletter from './Newsletter';
import CTA from './CTA';
import WhatsAppCommunity from './WhatsAppCommunity';
import TextSection from './TextSection';

interface BlockRendererProps {
  blocks: Page['content'];
  testimonials?: Testimonial[];
}

export default function BlockRenderer({ blocks, testimonials = [] }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <>
      {blocks.map((block, index) => {
        if (!block || !block.blockType) return null;

        // Cast to any for easier property access since block types vary
        const b = block as any;

        switch (block.blockType) {
          case 'hero':
            return (
              <Hero
                key={index}
                label={b.label}
                title={b.title}
                description={b.description}
                ctaText={b.ctaText}
                ctaLink={b.ctaLink}
                backgroundImage={b.backgroundImage}
              />
            );
          case 'intro':
            return (
              <Intro
                key={index}
                eyebrow={b.eyebrow}
                title={b.title}
                text={b.text}
                quote={b.quote}
                values={b.values}
              />
            );
          case 'valueItems':
            return <ValueItems key={index} eyebrow={b.eyebrow} title={b.title} items={b.items} />;
          case 'moderator':
            return (
              <Moderator
                key={index}
                eyebrow={b.eyebrow}
                name={b.name}
                bio={b.bio}
                quote={b.quote}
                photo={b.photo}
              />
            );
          case 'journeySteps':
            return (
              <JourneySteps
                key={index}
                eyebrow={b.eyebrow}
                title={b.title}
                subtitle={b.subtitle}
                steps={b.steps}
              />
            );
          case 'testimonials':
            return (
              <Testimonials
                key={index}
                eyebrow={b.eyebrow}
                title={b.title}
                subtitle={b.subtitle}
                testimonials={testimonials}
              />
            );
          case 'faq':
            return <FAQ key={index} eyebrow={b.eyebrow} title={b.title} intro={b.intro} items={b.items} />;
          case 'newsletter':
            return <Newsletter key={index} eyebrow={b.eyebrow} title={b.title} text={b.text} />;
          case 'cta':
            return (
              <CTA
                key={index}
                eyebrow={b.eyebrow}
                title={b.title}
                text={b.text}
                buttonText={b.buttonText}
                buttonLink={b.buttonLink}
              />
            );
          case 'whatsappCommunity':
            return (
              <WhatsAppCommunity
                key={index}
                eyebrow={b.eyebrow}
                title={b.title}
                text={b.text}
                link={b.link}
                hint={b.hint}
              />
            );
          case 'textSection':
            return <TextSection key={index} eyebrow={b.eyebrow} title={b.title} content={b.content} />;
          default:
            console.warn(`Unknown block type: ${(block as any).blockType}`);
            return null;
        }
      })}
    </>
  );
}
