import type { CollectionConfig } from 'payload';
import { triggerRevalidate } from '@/lib/triggerRevalidate';

const isAuthenticated = ({ req: { user } }: { req: { user: unknown } }) => Boolean(user);

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  access: {
    read: () => true,
    create: () => true,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  defaultSort: 'sortOrder',
  hooks: {
    afterChange: [
      async ({ doc, previousDoc }) => {
        // Trigger revalidation when testimonial publish status changes or when published content is updated
        // This ensures both publishing/unpublishing and content updates trigger revalidation
        if (doc.published !== previousDoc?.published || doc.published) {
          await triggerRevalidate('testimonials');
        }
      },
    ],
    afterDelete: [
      async () => {
        // Trigger revalidation on delete
        await triggerRevalidate('testimonials');
      },
    ],
  },
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'published', 'sortOrder', 'createdAt'],
    group: 'Inhalte',
    description: 'Erfahrungsberichte moderieren',
    listSearchableFields: ['authorName', 'content'],
  },
  fields: [
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: 'Erfahrungsbericht',
      admin: {
        rows: 5,
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'authorName',
          type: 'text',
          label: 'Name',
          admin: {
            width: '50%',
            description: 'Optional - kann auch anonym bleiben',
          },
        },
        {
          name: 'authorRole',
          type: 'text',
          label: 'Rolle / Beschreibung',
          admin: {
            width: '50%',
            placeholder: 'z.B. Teilnehmer seit 2024',
          },
        },
      ],
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: 'E-Mail (nicht öffentlich)',
      admin: {
        description: 'Nur für Rückfragen, wird nicht öffentlich angezeigt.',
      },
    },
    {
      type: 'collapsible',
      label: 'Veröffentlichung',
      fields: [
        {
          name: 'published',
          type: 'checkbox',
          defaultValue: false,
          label: 'Veröffentlicht',
        },
        {
          name: 'publishedAt',
          type: 'date',
          label: 'Veröffentlicht am',
          admin: {
            date: {
              displayFormat: 'dd.MM.yyyy',
            },
          },
        },
        {
          name: 'sortOrder',
          type: 'number',
          label: 'Reihenfolge',
          defaultValue: 0,
          admin: {
            description: 'Kleinere Zahlen erscheinen zuerst',
          },
        },
      ],
    },
  ],
};
