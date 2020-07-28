import getClient, { encodeUser } from './utils/client'
import { COOKIES } from './utils/constants'
import getCart from './utils/getCart'

export default async function session(req, res) {
  const client = await getClient(req)

  await client.session()

  const cart = await getCart(client)

  res.setHeader('Set-Cookie', `${COOKIES.USER}=${encodeUser(client.user)}; Path=/`)

  return { cart, signedIn: client.user.authType === 'registered' }
}
