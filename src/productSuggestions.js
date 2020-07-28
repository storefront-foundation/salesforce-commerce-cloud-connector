import getClient from './utils/client'
import normalizeProduct from './utils/normalizeProduct'

export default async function productSuggestions(id, req, res) {
  const client = await getClient(req, res)
  const data = await client.getProduct(id)

  // TODO: Deal with bad product ids here
  return await Promise.all(
    (data.recommendations || []).map(e => e.recommendedItemId).map(client.getProduct)
  ).then(results => results.map(normalizeProduct))
}
