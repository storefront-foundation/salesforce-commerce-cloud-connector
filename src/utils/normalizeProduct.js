export default function normalizeProduct(data, color, size) {
  // Filter for images supporting type and variations
  function getImages(viewType, variation, value) {
    const images = {}
    const groups = data.imageGroups || []
    groups
      .filter(group => {
        if (group.viewType !== viewType) return false
        if (variation) {
          return (
            group.variationAttributes &&
            group.variationAttributes[0].id === variation &&
            group.variationAttributes[0].values[0].value === value
          )
        }
        return true
      })
      .reduce((memo, e) => [...memo, ...e.images], [])
      .forEach(({ link, alt }) => {
        images[link] = alt
      })
    return Object.keys(images).map(src => ({ src, alt: images[src] }))
  }

  function getVariations(type) {
    if (!data.variationAttributes) {
      return []
    }
    const variations = data.variationAttributes.find(attr => attr.id === type)
    if (!variations) return []
    return variations.values.map(({ name, value }) => {
      const id = value
      return {
        id,
        text: name,
        image: getImages('swatch', type, id)[0],
      }
    })
  }

  const colors = getVariations('color')
  const sizes = getVariations('size')

  colors.forEach(c => {
    const thumbnails = getImages('medium', 'color', c.id)
    c.media = {
      full: getImages('large', 'color', c.id),
      thumbnails,
      thumbnail: thumbnails.length ? thumbnails[0] : undefined,
    }
  })

  const media = {
    full: getImages('large'),
    thumbnails: getImages('medium'),
  }

  if (data.image) {
    const img = {
      src: data.image.link,
      alt: data.image.alt,
      type: 'image',
      // magnify?
    }
    media.full.push(img)
    media.thumbnails.push(img)
  }

  const id = data.id || data.productId

  const specs = Object.keys(data)
    .filter(key => key.indexOf('c_') === 0)
    .map(key => {
      return `${key.substring(2)}: ${data[key]}`
    })
    .join('\n')

  return {
    id,
    url: `/p/${id}`,
    name: data.name || data.productName,
    price: data.price,
    priceText: `$${data.price}.00`, // n/a
    // rating: n/a
    description: data.longDescription,
    media,
    thumbnail: media.thumbnails[0] || {},
    colors,
    sizes,
    specs,
    quantity: data.quantity || 1,
    // TODO: Remove later
    raw: data,
  }
}
