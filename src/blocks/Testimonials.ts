import type { Block } from 'payload';

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: { singular: 'Stimmen', plural: 'Stimmen' },
  fields: [
    { name: 'eyebrow', type: 'text', label: 'Eyebrow', defaultValue: 'Stimmen aus der Gemeinschaft' },
    { name: 'title', type: 'text', label: 'Titel', defaultValue: 'Was Teilnehmer sagen' },
  ],
};
