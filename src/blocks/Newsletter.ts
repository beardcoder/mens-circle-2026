import type { Block } from 'payload';

export const NewsletterBlock: Block = {
  slug: 'newsletter',
  labels: { singular: 'Newsletter', plural: 'Newsletter' },
  fields: [
    { name: 'eyebrow', type: 'text', label: 'Eyebrow', defaultValue: 'Newsletter' },
    { name: 'title', type: 'text', label: 'Titel', defaultValue: 'Bleib informiert' },
    { name: 'text', type: 'textarea', label: 'Text' },
  ],
};
