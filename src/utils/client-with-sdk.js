const { helpers, Search, Product, sdkLogger } = require('commerce-sdk')

// import { COOKIES } from './constants'

sdkLogger.setLevel(sdkLogger.levels.DEBUG)

const COOKIES = {
  SHOPPER_TOKEN: 'sfcc_jwt',
}

const clientId = process.env.CLIENT_ID
const organizationId = process.env.ORGANIZATION_ID
const shortCode = process.env.SHORT_CODE
const siteId = process.env.SITE_ID

// const version = 'v1'

// const host = `https://${shortCode}.api.commercecloud.salesforce.com`

async function getToken(req) {
  return
}

// Use given token or fetch new one if undefined
async function getConfig(jwt, type = 'guest') {
  const config = {
    headers: {},
    parameters: {
      clientId,
      organizationId,
      shortCode,
      siteId,
    },
  }
  if (jwt) {
    config.headers['authorization'] = jwt
  } else {
    const token = await helpers.getShopperToken(config, { type })
    console.log('created new token')
    config.headers['authorization'] = token.getBearerHeader()
  }
  return config
}

// TODO: Generalize if it works
export async function getType(req, Type, method, ...args) {
  const tokenInCookie = req.cookies[COOKIES.SHOPPER_TOKEN]
  try {
    const client = new Type(await getConfig(tokenInCookie))
    const result = await client[method](...args)
    console.log('result 1', result)
    return result
  } catch {
    const client = new Type(await getConfig())
    const result = await client[method](...args)
    console.log('result 2', result)
    return result
  }
}

export async function getProduct(req, ...args) {
  return getType(req, Product.ShopperProducts, 'getProduct', ...args)
}

export async function getCategory(req, ...args) {
  return getType(req, Product.ShopperProducts, 'getCategory', ...args)
}

export async function getMenu(req, levels = 2) {
  return getCategory(req, { parameters: { id: 'root', levels } })
}
