import getClient, { encodeUser } from './utils/client'
import { COOKIES } from './utils/constants'

export default async function signIn(email, password, req, res) {
  const client = getClient(req)
  try {
    await client.signIn(email, password)
    res.setHeader('Set-Cookie', `${COOKIES.USER}=${encodeUser(client.user)}; Path=/`)
    return res.json({ signedIn: true })
  } catch (e) {
    console.log('Sign In error', e)
    return res.status(500).json(e)
  }
}
