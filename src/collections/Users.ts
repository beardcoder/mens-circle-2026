import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    useAPIKey: true,
  },
  admin: {
    useAsTitle: 'email',
    group: 'System',
    description: 'Benutzer & Zugriffe',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      label: 'Rolle',
      options: [
        {
          label: 'Administrator',
          value: 'admin',
        },
        {
          label: 'Redakteur',
          value: 'editor',
        },
      ],
    },
  ],
};
