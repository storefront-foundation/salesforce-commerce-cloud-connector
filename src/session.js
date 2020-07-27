import getClient, { encodeUser } from './utils/client'
import { COOKIES } from './utils/constants'

export default async function session(req, res) {
  const client = await getClient(req)
  const customer = await client.getCustomer()

  const carts = await client.getCarts()

  console.log('received carts', carts)

  let cart
  if (carts.total === 0) {
    cart = await client.createCart()
  }

  customer.cartId = cart.basketId

  if (customer.token) {
    // Has token data, must be refresh, save it
    console.log('setting user cookie')
    res.setHeader('Set-Cookie', `${COOKIES.USER}=${encodeUser(customer)}; Path=/`)
  }

  return customer
}
