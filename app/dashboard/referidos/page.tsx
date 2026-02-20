import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import StatusBadge from '../../components/StatusBadge'

export default async function ReferidosPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  const role = cookieStore.get('role')?.value

  if (!userId) redirect('/login')
  if (role === 'ADMIN' || role === 'SUPERADMIN') redirect('/admin')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      leads: {
        include: { commission: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!user) redirect('/login')

  const leads = user.leads

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-5">
        <h1 className="text-xl font-bold text-[#2D2D2D]">Mis Referidos</h1>
        <p className="text-sm text-gray-500">Listado de leads e inversión asociada</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyecto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 uppercase">{lead.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.projectInterest || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.commission ? (
                      <span className="text-green-600 font-medium">${Number(lead.commission.amount).toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aún no tienes referidos. ¡Comparte tu enlace!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
