import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      phone,
      loteId,
      loteTitle,
      loteSlug,
      referralCode
    }: {
      phone?: string
      loteId?: number
      loteTitle?: string
      loteSlug?: string
      referralCode?: string | null
    } = body

    if (!phone) {
      return NextResponse.json({ error: 'phone required' }, { status: 400 })
    }

    let referrerId: string | undefined

    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode }
      })

      if (referrer) {
        referrerId = referrer.id
      }
    }

    await prisma.whatsappLead.create({
      data: {
        phone,
        loteId: typeof loteId === 'number' ? loteId : null,
        loteTitle: loteTitle || null,
        loteSlug: loteSlug || null,
        referralCode: referralCode || null,
        referrerId: referrerId || null
      }
    })

    if (referrerId) {
      const digits = phone.replace(/\D/g, '')
      const safePhone = digits || phone

      await prisma.lead.create({
        data: {
          name: `WhatsApp ${safePhone}`,
          email: `whatsapp+${safePhone}@lead.local`,
          phone,
          city: null,
          projectInterest: loteTitle || loteSlug || null,
          referrerId
        }
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error creating whatsapp lead', error)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
