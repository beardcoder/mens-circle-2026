import type { CollectionConfig } from 'payload';
import { triggerRevalidate } from '@/lib/triggerRevalidate';

const isAuthenticated = ({ req: { user } }: { req: { user: unknown } }) => Boolean(user);

export const Events: CollectionConfig = {
  slug: 'events',
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc }) => {
        // Trigger Astro revalidation when event publish status changes or content is updated while published
        if (doc.published !== previousDoc?.published || doc.published) {
          await triggerRevalidate('events', doc.slug);
        }
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        // Trigger full revalidation on delete
        await triggerRevalidate('events', doc.slug);
      },
    ],
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'eventDate', 'location', 'published'],
    group: 'Veranstaltungen',
    description: 'Verwalte Events und Termine für den Männerkreis',
    listSearchableFields: ['title', 'location', 'city'],
    preview: (doc) => {
      if (doc.slug) {
        return `${process.env.SITE_URL || 'http://localhost:4321'}/events/${doc.slug}`;
      }
      return '';
    },
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Allgemein',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              label: 'Titel',
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              label: 'URL-Slug',
              admin: {
                description: 'Wird für die URL verwendet: /events/[slug]',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              required: true,
              label: 'Beschreibung',
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              label: 'Titelbild',
            },
          ],
        },
        {
          label: 'Termin & Ort',
          fields: [
            {
              name: 'eventDate',
              type: 'date',
              required: true,
              label: 'Datum',
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                  displayFormat: 'dd.MM.yyyy',
                },
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'startTime',
                  type: 'text',
                  required: true,
                  label: 'Startzeit',
                  admin: {
                    placeholder: '19:00',
                    width: '50%',
                  },
                },
                {
                  name: 'endTime',
                  type: 'text',
                  required: true,
                  label: 'Endzeit',
                  admin: {
                    placeholder: '21:30',
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'location',
              type: 'text',
              required: true,
              label: 'Ortsname',
            },
            {
              name: 'street',
              type: 'text',
              label: 'Straße & Hausnummer',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'zip',
                  type: 'text',
                  label: 'PLZ',
                  admin: {
                    width: '30%',
                  },
                },
                {
                  name: 'city',
                  type: 'text',
                  label: 'Stadt',
                  defaultValue: 'Straubing',
                  admin: {
                    width: '70%',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Einstellungen',
          fields: [
            {
              name: 'maxParticipants',
              type: 'number',
              required: true,
              label: 'Max. Teilnehmer',
              defaultValue: 12,
              min: 1,
              admin: {
                description: 'Maximale Anzahl an Teilnehmern für dieses Event',
              },
            },
            {
              name: 'costBasis',
              type: 'text',
              label: 'Kostenbasis',
              defaultValue: 'Auf Spendenbasis',
            },
            {
              name: 'published',
              type: 'checkbox',
              defaultValue: false,
              label: 'Veröffentlicht',
              admin: {
                description: 'Event auf der Website sichtbar machen',
              },
            },
          ],
        },
      ],
    },
  ],
};
