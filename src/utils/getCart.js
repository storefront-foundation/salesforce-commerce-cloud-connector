import normalizeProduct from './normalizeProduct'

export default async function getCart(client) {
  const { productItems, productTotal } = await client.getCart()

  let items = []

  if (productItems && productItems.length) {
    const products = await client.getProducts({
      ids: productItems.map(item => item.productId).join(','),
    })
    items = (products.data || []).map((item, index) => {
      // Order matters here. `item` will add needed properties
      // and set the correct variant thumbnail
      return normalizeProduct({ ...productItems[index], ...item })
    })
  }

  return {
    items,
    total: productTotal,
  }
}
