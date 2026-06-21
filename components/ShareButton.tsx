'use client'

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"

interface ShareButtonProps {
  title: string
  text?: string
  url?: string
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url: url || window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(url || window.location.href)
        alert('Lien copié dans le presse-papier !')
      }
    } catch (error) {
      console.error('Error sharing', error)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-2 text-xs font-bold font-heading uppercase"
      onClick={handleShare}
    >
      <Share2 className="w-3.5 h-3.5" /> 
      <span className="hidden sm:inline">Partager</span>
    </Button>
  )
}
