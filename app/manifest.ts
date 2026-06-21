import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ligue Départementale de Football d'Obala",
    short_name: 'Ligue Lékié',
    description: "Site officiel de la ligue départementale de football d'Obala, Cameroun.",
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F0E8',
    theme_color: '#1A1A18',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['sports'],
    lang: 'fr',
    shortcuts: [
      {
        name: 'Calendrier',
        short_name: 'Calendrier',
        description: 'Matchs et résultats',
        url: '/calendrier',
      },
      {
        name: 'Classement',
        short_name: 'Classement',
        description: 'Classement de la ligue',
        url: '/classement',
      },
    ],
  }
}
