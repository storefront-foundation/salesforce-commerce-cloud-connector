import getClient from './client'

export default async function createAppData(req) {
  const client = await getClient(req)
  const { categories = [] } = await client.getMenu()

  const tabs = categories.map(cat => {
    const tab = {
      text: cat.name,
      as: `/s/${cat.id}`,
      href: '/s/[...categorySlug]',
    }
    if (cat.categories) {
      tab.items = cat.categories.map(cat => {
        return {
          text: cat.name,
          as: `/s/${cat.id}`,
          href: '/s/[...categorySlug]',
        }
      })
    }
    return tab
  })

  return Promise.resolve({ menu: { items: tabs }, tabs })
}
