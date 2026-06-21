'use server'

import { Resend } from 'resend'
import { revalidatePath } from 'next/cache'

export async function sendContactEmail(formData: FormData) {
  const firstname = formData.get('firstname') as string
  const lastname = formData.get('lastname') as string
  const email = formData.get('email') as string
  const subject = formData.get('subject') as string
  const message = formData.get('message') as string

  if (!firstname || !email || !subject || !message) {
    return { error: 'Veuillez remplir tous les champs obligatoires.' }
  }

  // If no API key is set, silently succeed (dev mode)
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_xxx')) {
    console.log('[Contact] Email would be sent:', { firstname, lastname, email, subject })
    return { success: true }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const to = process.env.CONTACT_EMAIL ?? 'contact@liguelekie.cm'

  const { error } = await resend.emails.send({
    from: 'Ligue d\'Obala <noreply@liguelekie.cm>',
    to,
    replyTo: email,
    subject: `[Contact] ${subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2 style="color:#C75D2C">Nouveau message — Ligue d'Obala</h2>
        <p><strong>De :</strong> ${firstname} ${lastname} &lt;${email}&gt;</p>
        <p><strong>Sujet :</strong> ${subject}</p>
        <hr/>
        <p style="white-space:pre-line">${message}</p>
      </div>
    `,
  })

  if (error) return { error: 'Une erreur est survenue. Réessayez plus tard.' }
  revalidatePath('/contact')
  return { success: true }
}
