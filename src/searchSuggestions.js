import get from 'lodash/get'
import getClient from './utils/client'
import normalizeProduct from './utils/normalizeProduct'

export default async function searchSuggestions(q, req, res) {
  const client = await getClient(req)

  const results = await client.getSuggestions({ q })

  const categories = get(results, ['categorySuggestions', 'categories'], [])
  const productSuggestions = get(results, ['productSuggestions', 'products'], [])

  const products = await client.getProducts({
    ids: productSuggestions.map(s => s.productId).join(','),
  })

  return {
    text: results.searchPhrase,
    groups: [
      {
        caption: 'Suggested Categories',
        ui: 'list',
        links: categories.map(({ id, name }) => {
          return { text: name, href: '/s/[subcategoryId]', as: `/s/${id}` }
        }),
      },
      {
        caption: 'Suggested Products',
        ui: 'thumbnails',
        links: (products.data || []).map(normalizeProduct).map(({ name, url, thumbnail }) => {
          return { text: name, href: '/p/[productId]', as: url, thumbnail }
        }),
      },
    ],
  }
}
