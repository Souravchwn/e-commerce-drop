import { defineField, defineType } from 'sanity'

export const productSchema = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (R) => R.required().min(2).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price (USD)',
      type: 'number',
      description: 'Whole dollar amount. Minimum $500.',
      validation: (R) => R.required().min(500),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              validation: (R) => R.required(),
            }),
          ],
        },
      ],
      validation: (R) => R.required().min(1),
    }),
    defineField({
      name: 'dropDate',
      title: 'Drop Date & Time',
      type: 'datetime',
      description: 'The exact moment this item goes live. Uses UTC.',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'medusaProductId',
      title: 'Medusa Product ID',
      type: 'string',
      description: 'Auto-populated when synced to Medusa. Do not edit manually.',
      readOnly: true,
    }),
    // ── Shipping Metadata (mandatory for international customs) ────────────────
    defineField({
      name: 'weightGrams',
      title: 'Weight (grams)',
      type: 'number',
      description: 'Total packaged weight including all protective materials.',
      validation: (R) => R.required().positive(),
    }),
    defineField({
      name: 'dimensions',
      title: 'Packaged Dimensions',
      type: 'object',
      fields: [
        defineField({ name: 'lengthCm', title: 'Length (cm)', type: 'number', validation: (R) => R.required().positive() }),
        defineField({ name: 'widthCm',  title: 'Width (cm)',  type: 'number', validation: (R) => R.required().positive() }),
        defineField({ name: 'heightCm', title: 'Height (cm)', type: 'number', validation: (R) => R.required().positive() }),
      ],
    }),
    defineField({
      name: 'hsCode',
      title: 'HS Code',
      type: 'string',
      description: 'Harmonized System commodity code for customs (e.g. 9703.00 for sculptures).',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'countryOfOrigin',
      title: 'Country of Origin',
      type: 'string',
      description: 'ISO 3166-1 alpha-2 country code (e.g. "FR", "IT", "JP").',
      validation: (R) => R.required().uppercase().length(2),
    }),
    // ── Availability State ─────────────────────────────────────────────────────
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Upcoming (countdown active)',       value: 'upcoming'    },
          { title: 'Live (available to buy)',           value: 'live'        },
          { title: 'Reserved (wire pending, 48h hold)', value: 'reserved'    },
          { title: 'Admin Hold (expired — awaiting manual review)', value: 'admin_hold' },
          { title: 'Sold',                              value: 'sold'        },
        ],
        layout: 'radio',
      },
      initialValue: 'upcoming',
    }),
  ],
  preview: {
    select: {
      title:    'title',
      subtitle: 'status',
      media:    'images.0',
    },
    prepare({ title, subtitle, media }) {
      const labels: Record<string, string> = {
        upcoming:   '⏳ Upcoming',
        live:       '🟢 Live',
        reserved:   '🔒 Reserved',
        admin_hold: '🔴 Admin Hold',
        sold:       '✅ Sold',
      }
      return {
        title,
        subtitle: labels[subtitle as string] ?? subtitle,
        media,
      }
    },
  },
})
