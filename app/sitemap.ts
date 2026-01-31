import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.inkhaven.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl.replace(/\/$/, '')
  const pages = [
    '',
    '/inkwell',
    '/help',
    '/privacy',
    '/register',
    '/terms',
  ]

  const now = new Date().toISOString()

  return pages.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: p === '' ? 1 : 0.7,
  }))
}
