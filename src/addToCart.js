import isEqual from 'lodash/isEqual'
import getClient from './utils/client'
import getCart from './utils/getCart'

export default async function addToCart({ product, quantity, color, size }, req, res) {
  // Fetch and find product with given {color, size} variation values

  const attr = {}
  if (color) attr.color = color
  if (size) attr.size = size

  const client = getClient(req)
  const raw = await client.getProduct(product.id)

  const variant = raw.variants.find(({ variationValues }) => {
    return isEqual(variationValues, attr)
  })

  if (!variant) {
    throw new Error('Could not find product variant')
  }

  try {
    await client.addToCart({ productId: variant.productId, quantity })
    return { cart: await getCart(client) }
  } catch (e) {
    res.status(500)
    return { e }
  }
}
