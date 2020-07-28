import getClient from './utils/client'

export default async function removeCartItem(item, req, res) {
  const client = getClient(req)

  // TODO: Do not pass raw here, find better way of sending itemId
  return await client.removeFromCart(item.raw.itemId)
}
