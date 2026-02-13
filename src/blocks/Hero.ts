import type { Block } from 'payload';

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'label', type: 'text', label: 'Label' },
    { name: 'title', type: 'text', required: true, label: 'Titel' },
    { name: 'description', type: 'textarea', label: 'Beschreibung' },
    { name: 'ctaText', type: 'text', label: 'CTA Text' },
    { name: 'ctaLink', type: 'text', label: 'CTA Link' },
    { name: 'backgroundImage', type: 'upload', relationTo: 'media', label: 'Hintergrundbild' },
  ],
};
