import prisma from '@/lib/prisma'
import LeadsTable from '@/app/components/LeadsTable'

type SearchParams = { [key: string]: string | string[] | undefined }

type WhereClause = {
  createdAt?: {
    gte?: Date
    lte?: Date
  }
}

export default async function LeadsPage({ searchParams }: { searchParams: SearchParams }) {
  const from = searchParams.from as string | undefined
  const to = searchParams.to as string | undefined

  const where: WhereClause = {}
  if (from || to) {
    where.createdAt = {}
    if (from) {
      where.createdAt.gte = new Date(from)
    }
    if (to) {
      const toDate = new Date(to)
      toDate.setHours(23, 59, 59, 999)
      where.createdAt.lte = toDate
    }
  }

  const leads = await prisma.lead.findMany({
    where,
    include: {
      referrer: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const safeLeads = leads.map(lead => ({
    ...lead,
    loteValue: lead.loteValue ? Number(lead.loteValue) : null
  }))

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-[#2D2D2D]">Gestión de Leads</h2>
        <form className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white"
          />
          <span className="text-xs text-gray-400 text-center sm:px-1">a</span>
          <input
            type="date"
            name="to"
            defaultValue={to || from}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            Filtrar
          </button>
        </form>
      </div>
      <LeadsTable initialLeads={safeLeads} />
    </div>
  )
}
