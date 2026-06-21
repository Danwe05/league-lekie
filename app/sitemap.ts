import type { MetadataRoute } from 'next'
import { getClubs, getActualites } from '@/lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://liguelekie.cm'

  const [clubs, actualites] = await Promise.all([getClubs(), getActualites()])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/calendrier`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/classement`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/classement/buteurs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/clubs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/actualites`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/a-propos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ]

  const clubRoutes: MetadataRoute.Sitemap = clubs.map(club => ({
    url: `${BASE}/clubs/${club.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const actualiteRoutes: MetadataRoute.Sitemap = actualites.map(a => ({
    url: `${BASE}/actualites/${a.id}`,
    lastModified: new Date(a.date),
    changeFrequency: 'never',
    priority: 0.6,
  }))

  return [...staticRoutes, ...clubRoutes, ...actualiteRoutes]
}
