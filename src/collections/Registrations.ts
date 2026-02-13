import type { CollectionConfig } from 'payload';

const isAuthenticated = ({ req: { user } }: { req: { user: unknown } }) => Boolean(user);

export const Registrations: CollectionConfig = {
  slug: 'registrations',
  access: {
    read: isAuthenticated,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  defaultSort: '-createdAt',
  admin: {
    defaultColumns: ['event', 'participant', 'status', 'createdAt'],
    group: 'Veranstaltungen',
    description: 'Event-Anmeldungen verwalten',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'event',
          type: 'relationship',
          relationTo: 'events',
          required: true,
          label: 'Veranstaltung',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'participant',
          type: 'relationship',
          relationTo: 'participants',
          required: true,
          label: 'Teilnehmer',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'confirmed',
      label: 'Status',
      options: [
        { label: 'Bestätigt', value: 'confirmed' },
        { label: 'Storniert', value: 'cancelled' },
      ],
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'Anmerkung vom Teilnehmer',
      admin: {
        rows: 3,
      },
    },
    {
      type: 'collapsible',
      label: 'Datenschutz & Metadaten',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'consentTimestamp',
          type: 'date',
          label: 'Einwilligung erteilt am',
          admin: {
            readOnly: true,
            date: {
              displayFormat: 'dd.MM.yyyy HH:mm',
            },
          },
        },
      ],
    },
  ],
};
