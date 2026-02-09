export interface Lote {
  id: number
  slug: string
  title: {
    rendered: string
  }
  excerpt?: {
    rendered: string
  }
  content: {
    rendered: string
  }
  featured_media: number
  better_featured_image?: {
    source_url: string
  }
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string
    }>
  }
  acf?: {
    precio?: string
    ubicacion?: string
    estado?: string
    area?: string
    precio_desde?: string
    plan_financiacion?: string
    [key: string]: any
  }
}

export async function getLotes(): Promise<Lote[]> {
  try {
    const res = await fetch('https://goodsco.com.co/wp-json/wp/v2/inmueble?_embed&per_page=100', {
      next: { revalidate: 3600 } // Revalidate every hour
    })
    
    if (!res.ok) {
        // Fallback or empty if API fails
        console.error('Failed to fetch lotes (inmuebles)')
        return []
    }
    
    return res.json()
  } catch (error) {
    console.error('Error fetching lotes:', error)
    return []
  }
}

export async function getLoteBySlug(slug: string): Promise<Lote | null> {
  try {
    const res = await fetch(`https://goodsco.com.co/wp-json/wp/v2/inmueble?slug=${slug}&_embed`, {
       next: { revalidate: 3600 }
    })
    
    if (!res.ok) return null
    
    const lotes = await res.json()
    return lotes.length > 0 ? lotes[0] : null
  } catch (error) {
    console.error('Error fetching lote:', error)
    return null
  }
}
