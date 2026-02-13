import type { Block } from 'payload';

export const CTABlock: Block = {
  slug: 'cta',
  labels: { singular: 'Call to Action', plural: 'CTAs' },
  fields: [
    { name: 'eyebrow', type: 'text', label: 'Eyebrow' },
    { name: 'title', type: 'text', required: true, label: 'Titel' },
    { name: 'text', type: 'textarea', label: 'Text' },
    { name: 'buttonText', type: 'text', label: 'Button Text' },
    { name: 'buttonLink', type: 'text', label: 'Button Link' },
  ],
};
