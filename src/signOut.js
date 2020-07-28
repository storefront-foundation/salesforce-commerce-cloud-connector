import { COOKIES } from './utils/constants'

export default function signOut(req, res) {
  res.setHeader('Set-Cookie', `${COOKIES.USER}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`)
  return res.json({ signedIn: false })
}
