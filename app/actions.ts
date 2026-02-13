'use server'

import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function sendValidationEmail(email: string, name: string) {
  // Simulación de envío de correo
  console.log(`[EMAIL] Enviando correo de validación a: ${email} para ${name}`)
  // Aquí se integraría con un servicio como Resend, SendGrid o AWS SES
}

// --- AUTH ---

export async function registerReferrer(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const phone = formData.get('phone') as string
  const city = formData.get('city') as string
  
  if (!name || !email || !password) {
    return { error: 'Faltan campos obligatorios' }
  }

  const referralCode = name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 10000).toString()

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // TODO: Hash password
        phone,
        city,
        role: 'REFERRER',
        referralCode,
        termsAccepted: true
      }
    })
    
    const cookieStore = await cookies()
    cookieStore.set('userId', user.id)
    cookieStore.set('role', user.role)

    await sendValidationEmail(email, name)
  } catch (e) {
    console.error(e)
    return { error: 'El usuario ya existe' }
  }

  redirect('/dashboard')
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user || user.password !== password) {
    return { error: 'Credenciales inválidas' }
  }

  if (user.status === 'INACTIVE' || user.status === 'BLOCKED') {
    return { error: `Acceso denegado: ${user.blockingReason || 'Su cuenta ha sido desactivada.'}` }
  }

  const cookieStore = await cookies()
  cookieStore.set('userId', user.id)
  cookieStore.set('role', user.role)

  if (['ADMIN', 'SUPERADMIN', 'MANAGER'].includes(user.role)) {
    redirect('/admin')
  } else {
    redirect('/dashboard')
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('userId')
  cookieStore.delete('role')
  redirect('/login')
}

// --- PUBLIC LEAD ---

export async function createLead(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const city = formData.get('city') as string
  const project = formData.get('project') as string
  const referralCode = formData.get('referralCode') as string

  const referrer = await prisma.user.findUnique({
    where: { referralCode }
  })

  if (!referrer) {
    return { error: 'Código de referido inválido' }
  }

  try {
    await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        city,
        projectInterest: project,
        referrerId: referrer.id
      }
    })
    
    revalidatePath('/admin')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (e) {
    return { error: 'Error al crear lead' }
  }
}

// --- TRACKING ---

export async function recordClick(code: string, path: string) {
  const referrer = await prisma.user.findUnique({
    where: { referralCode: code }
  })

  if (referrer) {
    await prisma.click.create({
      data: {
        referrerId: referrer.id,
        path
      }
    })
  }
}

// --- ADMIN ---

export async function markLeadAsContacted(leadId: string) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  
  if (!userId) return { error: 'No autorizado' }

  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  
  if (!lead) return { error: 'Lead no encontrado' }
  if (lead.referrerId !== userId) return { error: 'No autorizado' }
  
  // Only allow transition from 'Registrado' to 'Contactado'
  if (lead.status === 'Registrado') {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'Contactado' }
    })
    
    revalidatePath('/dashboard')
    revalidatePath('/admin')
  }
}

export async function updateLeadStatus(leadId: string, status: string, loteValue?: number) {
  const cookieStore = await cookies()
  const role = cookieStore.get('role')?.value
  
  if (!['ADMIN', 'SUPERADMIN'].includes(role || '')) return { error: 'No autorizado' }

  const data: any = { status }
  if (loteValue !== undefined) {
    data.loteValue = loteValue
  }

  const lead = await prisma.lead.update({
    where: { id: leadId },
    data
  })

  // Si el estado es "Separado" (o similar que dispare la comisión), calculamos el 1.5%
  if (status === 'Separado' && loteValue) {
    const commissionAmount = Number(loteValue) * 0.015

    const existing = await prisma.commission.findUnique({
      where: { leadId }
    })

    if (!existing) {
      await prisma.commission.create({
        data: {
          leadId,
          referrerId: lead.referrerId,
          status: 'PENDING',
          amount: commissionAmount
        }
      })
    } else {
      await prisma.commission.update({
        where: { leadId },
        data: {
          amount: commissionAmount
        }
      })
    }
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

export async function toggleUserStatus(userId: string) {
  const cookieStore = await cookies()
  const role = cookieStore.get('role')?.value
  
  if (!['ADMIN', 'SUPERADMIN'].includes(role || '')) return { error: 'No autorizado' }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { error: 'Usuario no encontrado' }

  await prisma.user.update({
    where: { id: userId },
    data: { status: user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
  })

  revalidatePath('/admin')
}

export async function createPartner(formData: FormData) {
  const cookieStore = await cookies()
  const role = cookieStore.get('role')?.value

  if (!['ADMIN', 'SUPERADMIN'].includes(role || '')) return { error: 'No autorizado' }

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const phone = formData.get('phone') as string

  if (!name || !email || !password) return { error: 'Faltan campos' }

  const referralCode = name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 10000).toString()

  try {
      await prisma.user.create({
          data: {
              name, email, password, phone,
              role: 'REFERRER',
              status: 'ACTIVE',
              referralCode,
              termsAccepted: true
          }
      })
      revalidatePath('/admin')
      return { success: true }
  } catch(e) {
      return { error: 'Error al crear usuario' }
  }
}

export async function toggleLeadValidity(leadId: string) {
  const cookieStore = await cookies()
  const role = cookieStore.get('role')?.value

  if (!['ADMIN', 'SUPERADMIN'].includes(role || '')) return { error: 'No autorizado' }

  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead) return { error: 'Lead no encontrado' }

  await prisma.lead.update({
    where: { id: leadId },
    data: { isValid: !lead.isValid }
  })

  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

export async function updateCommissionStatus(commissionId: string, status: string) {
  const cookieStore = await cookies()
  const role = cookieStore.get('role')?.value

  if (!['ADMIN', 'SUPERADMIN'].includes(role || '')) return { error: 'No autorizado' }

  await prisma.commission.update({
    where: { id: commissionId },
    data: { status }
  })

  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

export async function uploadDocument(formData: FormData) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) return { error: 'No autorizado' }

  const type = formData.get('type') as string
  const url = formData.get('url') as string // For MVP using URL input

  await prisma.document.create({
    data: {
      type,
      url,
      userId,
      status: 'PENDING'
    }
  })

  revalidatePath('/dashboard')
}

export async function updateDocumentStatus(docId: string, status: string, feedback?: string) {
  const cookieStore = await cookies()
  const role = cookieStore.get('role')?.value

  if (!['ADMIN', 'SUPERADMIN'].includes(role || '')) return { error: 'No autorizado' }

  await prisma.document.update({
    where: { id: docId },
    data: { status, feedback }
  })

  revalidatePath('/admin')
}

export async function createDiscount(formData: FormData) {
  const cookieStore = await cookies()
  const role = cookieStore.get('role')?.value
  
  if (!['ADMIN', 'SUPERADMIN'].includes(role || '')) return { error: 'No autorizado' }

  const commerceName = formData.get('commerceName') as string
  const category = formData.get('category') as string
  const benefit = formData.get('benefit') as string
  const code = formData.get('code') as string

  await prisma.discount.create({
    data: {
      commerceName,
      category,
      benefit,
      code
    }
  })

  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

export async function updatePartnerStatus(partnerId: string, status: string, blockingReason?: string) {
  const cookieStore = await cookies()
  const role = cookieStore.get('role')?.value

  if (!['ADMIN', 'SUPERADMIN'].includes(role || '')) {
    return { error: 'No autorizado' }
  }

  try {
    await prisma.user.update({
      where: { id: partnerId },
      data: {
        status,
        blockingReason: status === 'INACTIVE' || status === 'BLOCKED' ? blockingReason : null
      }
    })

    revalidatePath('/admin/partners')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Error al actualizar estado del partner' }
  }
}
