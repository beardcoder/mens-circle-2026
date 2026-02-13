import type { Block } from 'payload';

export const TextSectionBlock: Block = {
  slug: 'textSection',
  labels: { singular: 'Text-Abschnitt', plural: 'Text-Abschnitte' },
  fields: [
    { name: 'eyebrow', type: 'text', label: 'Eyebrow' },
    { name: 'title', type: 'text', label: 'Titel' },
    { name: 'content', type: 'richText', required: true, label: 'Inhalt' },
  ],
};
