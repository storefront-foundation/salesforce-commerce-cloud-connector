import fulfillAPIRequest from './utils/fulfillAPIRequest'
import getClient from './utils/client'
import createAppData from './utils/createAppData'
import productListing from './utils/productListing'

export default async function subcategory(params, req) {
  return await fulfillAPIRequest(req, {
    appData: createAppData,
    pageData: () => getPageData(params, req),
  })
}

async function getPageData(params, req) {
  const { filters = '[]' } = params
  const { categorySlug } = req.query

  const client = await getClient(req)
  const data = await client.getCategory(categorySlug)

  const plp = await productListing(params, req, {
    refine: [`cgid=${categorySlug}`, ...JSON.parse(filters)],
  })

  // collect all page data
  return {
    id: data.id,
    name: data.name,
    title: data.pageTitle,
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
    ...plp,
  }
}
