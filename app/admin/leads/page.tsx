import prisma from '@/lib/prisma'
import LeadsTable from '@/app/components/LeadsTable'

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    include: {
      referrer: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8">
      <h2 className="text-xl font-bold text-[#2D2D2D] mb-8">Gestión de Leads</h2>
      <LeadsTable initialLeads={leads} />
    </div>
  )
}
