import type { StructureBuilder, StructureResolverContext } from 'sanity/structure'

const STATUS_VIEWS = [
  { title: '🟢  Live',           filter: 'status == "live"'                           },
  { title: '⏳  Upcoming',       filter: 'status == "upcoming"'                       },
  { title: '🔒  Reserved / Hold', filter: 'status in ["reserved", "admin_hold"]'       },
  { title: '✅  Sold',           filter: 'status == "sold"'                           },
] as const

export function structure(S: StructureBuilder, _ctx: StructureResolverContext) {
  return S.list()
    .title('Galeriaxolo')
    .items([

      /* ── Products ─────────────────────────────────────────────── */
      S.listItem()
        .title('Products')
        .schemaType('product')
        .child(
          S.list()
            .title('Products')
            .items([

              /* All Products — default ordered by dropDate desc */
              S.listItem()
                .title('All Products')
                .child(
                  S.documentList()
                    .title('All Products')
                    .filter('_type == "product"')
                    .defaultOrdering([{ field: 'dropDate', direction: 'desc' }])
                    .child((id) =>
                      S.document()
                        .documentId(id)
                        .schemaType('product')
                        .views([
                          S.view.form().title('Edit'),
                          S.view
                            .component(StorefrontPreview)
                            .title('Storefront Preview'),
                        ]),
                    ),
                ),

              S.divider(),

              /* Status-filtered sub-lists */
              ...STATUS_VIEWS.map(({ title, filter }) =>
                S.listItem()
                  .title(title)
                  .child(
                    S.documentList()
                      .title(title)
                      .filter(`_type == "product" && ${filter}`)
                      .defaultOrdering([{ field: 'dropDate', direction: 'desc' }]),
                  ),
              ),
            ]),
        ),

      S.divider(),

      /* ── Site Settings — singleton ───────────────────────────── */
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Site Settings'),
        ),
    ])
}

/* ─── Storefront preview iframe pane ─────────────────────────────────────── */
import React from 'react'

function StorefrontPreview({ document: doc }: { document: { displayed: { slug?: { current?: string } } } }) {
  const slug = doc?.displayed?.slug?.current
  if (!slug) {
    return React.createElement(
      'div',
      {
        style: {
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          height:         '100%',
          color:          '#767676',
          fontSize:       '13px',
        },
      },
      'Save the document first to see a preview.',
    )
  }

  const baseUrl = process.env.SANITY_STUDIO_STOREFRONT_URL ?? 'http://localhost:3000'
  const url     = `${baseUrl}/products/${slug}`

  return React.createElement(
    'div',
    { style: { height: '100%', display: 'flex', flexDirection: 'column' } },
    React.createElement(
      'div',
      {
        style: {
          padding:      '8px 12px',
          background:   '#141414',
          borderBottom: '1px solid #2C2C2C',
          fontSize:     '11px',
          color:        '#767676',
          fontFamily:   'monospace',
        },
      },
      url,
    ),
    React.createElement('iframe', {
      src:    url,
      style:  { flex: 1, border: 'none', background: '#0D0D0D' },
      title:  'Storefront preview',
    }),
  )
}
