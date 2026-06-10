import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'
import { structure } from './structure'
import { studioTheme } from './theme'

export default defineConfig({
  name:  'galeriaxolo',
  title: 'Galeriaxolo CMS',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset:   process.env.SANITY_STUDIO_DATASET ?? 'production',

  /* ─── Dark luxury theme ────────────────────────────────────────────────── */
  theme: studioTheme,

  /* ─── Plugins ──────────────────────────────────────────────────────────── */
  plugins: [
    structureTool({ structure }),

    /* GROQ explorer — dev only */
    ...(process.env.NODE_ENV !== 'production' ? [visionTool()] : []),
  ],

  /* ─── Schema ───────────────────────────────────────────────────────────── */
  schema: {
    types: schemaTypes,
    /*
     * Prevent the "New document" menu from offering siteSettings as an option
     * (it's a singleton — we manage it through the desk structure).
     */
    templates: (templates) =>
      templates.filter(({ schemaType }) => schemaType !== 'siteSettings'),
  },

  /* ─── Document behaviour ───────────────────────────────────────────────── */
  document: {
    /* Show a colored badge next to the document title based on product status */
    badges: (prev, { schemaType }) => {
      if (schemaType !== 'product') return prev
      return [StatusBadge, ...prev]
    },

    /* Default new product to upcoming status */
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === 'global') return prev
      return prev
    },
  },
})

/* ─── Status badge component ────────────────────────────────────────────── */
import type { DocumentBadgeComponent, DocumentBadgeDescription } from 'sanity'

const STATUS_COLORS: Record<string, { label: string; color: string }> = {
  upcoming:   { label: 'Upcoming',   color: '#f59e0b' },
  live:       { label: 'Live',       color: '#22c55e' },
  reserved:   { label: 'Reserved',   color: '#60a5fa' },
  admin_hold: { label: 'Admin Hold', color: '#E8112D' },
  sold:       { label: 'Sold',       color: '#767676' },
}

const StatusBadge: DocumentBadgeComponent = ({ published, draft }) => {
  const status = (draft?.status ?? published?.status) as string | undefined
  if (!status) return null
  const cfg = STATUS_COLORS[status]
  if (!cfg) return null

  return {
    label: cfg.label,
    color: cfg.color,
    title: `Status: ${cfg.label}`,
  } as DocumentBadgeDescription
}
