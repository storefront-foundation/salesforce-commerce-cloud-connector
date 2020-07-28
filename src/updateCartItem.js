import getClient from './utils/client'

export default async function updateCartItem(item, quantity, req, res) {
  const client = getClient(req)

  // TODO: Do not pass raw here, find better way of sending itemId
  return await client.updateCart(item.raw.itemId, quantity)
}
