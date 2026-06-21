'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── AUTHENTICATION ───────────────────────────────────────────────

export async function login(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/admin')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ─── CLUBS ────────────────────────────────────────────────────────

export async function createClub(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('clubs').insert({
    name: formData.get('name') as string,
    stadium: formData.get('stadium') as string,
    logo: formData.get('logo') as string || null,
    officials: [],
  })
  if (error) return { error: error.message }
  revalidatePath('/admin/clubs')
  revalidatePath('/clubs')
}

export async function updateClub(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('clubs').update({
    name: formData.get('name') as string,
    stadium: formData.get('stadium') as string,
    logo: formData.get('logo') as string || null,
  }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/clubs')
  revalidatePath('/clubs')
}

export async function deleteClub(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('clubs').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/clubs')
  revalidatePath('/clubs')
}

// ─── MATCHES ──────────────────────────────────────────────────────

export async function createMatch(formData: FormData) {
  const supabase = await createClient()
  const homeScore = formData.get('home_score') ? Number(formData.get('home_score')) : null
  const awayScore = formData.get('away_score') ? Number(formData.get('away_score')) : null
  const status = homeScore !== null && awayScore !== null ? 'FINISHED' : 'UPCOMING'
  const { error } = await supabase.from('matches').insert({
    home_team_id: formData.get('home_team_id') as string,
    away_team_id: formData.get('away_team_id') as string,
    date: formData.get('date') as string,
    matchday: Number(formData.get('matchday')),
    home_score: homeScore,
    away_score: awayScore,
    status,
    season: (formData.get('season') as string) || '2024-2025',
  })
  if (error) return { error: error.message }
  revalidatePath('/admin/matchs')
  revalidatePath('/calendrier')
  revalidatePath('/classement')
  revalidatePath('/')
}

export async function updateMatch(id: string, formData: FormData) {
  const supabase = await createClient()
  const homeScore = formData.get('home_score') !== '' ? Number(formData.get('home_score')) : null
  const awayScore = formData.get('away_score') !== '' ? Number(formData.get('away_score')) : null
  const { error } = await supabase.from('matches').update({
    home_team_id: formData.get('home_team_id') as string,
    away_team_id: formData.get('away_team_id') as string,
    date: formData.get('date') as string,
    matchday: Number(formData.get('matchday')),
    home_score: homeScore,
    away_score: awayScore,
    status: formData.get('status') as string,
    season: (formData.get('season') as string) || '2024-2025',
  }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/matchs')
  revalidatePath('/calendrier')
  revalidatePath('/classement')
  revalidatePath('/')
}

export async function deleteMatch(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('matches').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/matchs')
  revalidatePath('/calendrier')
  revalidatePath('/classement')
  revalidatePath('/')
}

// ─── LIVE MODE ────────────────────────────────────────────────────

export async function setMatchLive(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('matches').update({ status: 'LIVE' }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/matchs')
  revalidatePath('/')
  revalidatePath('/calendrier')
}

export async function setMatchFinished(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('matches').update({ status: 'FINISHED' }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/matchs')
  revalidatePath('/')
  revalidatePath('/calendrier')
}

export async function setMatchUpcoming(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('matches').update({ status: 'UPCOMING' }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/matchs')
  revalidatePath('/')
  revalidatePath('/calendrier')
}

// ─── ACTUALITES ───────────────────────────────────────────────────

async function sendNewsNotification(title: string, content: string) {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_xxx')) return
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const to = process.env.CONTACT_EMAIL ?? 'contact@liguelekie.cm'
    await resend.emails.send({
      from: 'Ligue d\'Obala <noreply@liguelekie.cm>',
      to,
      subject: `[Nouvelle actualité] ${title}`,
      html: `<div style="font-family:sans-serif;max-width:600px">
        <h2 style="color:#C75D2C">Nouvelle publication — Ligue d'Obala</h2>
        <h3>${title}</h3>
        <p style="white-space:pre-line;color:#555">${content.slice(0, 400)}…</p>
        <a href="https://liguelekie.cm/actualites" style="color:#C75D2C;font-weight:bold">Voir sur le site →</a>
      </div>`,
    })
  } catch { /* fire-and-forget */ }
}

export async function createActualite(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const { error } = await supabase.from('actualites').insert({
    title,
    content,
    date: new Date().toISOString(),
    image_url: formData.get('image_url') as string || null,
  })
  if (error) return { error: error.message }
  // Fire-and-forget email notification
  void sendNewsNotification(title, content)
  revalidatePath('/admin/actualites')
  revalidatePath('/actualites')
  revalidatePath('/')
}

export async function updateActualite(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('actualites').update({
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    image_url: formData.get('image_url') as string || null,
  }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/actualites')
  revalidatePath('/actualites')
  revalidatePath('/')
}

export async function deleteActualite(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('actualites').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/actualites')
  revalidatePath('/actualites')
  revalidatePath('/')
}

// ─── PLAYERS ──────────────────────────────────────────────────────

export async function createPlayer(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('players').insert({
    club_id: formData.get('club_id') as string,
    name: formData.get('name') as string,
    position: formData.get('position') as string,
    number: Number(formData.get('number')),
    photo_url: formData.get('photo_url') as string || null,
    season: (formData.get('season') as string) || '2024-2025',
  })
  if (error) return { error: error.message }
  revalidatePath('/admin/joueurs')
  revalidatePath('/clubs')
}

export async function updatePlayer(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('players').update({
    club_id: formData.get('club_id') as string,
    name: formData.get('name') as string,
    position: formData.get('position') as string,
    number: Number(formData.get('number')),
    photo_url: formData.get('photo_url') as string || null,
    season: (formData.get('season') as string) || '2024-2025',
  }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/joueurs')
  revalidatePath('/clubs')
}

export async function deletePlayer(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('players').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/joueurs')
  revalidatePath('/clubs')
}

// ─── GOALS ────────────────────────────────────────────────────────

export async function createGoal(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('goals').insert({
    match_id: formData.get('match_id') as string,
    player_id: formData.get('player_id') as string,
    club_id: formData.get('club_id') as string,
    minute: formData.get('minute') ? Number(formData.get('minute')) : null,
    season: (formData.get('season') as string) || '2024-2025',
  })
  if (error) return { error: error.message }
  revalidatePath('/admin/matchs')
  revalidatePath('/classement')
  revalidatePath('/')
}

export async function deleteGoal(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('goals').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/matchs')
  revalidatePath('/classement')
  revalidatePath('/')
}
