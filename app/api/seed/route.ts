import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const admin = await prisma.user.upsert({
      where: { email: 'admin@goods.com' },
      update: {
        name: 'Super Admin',
        role: 'ADMIN',
        phone: '3001234567',
        city: 'Bogotá',
        referralCode: 'ADMIN001',
        termsAccepted: true
      },
      create: {
        email: 'admin@goods.com',
        name: 'Super Admin',
        password: 'admin123',
        role: 'ADMIN',
        phone: '3001234567',
        city: 'Bogotá',
        referralCode: 'ADMIN001',
        termsAccepted: true
      }
    })

    const referrer = await prisma.user.upsert({
      where: { email: 'referrer@goods.com' },
      update: {
        name: 'Juan Referidor',
        role: 'REFERRER',
        phone: '3007654321',
        city: 'Medellín',
        referralCode: 'JUAN123',
        termsAccepted: true
      },
      create: {
        email: 'referrer@goods.com',
        name: 'Juan Referidor',
        password: 'ref123',
        role: 'REFERRER',
        phone: '3007654321',
        city: 'Medellín',
        referralCode: 'JUAN123',
        termsAccepted: true
      }
    })

    return NextResponse.json({ success: true, admin, referrer })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
