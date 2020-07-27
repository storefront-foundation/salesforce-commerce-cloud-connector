import fulfillAPIRequest from 'react-storefront/props/fulfillAPIRequest'
import getClient from './utils/client'
import createAppData from './utils/createAppData'
import normalizeProduct from './utils/normalizeProduct'

// TODO: make process env var
const limit = 25

export default async function subcategory(params, req) {
  return await fulfillAPIRequest(req, {
    appData: createAppData,
    pageData: () => getPageData(params, req),
  })
}

async function getPageData(params, req) {
  const { page = 1, filters = '[]', sort } = params
  const { categorySlug } = req.query

  const offset = limit * (page - 1)

  const client = await getClient(req)
  const data = await client.getCategory(categorySlug)
  const search = await client.findProducts({
    sort,
    offset,
    limit,
    refine: [`cgid=${categorySlug}`, ...JSON.parse(filters)],
  })
  // TODO: Can use the getProducts API call to get allImages

  const totalPages = Math.ceil(search.total / limit) + 1

  // collect all page data
  return {
    id: data.id,
    name: data.name,
    title: data.pageTitle,
    total: search.total,
    page,
    totalPages,
    // isLanding,
    // cmsBlocks,
    products: (search.hits || []).map(normalizeProduct),
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
    // navMenu,
    breadcrumbs: [
      {
        text: 'Home',
        href: '/',
      },
      {
        text: data.parentCategoryId,
        href: `/s/${data.parentCategoryId}`,
      },
    ],
  }
}
