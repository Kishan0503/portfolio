/**
 * Vercel serverless function: receives contact-form submissions and emails them
 * to the owner via Resend. The Resend API key is server-side only.
 *
 * Note: on Resend's free tier without a verified domain, emails can only be
 * sent from `onboarding@resend.dev` to the address the Resend account was
 * registered with. TO_EMAIL below must match that account email. To send from
 * a custom domain, verify one in Resend and update FROM_EMAIL.
 */
import { Resend } from 'resend'

const TO_EMAIL = 'kishanpanchal0503@gmail.com'
const FROM_EMAIL = 'Portfolio Contact <onboarding@resend.dev>'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Email service not configured' })
    return
  }

  // Body may arrive parsed (Vercel) or as a raw string.
  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = {}
    }
  }

  const name = (body?.name || '').trim()
  const email = (body?.email || '').trim()
  const message = (body?.message || '').trim()

  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required.' })
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Please provide a valid email address.' })
    return
  }
  if (message.length > 5000) {
    res.status(400).json({ error: 'Message is too long.' })
    return
  }

  const resend = new Resend(apiKey)

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `Portfolio contact from ${name}`,
      text: `New message from your portfolio contact form:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    })

    if (error) {
      res.status(502).json({ error: 'Failed to send message. Please try again later.' })
      return
    }

    res.status(200).json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to send message. Please try again later.' })
  }
}
