import type { Block } from 'payload';

export const ValueItemsBlock: Block = {
  slug: 'valueItems',
  labels: { singular: 'Werte', plural: 'Werte' },
  fields: [
    { name: 'eyebrow', type: 'text', label: 'Eyebrow' },
    { name: 'title', type: 'text', label: 'Titel' },
    {
      name: 'items',
      type: 'array',
      label: 'Werte-Einträge',
      fields: [
        { name: 'number', type: 'text', label: 'Nummer' },
        { name: 'title', type: 'text', required: true, label: 'Titel' },
        { name: 'text', type: 'textarea', required: true, label: 'Text' },
      ],
    },
  ],
};
