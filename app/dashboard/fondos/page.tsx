import prisma from '@/lib/prisma'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function FondosPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  const role = cookieStore.get('role')?.value

  if (!userId) redirect('/login')
  if (role === 'ADMIN' || role === 'SUPERADMIN') redirect('/admin')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      leads: { include: { commission: true } },
      commissions: true,
      documents: true,
    },
  })
  if (!user) redirect('/login')

  const leads = user.leads
  const paidCommission = user.commissions.filter(c => c.status === 'PAID').reduce((a, c) => a + Number(c.amount), 0)
  const pendingCommission = user.commissions.filter(c => c.status === 'PENDING' || c.status === 'RELEASED').reduce((a, c) => a + Number(c.amount), 0)
  const totalCommission = paidCommission + pendingCommission
  const provisionalCommission = leads.filter(l => l.loteValue && Number(l.loteValue) > 0 && !l.commission).reduce((a, l) => a + (Number(l.loteValue) * 0.015), 0)
  const requiredDocs = ['ID_CARD_FRONT', 'ID_CARD_BACK', 'RUT', 'BANK_CERT']
  const approvedTypes = new Set(user.documents.filter(d => d.status === 'APPROVED').map(d => d.type))
  const docsValidated = requiredDocs.every(t => approvedTypes.has(t))

  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const withdrawalMessage = `Hola, quisiera solicitar el retiro de mis comisiones acumuladas por valor de $${pendingCommission.toLocaleString()}`
  const withdrawalUrl = `https://wa.me/?text=${encodeURIComponent(withdrawalMessage)}`

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-5">
        <h1 className="text-xl font-bold text-[#2D2D2D]">Fondos</h1>
        <p className="text-sm text-gray-500">Resumen de comisiones y retiros</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Comisiones Ganadas</h3>
          <p className="mt-3 text-3xl font-extrabold text-emerald-600">${totalCommission.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Saldo Pendiente</h3>
          <p className="mt-3 text-3xl font-extrabold text-amber-600">${pendingCommission.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Saldo Provisional</h3>
          <p className="mt-3 text-3xl font-extrabold text-blue-600">${provisionalCommission.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Retirar Fondos</h3>
        <p className="text-gray-600 mb-4">Saldo disponible para retiro: <span className="font-bold">${pendingCommission.toLocaleString()}</span></p>
        {pendingCommission > 0 && docsValidated ? (
          <a href={withdrawalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full bg-[#F47C20] px-6 py-3 text-sm font-semibold text-white shadow hover:bg-[#d86816]">
            Solicitar Retiro por WhatsApp
          </a>
        ) : (
          <div className="text-sm text-gray-500">Debes tener saldo pendiente y documentación aprobada para solicitar retiro.</div>
        )}
      </div>
    </div>
  )
}
