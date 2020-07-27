import getClient, { encodeUser } from './utils/client'
import { COOKIES } from './utils/constants'
import normalizeProduct from './utils/normalizeProduct'

export default async function session(req, res) {
  const client = await getClient(req)

  await client.session()

  const { productItems, productTotal } = await client.getCart()

  const products = await client.getProducts({
    ids: productItems.map(item => item.productId).join(','),
  })
  const items = (products.data || []).map((item, index) => {
    return normalizeProduct({ ...productItems[index], ...item })
  })

  res.setHeader('Set-Cookie', `${COOKIES.USER}=${encodeUser(client.user)}; Path=/`)

  return {
    cart: {
      items,
      total: productTotal,
    },
  }
}
