import type { CollectionConfig } from 'payload';
import crypto from 'crypto';

const isAuthenticated = ({ req: { user } }: { req: { user: unknown } }) => Boolean(user);

export const NewsletterSubscriptions: CollectionConfig = {
  slug: 'newsletter-subscriptions',
  access: {
    read: isAuthenticated,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  defaultSort: '-createdAt',
  admin: {
    defaultColumns: ['participant', 'status', 'confirmedAt', 'createdAt'],
    group: 'Newsletter',
    description: 'Abonnenten verwalten',
  },
  fields: [
    {
      name: 'participant',
      type: 'relationship',
      relationTo: 'participants',
      required: true,
      label: 'Teilnehmer',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      label: 'Status',
      options: [
        { label: 'Ausstehend', value: 'pending' },
        { label: 'Bestätigt', value: 'confirmed' },
        { label: 'Abgemeldet', value: 'unsubscribed' },
      ],
    },
    {
      name: 'token',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (!value) {
              return crypto.randomBytes(32).toString('hex');
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'confirmToken',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (!value) {
              return crypto.randomBytes(32).toString('hex');
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'requestedAt',
      type: 'date',
      label: 'Angemeldet am',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'confirmedAt',
      type: 'date',
      label: 'Bestätigt am',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'unsubscribedAt',
      type: 'date',
      label: 'Abgemeldet am',
      admin: {
        position: 'sidebar',
      },
    },
  ],
};
