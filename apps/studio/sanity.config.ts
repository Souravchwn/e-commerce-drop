import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'gallery-drop',
  title: 'Gallery Drop — CMS',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset:   process.env.SANITY_STUDIO_DATASET ?? 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Products')
              .child(
                S.documentList()
                  .title('All Products')
                  .filter('_type == "product"')
                  .defaultOrdering([{ field: 'dropDate', direction: 'desc' }])
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: { types: schemaTypes },
})
