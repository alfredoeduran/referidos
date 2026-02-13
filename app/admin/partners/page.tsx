import prisma from '@/lib/prisma'
import PartnersTable from '@/app/components/PartnersTable'

export default async function PartnersPage() {
  // Fetch referrers (users with role REFERRER)
  const partners = await prisma.user.findMany({
    where: {
      role: 'REFERRER'
    },
    include: {
      _count: {
        select: { leads: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8">
      <h2 className="text-xl font-bold text-[#2D2D2D] mb-8">Partners Registrados</h2>
      <PartnersTable initialPartners={partners} />
    </div>
  )
}
