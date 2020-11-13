import getClient from './utils/client'

// Fetches the page and API paths for all categories and a few product from each specified by the given options
export default async function getPrerenderUrls(options = { offset: 0, limit: 10 }) {
  const client = await getClient()

  const { categories = [] } = await client.getMenu()

  const paths = []

  // Prerender all category pages
  for (let category of categories) {
    paths.push({ path: `/s/${category.id}` })
    paths.push({ path: `/api/s/${category.id}` })

    // Try prerendering the first 10 products of each category
    const search = await client.findProducts({
      ...options,
      refine: [`cgid=${category.id}`],
    })

    if (search.hits) {
      for (let hit of search.hits) {
        paths.push({ path: `/p/${hit.productId}` })
        paths.push({ path: `/api/p/${hit.productId}` })
      }
    }
  }

  return paths
}
