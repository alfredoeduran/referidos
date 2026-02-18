import prisma from '@/lib/prisma'
import CommissionsTable from '@/app/components/CommissionsTable'
import Link from 'next/link'

type SearchParams = { [key: string]: string | string[] | undefined }

function getDateRange(preset?: string) {
  if (!preset) return {}
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)

  if (preset === 'week') {
    const day = now.getDay()
    const diff = (day === 0 ? 6 : day - 1)
    start.setDate(now.getDate() - diff)
  } else if (preset === 'month') {
    start.setDate(1)
  } else if (preset === 'year') {
    start.setMonth(0, 1)
  } else {
    return {}
  }

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10)
  }
}

export default async function CommissionsPage({ searchParams }: { searchParams: SearchParams }) {
  const from = searchParams.from as string | undefined
  const to = searchParams.to as string | undefined
  const preset = searchParams.preset as string | undefined

  const where: any = {}
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

  const commissions = await prisma.commission.findMany({
    where,
    include: {
      referrer: true,
      lead: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const presets = ['week', 'month', 'year'] as const
  const currentRange = getDateRange(preset)

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-[#2D2D2D]">Comisiones</h2>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {presets.map(p => {
              const range = getDateRange(p)
              const isActive = preset === p
              const href = range.from && range.to ? `/admin/commissions?preset=${p}&from=${range.from}&to=${range.to}` : '/admin/commissions'
              const label = p === 'week' ? 'Esta semana' : p === 'month' ? 'Este mes' : 'Este año'
              return (
                <Link
                  key={p}
                  href={href}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>
          <form className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <input
              type="date"
              name="from"
              defaultValue={from || currentRange.from}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white"
            />
            <span className="text-xs text-gray-400 text-center sm:px-1">a</span>
            <input
              type="date"
              name="to"
              defaultValue={to || currentRange.to}
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
      </div>
      <CommissionsTable initialCommissions={commissions} />
    </div>
  )
}
