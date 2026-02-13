import type { Block } from 'payload';

export const FAQBlock: Block = {
  slug: 'faq',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  fields: [
    { name: 'eyebrow', type: 'text', label: 'Eyebrow' },
    { name: 'title', type: 'text', label: 'Titel' },
    {
      name: 'items',
      type: 'array',
      label: 'Fragen',
      fields: [
        { name: 'question', type: 'text', required: true, label: 'Frage' },
        { name: 'answer', type: 'textarea', required: true, label: 'Antwort' },
      ],
    },
  ],
};
