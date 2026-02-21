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

    let assignedReferrerId = referrerId
    if (!assignedReferrerId) {
      const adminUser = await prisma.user.findFirst({
        where: { role: { in: ['ADMIN', 'SUPERADMIN'] } },
        orderBy: { createdAt: 'asc' }
      })
      assignedReferrerId = adminUser?.id || null
      if (!assignedReferrerId) {
        const envAdminId = process.env.DEFAULT_ADMIN_ID
        if (envAdminId) {
          const envAdmin = await prisma.user.findUnique({ where: { id: envAdminId } })
          if (envAdmin && ['ADMIN', 'SUPERADMIN'].includes(envAdmin.role)) {
            assignedReferrerId = envAdmin.id
            console.log('whatsapp-lead:adminAssignEnv', { usedEnvAdmin: true })
          } else {
            console.log('whatsapp-lead:adminAssignEnv', { usedEnvAdmin: false })
          }
        }
      }
      console.log('whatsapp-lead:adminAssign', { hasAdmin: !!assignedReferrerId })
    }

    if (assignedReferrerId) {
      const digits = phone.replace(/\D/g, '')
      const safePhone = digits || phone

      const normalizedPhone = safePhone
      const projectInterest = loteTitle || loteSlug || null

      const existingLeads = await prisma.lead.findMany({
        where: {
          phone: normalizedPhone
        }
      })

      if (existingLeads.length > 0) {
        const hasOtherReferrer = existingLeads.some(l => l.referrerId !== assignedReferrerId)
        if (hasOtherReferrer) {
          console.log('whatsapp-lead:lead', { createdLead: false, reason: 'phone_owned_by_other_referrer' })
          return NextResponse.json({ ok: true })
        }

        const sameProject = existingLeads.some(
          l => l.referrerId === assignedReferrerId && l.projectInterest === projectInterest
        )
        if (sameProject) {
          console.log('whatsapp-lead:lead', { createdLead: false, reason: 'same_project_for_referrer' })
          return NextResponse.json({ ok: true })
        }
      }

      await prisma.lead.create({
        data: {
          name: `WhatsApp ${normalizedPhone}`,
          email: `whatsapp+${normalizedPhone}@lead.local`,
          phone: normalizedPhone,
          city: null,
          projectInterest,
          referrerId: assignedReferrerId
        }
      })
      console.log('whatsapp-lead:lead', { createdLead: true })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error creating whatsapp lead', error)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
