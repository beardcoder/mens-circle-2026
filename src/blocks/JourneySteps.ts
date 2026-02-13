import type { Block } from 'payload';

export const JourneyStepsBlock: Block = {
  slug: 'journeySteps',
  labels: { singular: 'Reise-Schritte', plural: 'Reise-Schritte' },
  fields: [
    { name: 'eyebrow', type: 'text', label: 'Eyebrow' },
    { name: 'title', type: 'text', label: 'Titel' },
    {
      name: 'steps',
      type: 'array',
      label: 'Schritte',
      fields: [
        { name: 'number', type: 'text', label: 'Nummer' },
        { name: 'title', type: 'text', required: true, label: 'Titel' },
        { name: 'text', type: 'textarea', required: true, label: 'Text' },
      ],
    },
  ],
};
