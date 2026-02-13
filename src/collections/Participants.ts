import type { CollectionConfig } from 'payload';

const isAuthenticated = ({ req: { user } }: { req: { user: unknown } }) => Boolean(user);

export const Participants: CollectionConfig = {
  slug: 'participants',
  access: {
    read: isAuthenticated,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email', 'phone'],
    group: 'Veranstaltungen',
    description: 'Teilnehmer-Stammdaten',
    listSearchableFields: ['firstName', 'lastName', 'email'],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'firstName',
          type: 'text',
          required: true,
          label: 'Vorname',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'lastName',
          type: 'text',
          required: true,
          label: 'Nachname',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
          unique: true,
          label: 'E-Mail',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Telefon',
          admin: {
            width: '50%',
            placeholder: '+49 123 456789',
          },
        },
      ],
    },
  ],
};
