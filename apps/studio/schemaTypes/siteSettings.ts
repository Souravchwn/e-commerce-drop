import { defineField, defineType } from 'sanity'

export const siteSettingsSchema = defineType({
  name:  'siteSettings',
  title: 'Site Settings',
  type:  'document',

  groups: [
    { name: 'announcement', title: 'Announcement Bar', default: true },
    { name: 'contact',      title: 'Contact'                         },
    { name: 'drops',        title: 'Drop Settings'                   },
  ],

  fields: [
    /* ── Announcement bar ──────────────────────────────────────── */
    defineField({
      name:        'announcementEnabled',
      title:       'Show Announcement Bar',
      type:        'boolean',
      group:       'announcement',
      initialValue: true,
      description: 'Display the scrolling red banner at the top of the storefront.',
    }),
    defineField({
      name:        'announcementText',
      title:       'Announcement Text',
      type:        'string',
      group:       'announcement',
      description: 'Text that scrolls in the red announcement bar. Keep it short.',
      initialValue: 'New Drop — 1-of-1 Sculptures & Antiques · Worldwide Shipping · Wire Transfer Available ≥ $5,000 · Each Piece Certified Authentic',
      validation:  (R) => R.max(300),
    }),

    /* ── Contact ────────────────────────────────────────────────── */
    defineField({
      name:  'contactEmail',
      title: 'Contact Email',
      type:  'string',
      group: 'contact',
      initialValue: 'hello@galeriaxolo.com',
      validation: (R) =>
        R.custom((val: unknown) => {
          if (!val) return true
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val as string)
            ? true
            : 'Must be a valid email address'
        }),
    }),
    defineField({
      name:  'ordersEmail',
      title: 'Orders Email',
      type:  'string',
      group: 'contact',
      initialValue: 'orders@galeriaxolo.com',
    }),

    /* ── Drop settings ──────────────────────────────────────────── */
    defineField({
      name:        'dropFrequency',
      title:       'Drop Frequency Label',
      type:        'string',
      group:       'drops',
      description: 'Shown in the "About" page and metadata. e.g. "every 2–4 weeks"',
      initialValue: 'every 2–4 weeks',
    }),
    defineField({
      name:        'wireThreshold',
      title:       'Wire Transfer Threshold (USD)',
      type:        'number',
      group:       'drops',
      description: 'Orders at or above this amount require wire transfer. Must match WIRE_THRESHOLD_CENTS in types/index.ts ÷ 100.',
      readOnly:    true,
      initialValue: 5000,
    }),
    defineField({
      name:        'holdHours',
      title:       'Wire Hold Duration (hours)',
      type:        'number',
      group:       'drops',
      description: 'How long a wire reservation holds the item before it moves to admin_hold.',
      readOnly:    true,
      initialValue: 48,
    }),
  ],

  preview: {
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})
