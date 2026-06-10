import { defineField, defineType } from 'sanity'

const STATUS_LABELS: Record<string, string> = {
  upcoming:   '⏳  Upcoming',
  live:       '🟢  Live',
  reserved:   '🔒  Reserved',
  admin_hold: '🔴  Admin Hold',
  sold:       '✅  Sold',
}

export const productSchema = defineType({
  name:  'product',
  title: 'Product',
  type:  'document',

  /* ─── Field groups (tabs in the editor) ──────────────────────────────────── */
  groups: [
    {
      name:    'content',
      title:   'Content',
      default: true,
    },
    {
      name:  'media',
      title: 'Media',
    },
    {
      name:  'commerce',
      title: 'Commerce & Status',
    },
    {
      name:  'logistics',
      title: 'Shipping & Customs',
    },
    {
      name:  'system',
      title: 'System',
    },
  ],

  fields: [

    /* ── CONTENT TAB ──────────────────────────────────────────────────────── */

    defineField({
      name:  'title',
      title: 'Title',
      type:  'string',
      group: 'content',
      description: 'Piece name as it appears in the storefront and receipt emails.',
      validation: (R) => R.required().min(2).max(120),
    }),

    defineField({
      name:  'slug',
      title: 'URL Slug',
      type:  'slug',
      group: 'content',
      description: 'Auto-generated from title. Only change if you understand the SEO implications.',
      options: { source: 'title', maxLength: 96 },
      validation: (R) => R.required(),
    }),

    defineField({
      name:  'description',
      title: 'Description',
      type:  'array',
      group: 'content',
      description: 'Rich text. Describe provenance, materials, condition, and notable history.',
      of: [
        {
          type:  'block',
          styles: [
            { title: 'Normal', value: 'normal' },
          ],
          marks: {
            decorators: [
              { title: 'Bold',   value: 'strong' },
              { title: 'Italic', value: 'em'     },
            ],
          },
        },
      ],
    }),

    /* ── MEDIA TAB ────────────────────────────────────────────────────────── */

    defineField({
      name:  'images',
      title: 'Images',
      type:  'array',
      group: 'media',
      description: 'First image is the primary/cover. Add up to 8 images. Square crops work best.',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name:        'alt',
              title:       'Alt Text',
              type:        'string',
              description: 'Screen-reader description. Include material and approximate era.',
              validation:  (R) => R.required().min(5),
            }),
          ],
        },
      ],
      options: {
        layout: 'grid',
      },
      validation: (R) => R.required().min(1).max(8),
    }),

    /* ── COMMERCE TAB ─────────────────────────────────────────────────────── */

    defineField({
      name:  'price',
      title: 'Price (USD)',
      type:  'number',
      group: 'commerce',
      description: 'Whole-dollar amount. Minimum $500. Purchases ≥ $5,000 trigger wire transfer.',
      validation: (R) => R.required().min(500),
    }),

    defineField({
      name:  'dropDate',
      title: 'Drop Date & Time (UTC)',
      type:  'datetime',
      group: 'commerce',
      description: 'Exact moment the countdown ends and the "Add to Cart" button activates. Uses UTC — convert local time accordingly.',
      options: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
        timeStep:   15,
      },
      validation: (R) => R.required(),
    }),

    defineField({
      name:  'status',
      title: 'Status',
      type:  'string',
      group: 'commerce',
      description: 'Controls storefront visibility. "Live" = available to buy. Do not set to "Sold" manually — the webhook does this automatically on payment.',
      options: {
        list: [
          { title: '⏳  Upcoming — countdown active, not purchasable',           value: 'upcoming'    },
          { title: '🟢  Live — available for purchase right now',                 value: 'live'        },
          { title: '🔒  Reserved — wire transfer initiated, 48h hold',           value: 'reserved'    },
          { title: '🔴  Admin Hold — wire expired, awaiting manual review',      value: 'admin_hold'  },
          { title: '✅  Sold — payment confirmed, do not edit',                  value: 'sold'        },
        ],
        layout: 'radio',
      },
      initialValue: 'upcoming',
      validation:   (R) => R.required(),
    }),

    /* ── LOGISTICS TAB ────────────────────────────────────────────────────── */

    defineField({
      name:  'weightGrams',
      title: 'Packaged Weight (grams)',
      type:  'number',
      group: 'logistics',
      description: 'Total packed weight including crating and protective materials. Used for shipping quotes and customs.',
      validation: (R) => R.required().positive(),
    }),

    defineField({
      name:  'dimensions',
      title: 'Packaged Dimensions',
      type:  'object',
      group: 'logistics',
      description: 'Outer dimensions of the packed shipment in centimetres (including crate/box).',
      fields: [
        defineField({
          name:     'lengthCm',
          title:    'Length (cm)',
          type:     'number',
          validation: (R) => R.required().positive(),
        }),
        defineField({
          name:     'widthCm',
          title:    'Width (cm)',
          type:     'number',
          validation: (R) => R.required().positive(),
        }),
        defineField({
          name:     'heightCm',
          title:    'Height (cm)',
          type:     'number',
          validation: (R) => R.required().positive(),
        }),
      ],
      options: { columns: 3 },
    }),

    defineField({
      name:  'hsCode',
      title: 'HS Commodity Code',
      type:  'string',
      group: 'logistics',
      description: 'Harmonized System code for customs. Common values: 9703.00 (sculptures), 9705.00 (antiques > 100 yrs), 9706.00 (antiques > 250 yrs).',
      placeholder: 'e.g. 9703.00',
      validation: (R) =>
        R.required().custom((val: unknown) => {
          if (!val) return true
          return /^\d{4}(\.\d{2})?$/.test(val as string)
            ? true
            : 'Use format XXXX.XX (e.g. 9703.00)'
        }),
    }),

    defineField({
      name:  'countryOfOrigin',
      title: 'Country of Origin',
      type:  'string',
      group: 'logistics',
      description: 'ISO 3166-1 alpha-2 code. e.g. FR (France), IT (Italy), JP (Japan), CN (China), US (United States).',
      placeholder: 'e.g. FR',
      validation: (R) =>
        R.required()
          .length(2)
          .custom((val: unknown) => {
            if (!val) return true
            return /^[A-Z]{2}$/.test(val as string)
              ? true
              : 'Must be 2 uppercase letters (e.g. FR, IT, JP)'
          }),
    }),

    /* ── SYSTEM TAB ───────────────────────────────────────────────────────── */

    defineField({
      name:     'medusaProductId',
      title:    'Medusa Product ID',
      type:     'string',
      group:    'system',
      description: 'Auto-populated when this product is synced to Medusa Commerce. Never edit manually.',
      readOnly: true,
    }),
  ],

  /* ─── List preview (card shown in desk structure lists) ─────────────────── */
  preview: {
    select: {
      title:    'title',
      price:    'price',
      status:   'status',
      media:    'images.0',
      dropDate: 'dropDate',
    },
    prepare({ title, price, status, media, dropDate }) {
      const priceStr = price ? `$${Number(price).toLocaleString('en-US')}` : ''
      const statusLabel = STATUS_LABELS[status as string] ?? status ?? ''
      const dateStr = dropDate
        ? new Date(dropDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
        : ''

      return {
        title,
        subtitle: [priceStr, statusLabel, dateStr].filter(Boolean).join('  ·  '),
        media,
      }
    },
  },
})
