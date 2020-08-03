import getClient from './client'
import normalizeProduct from './normalizeProduct'

// TODO: make process env var
const limit = 24

export default async function productListing(params, req, searchOptions) {
  const { page = 1, filters = '[]', sort } = params

  const offset = limit * (page - 1)

  const client = await getClient(req)
  const search = await client.findProducts({
    sort,
    offset,
    limit,
    ...searchOptions,
  })

  let products = []

  if (search.hits) {
    products = await client.getProducts({
      ids: search.hits.map(p => p.productId).join(','),
      allImages: true,
    })
  }

  const totalPages = Math.ceil(search.total / limit) + 1

  // collect all page data
  return {
    total: search.total,
    page,
    totalPages,
    // isLanding,
    // cmsBlocks,
    products: (products.data || []).map(normalizeProduct),
    sort,
    sortOptions: search.sortingOptions.map(({ label, id }) => {
      return {
        name: label,
        code: id,
      }
    }),
    filters: JSON.parse(filters),
    facets: (search.refinements || [])
      .filter(e => e.values)
      .map(({ label, attributeId, values }) => {
        return {
          name: label,
          options: values.map(({ hitCount, label, value }) => {
            return {
              name: label,
              code: `${attributeId}=${value}`,
              matches: hitCount,
            }
          }),
        }
      }),
  }
}
