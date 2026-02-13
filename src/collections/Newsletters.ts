import type { CollectionConfig } from 'payload';

const isAuthenticated = ({ req: { user } }: { req: { user: unknown } }) => Boolean(user);

export const Newsletters: CollectionConfig = {
  slug: 'newsletters',
  access: {
    read: isAuthenticated,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'status', 'recipientsCount', 'sentAt'],
    group: 'Newsletter',
    description: 'Kampagnen erstellen und versenden',
    listSearchableFields: ['subject'],
  },
  fields: [
    {
      name: 'subject',
      type: 'text',
      required: true,
      label: 'Betreff',
      admin: {
        description: 'Der Betreff der E-Mail',
      },
    },
    {
      name: 'preheader',
      type: 'text',
      label: 'Vorschautext',
      maxLength: 100,
      admin: {
        description: 'Optional: Wird in vielen E-Mail-Clients als Vorschau angezeigt',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Inhalt',
    },
    {
      type: 'collapsible',
      label: 'Versand-Informationen',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'draft',
          label: 'Status',
          options: [
            { label: 'Entwurf', value: 'draft' },
            { label: 'Wird gesendet', value: 'sending' },
            { label: 'Gesendet', value: 'sent' },
          ],
          admin: {
            readOnly: true,
            description: 'Status wird automatisch aktualisiert',
          },
        },
        {
          name: 'sentAt',
          type: 'date',
          label: 'Gesendet am',
          admin: {
            readOnly: true,
            date: {
              displayFormat: 'dd.MM.yyyy HH:mm',
            },
          },
        },
        {
          name: 'recipientsCount',
          type: 'number',
          label: 'Anzahl Empfänger',
          admin: {
            readOnly: true,
            description: 'Anzahl der Empfänger beim Versand',
          },
        },
      ],
    },
  ],
};
