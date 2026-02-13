import type { Block } from 'payload';

export const WhatsAppCommunityBlock: Block = {
  slug: 'whatsappCommunity',
  labels: { singular: 'WhatsApp Community', plural: 'WhatsApp Communities' },
  fields: [
    { name: 'title', type: 'text', label: 'Titel', defaultValue: 'Tritt unserer WhatsApp Community bei' },
    { name: 'text', type: 'textarea', label: 'Text' },
    { name: 'link', type: 'text', label: 'WhatsApp Link' },
  ],
};
