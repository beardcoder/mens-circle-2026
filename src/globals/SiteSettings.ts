import type { GlobalConfig } from 'payload';

const isAuthenticated = ({ req: { user } }: { req: { user: unknown } }) => Boolean(user);

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Einstellungen',
  access: {
    read: () => true,
    update: isAuthenticated,
  },
  admin: {
    group: 'System',
    description: 'Allgemeine Website-Einstellungen',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      label: 'Seitenname',
      defaultValue: 'Männerkreis Niederbayern/ Straubing',
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      label: 'Beschreibung',
      defaultValue: 'Ein Raum für echte Begegnung unter Männern.',
    },
    {
      name: 'contactEmail',
      type: 'email',
      label: 'Kontakt E-Mail',
    },
    {
      name: 'contactPhone',
      type: 'text',
      label: 'Kontakt Telefon',
    },
    {
      name: 'footerText',
      type: 'text',
      label: 'Footer-Text',
      defaultValue: '© 2025 Männerkreis Niederbayern',
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Links',
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'E-Mail', value: 'email' },
            { label: 'Telefon', value: 'phone' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'WhatsApp', value: 'whatsapp' },
            { label: 'Website', value: 'website' },
          ],
        },
        { name: 'url', type: 'text', required: true, label: 'URL / Wert' },
        { name: 'label', type: 'text', label: 'Label' },
      ],
    },
    {
      name: 'homepage',
      type: 'relationship',
      relationTo: 'pages',
      label: 'Startseite',
    },
  ],
};
