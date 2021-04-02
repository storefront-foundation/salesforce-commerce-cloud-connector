import getClient from './utils/client'
import normalizeProduct from './utils/normalizeProduct'
import createAppData from './utils/createAppData'

import fulfillAPIRequest from './utils/fulfillAPIRequest'
// import getBase64ForImage from 'react-storefront/utils/getBase64ForImage'

export default async function product({ id }, req) {
  const { color, size } = req.query
  const client = await getClient(req)
  const raw = await client.getProduct(id, { allImages: true })
  const category = await client.getCategory(raw.primaryCategoryId)
  const result = await fulfillAPIRequest(req, {
    appData: createAppData,
    pageData: () => getPageData(normalizeProduct(raw, color, size), category),
  })
  return result
}

async function getPageData(prod, category) {
  const result = {
    title: prod.name,
    product: prod,
    breadcrumbs: [
      {
        text: `Home`,
        href: '/',
      },
      {
        text: category.name,
        as: `/s/${category.id}`,
        href: '/s/[subcategoryId]',
      },
    ],
  }

  // TODO: implement this
  // const mainProductImage = result.product.media.full[0]
  // mainProductImage.src = await getBase64ForImage(mainProductImage.src)

  return result
}
