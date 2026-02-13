import type { Block } from 'payload';

export const IntroBlock: Block = {
  slug: 'intro',
  labels: { singular: 'Intro', plural: 'Intros' },
  fields: [
    { name: 'eyebrow', type: 'text', label: 'Eyebrow' },
    { name: 'title', type: 'text', required: true, label: 'Titel' },
    { name: 'text', type: 'textarea', required: true, label: 'Text' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Bild' },
    { name: 'quote', type: 'text', label: 'Zitat' },
  ],
};
