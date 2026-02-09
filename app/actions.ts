'use server'

import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

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

  const cookieStore = await cookies()
  cookieStore.set('userId', user.id)
  cookieStore.set('role', user.role)

  if (user.role === 'ADMIN') {
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

// --- ADMIN ---

export async function updateLeadStatus(leadId: string, status: string) {
  const cookieStore = await cookies()
  const role = cookieStore.get('role')?.value
  
  if (role !== 'ADMIN') return { error: 'No autorizado' }

  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: { status }
  })

  if (status === 'DOWN_PAYMENT_PAID') {
    const existing = await prisma.commission.findUnique({
      where: { leadId }
    })
    
    if (!existing) {
       await prisma.commission.create({
         data: {
           leadId,
           referrerId: lead.referrerId,
           status: 'PENDING',
           amount: 1000000 // Mock amount
         }
       })
    }
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

export async function toggleLeadValidity(leadId: string) {
  const cookieStore = await cookies()
  const role = cookieStore.get('role')?.value
  
  if (role !== 'ADMIN') return { error: 'No autorizado' }

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
  
  if (role !== 'ADMIN') return { error: 'No autorizado' }

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
  
  if (role !== 'ADMIN') return { error: 'No autorizado' }

  await prisma.document.update({
    where: { id: docId },
    data: { status, feedback }
  })

  revalidatePath('/admin')
}

export async function createDiscount(formData: FormData) {
  const cookieStore = await cookies()
  const role = cookieStore.get('role')?.value
  
  if (role !== 'ADMIN') return { error: 'No autorizado' }

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
