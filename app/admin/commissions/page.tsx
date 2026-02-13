import prisma from '@/lib/prisma'
import CommissionsTable from '@/app/components/CommissionsTable'

export default async function CommissionsPage() {
  const commissions = await prisma.commission.findMany({
    include: {
      referrer: true,
      lead: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8">
      <h2 className="text-xl font-bold text-[#2D2D2D] mb-8">Comisiones</h2>
      <CommissionsTable initialCommissions={commissions} />
    </div>
  )
}
