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
  console.log('Received new token', token)
  const data = await res.json()
  return {
    token,
    ...data,
  }
}

// res.setHeader('Set-Cookie', `${COOKIES.TOKEN}=${token}; Path=/`)
// res.setHeader('Set-Cookie', [
//   `${COOKIES.TOKEN}=${token}; Path=/`,
//   `${COOKIES.CUSTOMER_ID}=${customerId}; Path=/`,
// ])

export default async function getClient(req) {
  async function refreshToken() {
    const { token } = await login()
    return token
  }

  async function fetchWithToken(url, options) {
    let token = req.cookies[COOKIES.TOKEN]
    if (!token) {
      console.log('\n\nno token')
      token = await refreshToken()
    } else {
      console.log('\n\n got token from cookie')
    }

    const opt = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    }

    let res = await fetch(url, opt)

    if (res.statusText === 'Unauthorized') {
      // Token expired
      console.log('\n\ntoken expired', await res.text())
      token = await refreshToken()
      // Retry
      // TODO: Maybe just use `api` again...
      res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      })
      return await res.json()
    } else {
      const data = await res.json()
      return data
    }
  }

  function api(prePath, postPath, query) {
    const url = createUrl(prePath, postPath, query)
    console.log('Fetching', url)
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

  function getCart(cartId) {
    return api('checkout/shopper-baskets', `baskets/${cartId}`)
  }

  function createCart() {
    const customerId = req.cookies[COOKIES.CUSTOMER_ID]
    const url = createUrl('checkout/shopper-baskets', 'baskets')
    console.log('Posting to', url)
    return fetchWithToken(url, {
      method: 'post',
      body: JSON.stringify({
        customerInfo: {
          customerId,
          email: 'test@test.com',
        },
      }),
    })
  }

  function addToCart(cartId, body) {
    const url = createUrl('checkout/shopper-baskets', `baskets/${cartId}/items`)
    console.log('Posting', body, 'to', url)
    return fetchWithToken(url, {
      method: 'post',
      body: JSON.stringify(body),
    })
  }

  return {
    getProduct,
    getProducts,
    getCategory,
    getCart,
    getSuggestions,
    getMenu,
    findProducts,
    createCart,
    addToCart,
  }
}
