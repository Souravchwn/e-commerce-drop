# Sanity CMS

Schema file: `apps/studio/schemaTypes/product.ts`
Document type: `product`

---

## Product Schema

| Field | Type | Validation | Notes |
|-------|------|-----------|-------|
| `title` | string | Required, 2–120 chars | |
| `slug` | slug | Required | Auto-generated from title |
| `price` | number | Required, min $500, whole USD | |
| `description` | block[] | — | Portable Text |
| `images` | image[] | Min 1 | Each has `alt` field |
| `dropDate` | datetime | Required | UTC — drives countdown timer |
| `medusaProductId` | string | — | Auto-set by webhook sync, read-only in Studio |
| `weightGrams` | number | Required | For customs |
| `dimensions` | object | All fields required | `lengthCm`, `widthCm`, `heightCm` |
| `hsCode` | string | Required | e.g. `9703.00` for sculptures |
| `countryOfOrigin` | string | Required | ISO 3166-1 alpha-2 (e.g. `FR`) |
| `status` | string | — | `upcoming` \| `live` \| `reserved` \| `admin_hold` \| `sold` |

---

## Lib Functions (`lib/sanity.ts`)

| Export | Purpose |
|--------|---------|
| `sanityClient` | Configured Sanity client (`SANITY_API_TOKEN` server-side only) |
| `urlFor(source)` | Image URL builder |
| `ALL_PRODUCTS_QUERY` | GROQ — fetches all products for homepage grid |
| `PRODUCT_BY_SLUG_QUERY` | GROQ — single product by slug |
| `ALL_PRODUCT_SLUGS_QUERY` | GROQ — all slugs for static generation |
| `patchMedusaProductId(sanityId, medusaId)` | Mutations API — writes `medusaProductId` back after creation |
| `updateProductStatus(sanityId, status)` | Mutations API — updates `status` field |

---

## Webhook: Sanity → Storefront

Fires on publish, calls `POST /api/webhooks/sanity`.

### Endpoint Logic
1. Verify `x-sanity-webhook-secret` header matches `SANITY_WEBHOOK_SECRET`
2. If `medusaProductId` exists → update Medusa product title
3. If not → create Medusa product (1 variant, qty: 1) → write `medusaProductId` back to Sanity
4. `revalidateTag('products')`

### Sanity Dashboard Setup
| Setting | Value |
|---------|-------|
| URL | `https://yourdomain.com/api/webhooks/sanity` |
| Trigger on | Create, Update |
| Filter | `_type == "product"` |
| HTTP method | POST |
| Secret | Value of `SANITY_WEBHOOK_SECRET` env var |
| Header name | `x-sanity-webhook-secret` |
