import getClient from './client'

export default async function createAppData(req) {
  const client = await getClient(req)
  const { categories = [] } = await client.getMenu()

  const menu = {
    items: categories.map(cat => {
      if (cat.categories) {
        return {
          text: cat.name,
          items: cat.categories.map(cat => {
            return {
              text: cat.name,
              as: `/s/${cat.id}`,
              href: '/s/[...categorySlug]',
            }
          }),
        }
      } else {
        return {
          text: cat.name,
          as: `/s/${cat.id}`,
          href: '/s/[...categorySlug]',
        }
      }
    }),
  }

  const tabs = categories.map(cat => {
    return {
      text: cat.name,
      as: `/s/${cat.id}`,
      href: '/s/[...categorySlug]',
      subcategories: cat.categories
        ? cat.categories.map(cat => {
            return {
              text: cat.name,
              as: `/s/${cat.id}`,
              href: '/s/[...categorySlug]',
            }
          })
        : [],
    }
  })

  return Promise.resolve({ menu, tabs })
}
