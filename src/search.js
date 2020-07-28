import fulfillAPIRequest from 'react-storefront/props/fulfillAPIRequest'
import createAppData from './utils/createAppData'
import productListing from './utils/productListing'

export default async function search(params, req) {
  return await fulfillAPIRequest(req, {
    appData: createAppData,
    pageData: () => getPageData(params, req),
  })
}

async function getPageData(params, req) {
  const { q, filters = '[]' } = params

  const plp = await productListing(params, req, {
    q,
    refine: [...JSON.parse(filters)],
  })

  return {
    name: 'Search',
    title: 'Search',
    breadcrumbs: [
      {
        text: 'Home',
        href: '/',
      },
    ],
    ...plp,
  }
}
