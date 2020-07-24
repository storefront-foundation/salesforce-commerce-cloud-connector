export default async function session(req, res) {
  const products = []

  return {
    name: 'Mark',
    email: 'mark@domain.com',
    cart: {
      items: products.map((item, i) => ({
        ...item,
        quantity: 1,
      })),
    },
    currency: 'USD',
  }
}
