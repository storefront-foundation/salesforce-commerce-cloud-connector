import getClient from './utils/client'

export default async function signUp(data, req, res) {
  const client = getClient(req)
  try {
    const customer = await client.signUp({ ...data, login: data.email })
    return res.json({ customer })
  } catch (e) {
    console.log('Sign Up error', e)
    return res.status(500).json(e)
  }
}
