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

    console.log('whatsapp-lead:in', {
      hasPhone: !!phone,
      hasReferral: !!referralCode,
      loteId,
      loteSlug
    })

    if (!phone) {
      return NextResponse.json({ error: 'phone required' }, { status: 400 })
    }

    let referrerId: string | undefined
    const effectiveReferralCode = referralCode || req.cookies.get('referralCode')?.value || null

    if (effectiveReferralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: effectiveReferralCode }
      })

      if (referrer) {
        referrerId = referrer.id
      }
    }

    console.log('whatsapp-lead:ref', { hasReferrer: !!referrerId })

    await prisma.whatsappLead.create({
      data: {
        phone,
        loteId: typeof loteId === 'number' ? loteId : null,
        loteTitle: loteTitle || null,
        loteSlug: loteSlug || null,
        referralCode: effectiveReferralCode,
        referrerId: referrerId || null
      }
    })

    if (referrerId) {
      const digits = phone.replace(/\D/g, '')
      const safePhone = digits || phone

      const possibleWhatsappEmail = `whatsapp+${safePhone}@lead.local`
      const existing = await prisma.lead.findFirst({
        where: {
          OR: [
            { phone },
            { email: possibleWhatsappEmail }
          ]
        }
      })

      if (!existing) {
        await prisma.lead.create({
          data: {
            name: `WhatsApp ${safePhone}`,
            email: possibleWhatsappEmail,
            phone,
            city: null,
            projectInterest: loteTitle || loteSlug || null,
            referrerId
          }
        })
        console.log('whatsapp-lead:lead', { createdLead: true })
      } else {
        console.log('whatsapp-lead:lead', { createdLead: false, reason: 'duplicate' })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error creating whatsapp lead', error)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
