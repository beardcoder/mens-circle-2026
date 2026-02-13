import type { Block } from 'payload';

export const ModeratorBlock: Block = {
  slug: 'moderator',
  labels: { singular: 'Moderator', plural: 'Moderatoren' },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Name' },
    { name: 'role', type: 'text', label: 'Rolle' },
    { name: 'bio', type: 'textarea', required: true, label: 'Biografie' },
    { name: 'quote', type: 'text', label: 'Zitat' },
    { name: 'photo', type: 'upload', relationTo: 'media', label: 'Foto' },
  ],
};
