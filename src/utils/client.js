import querystring from 'querystring'
import { COOKIES } from './constants'

const clientId = process.env.CLIENT_ID
const organizationId = process.env.ORGANIZATION_ID
const shortCode = process.env.SHORT_CODE
const siteId = process.env.SITE_ID
const version = 'v1'

const host = `https://${shortCode}.api.commercecloud.salesforce.com`

function createUrl(prePath, postPath, query) {
  return `${host}/${prePath}/${version}/organizations/${organizationId}/${postPath}?${querystring.stringify(
    {
      siteId,
      ...query,
    }
  )}`
}

function decodeUser(req) {
  try {
    const buff = new Buffer(req.cookies[COOKIES.USER], 'base64')
    const text = buff.toString('ascii')
    return JSON.parse(text)
  } catch {
    return {}
  }
}

export function encodeUser(user) {
  const buff = new Buffer(JSON.stringify(user))
  return buff.toString('base64')
}

async function login() {
  const url = createUrl('customer/shopper-customers', 'customers/actions/login', {
    clientId,
  })
  const res = await fetch(url, {
    method: 'post',
    body: JSON.stringify({
      type: 'guest',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const token = res.headers.get('authorization')
  const data = await res.json()
  return {
    token,
    ...data,
  }
}

export default function getClient(req) {
  let user = decodeUser(req)

  async function refreshAuth() {
    user = await login()
  }

  async function fetchWithToken(url, options) {
    if (!user.token) {
      await refreshAuth()
    }

    const opt = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: user.token,
      },
    }

    console.log('Fetching', url)

    let res = await fetch(url, opt)

    console.log('client status', res.statusText)

    if (res.statusText === 'Unauthorized') {
      // Token expired
      console.log('Token expired')
      await refreshAuth()
      return fetchWithToken(url, options)
    } else {
      if (res.statusText === 'OK') {
        return await res.json()
      } else {
        throw new Error(await res.text())
      }
    }
  }

  function api(prePath, postPath, query) {
    const url = createUrl(prePath, postPath, query)
    return fetchWithToken(url)
  }

  function getProduct(id, query = {}) {
    return api('product/shopper-products', `products/${id}`, query)
  }

  function getProducts(query = {}) {
    return api('product/shopper-products', `products`, query)
  }

  function getCategory(id, query = {}) {
    return api('product/shopper-products', `categories/${id}`, query)
  }

  function findProducts(query = {}) {
    return api('search/shopper-search', 'product-search', query)
  }

  // TODO: increase to 3 levels and update menu
  function getMenu(levels = 2) {
    return getCategory('root', { levels })
  }

  function getSuggestions(query = {}) {
    return api('search/shopper-search', 'search-suggestions', query)
  }

  function getCart() {
    return api('checkout/shopper-baskets', `baskets/${user.cartId}`)
  }

  async function getCustomer() {
    console.log('User from cookie', user)

    // TODO: I do not think I need this custom fetch now... Just add the error statuses to the main call

    if (!user.token || !user.customerId) {
      console.log('No token or cust id')
      await refreshAuth()
      return user
    }

    // Fetch customer data
    const url = createUrl('customer/shopper-customers', `customers/${user.customerId}`)
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: user.token,
      },
    })

    console.log('status', res.statusText)

    if (
      res.statusText === 'Unauthorized' ||
      res.statusText === 'Bad Request' ||
      res.statusText === 'Not Found'
    ) {
      // Token expired or invalid customer
      console.log('Error', await res.text())
      await refreshAuth()
      return user
    } else {
      return await res.json()
    }
  }

  function getCarts() {
    return api('customer/shopper-customers', `customers/${user.customerId}/baskets`)
  }

  function createCart() {
    const url = createUrl('checkout/shopper-baskets', 'baskets')
    console.log('Posting to', url)
    return fetchWithToken(url, {
      method: 'post',
      body: JSON.stringify({
        customerInfo: {
          customerId: user.customerId,
          email: 'test@test.com',
        },
      }),
    })
  }

  function addToCart({ productId, quantity }) {
    // TODO: Maybe we should create the cart here??
    const url = createUrl('checkout/shopper-baskets', `baskets/${user.cartId}/items`)
    return fetchWithToken(url, {
      method: 'post',
      body: JSON.stringify([{ productId, quantity }]),
    })
  }

  return {
    getCategory,
    getCart,
    getCarts,
    getCustomer,
    getProduct,
    getProducts,
    getSuggestions,
    getMenu,
    findProducts,
    createCart,
    addToCart,
  }
}
