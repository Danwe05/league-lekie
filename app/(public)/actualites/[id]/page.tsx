import { getActualiteById, getActualites } from '@/lib/api'
import { notFound } from 'next/navigation'
import { CalendarDays } from 'lucide-react'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ShareButton } from '@/components/ShareButton'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const actualites = await getActualites()
  return actualites.map(a => ({ id: a.id }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const article = await getActualiteById(id)
  if (!article) return { title: 'Article introuvable' }
  return {
    title: article.title,
    description: article.content.substring(0, 160),
    openGraph: {
      title: article.title,
      description: article.content.substring(0, 160),
      type: 'article',
      publishedTime: article.date,
      ...(article.imageUrl ? { images: [{ url: article.imageUrl }] } : {}),
    },
  }
}

export default async function ActualiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = await getActualiteById(id)
  if (!article) notFound()

  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  }).format(new Date(article.date))

  return (
    <div className="container mx-auto px-4 py-12 flex-1 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Actualités', href: '/actualites' }, { label: article.title }]} />
        <ShareButton title={article.title} text={article.content.substring(0, 100) + '...'} />
      </div>

      <article className="mt-4">
        {article.imageUrl && (
          <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden mb-8 border border-border">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex items-center gap-2 text-primary font-bold text-sm mb-3">
          <CalendarDays className="w-4 h-4" />
          <time dateTime={article.date}>{formattedDate}</time>
        </div>

        <h1 className="font-heading font-bold text-3xl md:text-4xl uppercase tracking-tight text-foreground mb-8 leading-tight">
          {article.title}
        </h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap text-base">
            {article.content}
          </p>
        </div>
      </article>
    </div>
  )
}
