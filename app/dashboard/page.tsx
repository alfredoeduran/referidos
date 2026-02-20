import prisma from '@/lib/prisma'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { logout, uploadDocument, createLead } from '../actions'
import CopyButton from '../components/CopyButton'
import StatusBadge from '../components/StatusBadge'
import ContactButton from '../components/ContactButton'
import { QRCodeSVG } from 'qrcode.react'
import { getLotes } from '@/lib/wordpress'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  const role = cookieStore.get('role')?.value
  
  if (!userId) {
    redirect('/login')
  }

  // Ensure ADMINs are redirected to their panel, though technically they could be here if we allowed dual roles.
  // Given user request for separation, we enforce it.
  if (role === 'ADMIN' || role === 'SUPERADMIN') {
    redirect('/admin')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
        leads: {
            include: { commission: true },
            orderBy: { createdAt: 'desc' }
        },
        commissions: true,
        documents: true
    }
  })

  if (!user) {
      redirect('/login')
  }

  if (user.status === 'INACTIVE' || user.status === 'BLOCKED') {
    redirect('/login?error=account_blocked')
  }

  const lotes = await getLotes()

  const leads = user.leads
  const documents = user.documents
  
  // Commission Logic
  const paidCommission = user.commissions
    .filter(c => c.status === 'PAID')
    .reduce((acc, c) => acc + Number(c.amount), 0)
    
  const pendingCommission = user.commissions
    .filter(c => c.status === 'PENDING' || c.status === 'RELEASED')
    .reduce((acc, c) => acc + Number(c.amount), 0)
    
  const totalCommission = paidCommission + pendingCommission

  // Provisional balance: leads with loteValue but no commission record yet (if any)
  const provisionalCommission = leads
    .filter(l => l.loteValue && Number(l.loteValue) > 0 && !l.commission)
    .reduce((acc, l) => acc + (Number(l.loteValue) * 0.015), 0)

  const withdrawalMessage = `Hola, quisiera solicitar el retiro de mis comisiones acumuladas por valor de $${pendingCommission.toLocaleString()}`
  const withdrawalUrl = `https://wa.me/?text=${encodeURIComponent(withdrawalMessage)}`

  const discounts = await prisma.discount.findMany({ where: { isActive: true } })
  
  // Dynamic Base URL detection
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`
  const referralLink = `${baseUrl}/r/${user.referralCode}`
  
  const whatsappMessage = `Hola! Te invito a unirte a Goods & Co. Regístrate aquí: ${referralLink}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`
  
  const requiredDocs = [
    { type: 'ID_CARD_FRONT', label: 'Cédula (Frontal)' },
    { type: 'ID_CARD_BACK', label: 'Cédula (Trasera)' },
    { type: 'RUT', label: 'RUT' },
    { type: 'BANK_CERT', label: 'Certificación Bancaria' }
  ]
  const approvedTypes = new Set(documents.filter(d => d.status === 'APPROVED').map(d => d.type))
  const docsValidated = requiredDocs.every(d => approvedTypes.has(d.type))

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
        <header className="bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400 mb-1">
                          Panel del Partner
                        </p>
                        <h1 className="text-2xl font-bold text-[#2D2D2D]">
                          Dashboard del Partner
                        </h1>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 sm:mt-0">
                        Bienvenido, <span className="font-semibold uppercase">{user.name}</span>
                      </p>
                    </div>
                    <form action={logout}>
                      <button className="px-4 py-2 rounded-2xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                        Cerrar Sesión
                      </button>
                    </form>
                </div>
            </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
             {/* Stats */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Leads</h3>
                     <p className="mt-3 text-3xl font-extrabold text-[#2D2D2D]">{leads.length}</p>
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Leads Convertidos</h3>
                     <p className="mt-3 text-3xl font-extrabold text-[#2D2D2D]">
                         {leads.filter(l => ['Separado', 'En proceso de escrituracion', 'Escriturado'].includes(l.status)).length}
                     </p>
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Comisiones Ganadas</h3>
                     <p className="mt-3 text-3xl font-extrabold text-emerald-600">${totalCommission.toLocaleString()}</p>
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Saldo Pendiente</h3>
                     <p className="mt-3 text-3xl font-extrabold text-amber-600">${pendingCommission.toLocaleString()}</p>
                 </div>
             </div>

             {/* Provisional Balance Card */}
             {provisionalCommission > 0 && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            {/* Icon */}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                Tienes <span className="font-bold">${provisionalCommission.toLocaleString()}</span> en comisiones provisionales por leads separados (aún no validados por admin).
                            </p>
                        </div>
                    </div>
                </div>
             )}

             {!docsValidated && (
               <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                 <div className="ml-3">
                   <p className="text-sm text-yellow-800">
                     Tu cuenta está en validación. Sube y espera aprobación de tus documentos para habilitar retiros.
                   </p>
                 </div>
               </div>
             )}

             {/* Actions */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Referral Link */}
                 <div className="bg-white p-6 rounded-lg shadow">
                     <h3 className="text-lg font-medium text-gray-900 mb-4">Tu Enlace de Referido</h3>
                     <div className="flex items-center gap-4">
                         <input 
                            readOnly 
                            value={referralLink} 
                            className="flex-1 p-2 border rounded bg-gray-50 text-gray-600 text-sm"
                         />
                         <CopyButton text={referralLink} />
                     </div>
                     <div className="mt-4 flex gap-2">
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-500 text-white py-2 px-4 rounded text-center hover:bg-green-600 transition-colors">
                            Compartir en WhatsApp
                        </a>
                     </div>
                 </div>

                 {/* Withdrawal */}
                 <div className="bg-white p-6 rounded-lg shadow">
                     <h3 className="text-lg font-medium text-gray-900 mb-4">Retirar Fondos</h3>
                     <p className="text-gray-600 mb-4">Saldo disponible para retiro: <span className="font-bold">${pendingCommission.toLocaleString()}</span></p>
                     {pendingCommission > 0 && docsValidated ? (
                        <a href={withdrawalUrl} target="_blank" rel="noopener noreferrer" className="block w-full bg-indigo-600 text-white py-2 px-4 rounded text-center hover:bg-indigo-700 transition-colors">
                            Solicitar Retiro
                        </a>
                     ) : (
                        <button disabled className="block w-full bg-gray-300 text-gray-500 py-2 px-4 rounded text-center cursor-not-allowed">
                            Solicitar Retiro
                        </button>
                     )}
                 </div>
             </div>

            {/* Document Upload Section */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Documentación Requerida</h3>
                <div className="space-y-4">
                    {requiredDocs.map((doc) => {
                        const existingDoc = documents.find(d => d.type === doc.type)
                        return (
                            <div key={doc.type} className="border rounded p-4 flex justify-between items-center">
                                <div>
                                    <h4 className="font-medium text-gray-900">{doc.label}</h4>
                                    {existingDoc ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <StatusBadge status={existingDoc.status} />
                                            {existingDoc.feedback && <span className="text-sm text-red-500">{existingDoc.feedback}</span>}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-500">Pendiente de carga</span>
                                    )}
                                </div>
                                <div>
                                    {(!existingDoc || existingDoc.status === 'REJECTED') && (
                                        <form action={uploadDocument} className="flex items-center gap-2">
                                            <input type="hidden" name="type" value={doc.type} />
                                            <input 
                                                type="file"
                                                name="file"
                                                accept="image/*,application/pdf"
                                                required 
                                                className="text-sm text-gray-700 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 cursor-pointer"
                                            />
                                            <button className="bg-gray-900 text-white px-3 py-1 rounded text-sm hover:bg-gray-800">
                                                Subir
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

             {/* Leads List */}
             <div className="bg-white shadow rounded-lg overflow-hidden">
                 <div className="px-6 py-4 border-b border-gray-200">
                     <h3 className="text-lg font-medium text-gray-900">Mis Referidos</h3>
                 </div>
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
             
             {/* Discounts Section */}
             <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Descuentos Exclusivos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {discounts.map(discount => (
                        <div key={discount.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">{discount.category}</div>
                            <h4 className="font-bold text-lg text-gray-900">{discount.commerceName}</h4>
                            <p className="text-gray-600 mt-2">{discount.benefit}</p>
                            {discount.code && (
                                <div className="mt-4 bg-gray-100 p-2 rounded text-center font-mono text-sm font-bold text-gray-800">
                                    {discount.code}
                                </div>
                            )}
                        </div>
                    ))}
                    {discounts.length === 0 && (
                        <p className="text-gray-500 col-span-3 text-center py-4">Próximamente más beneficios.</p>
                    )}
                </div>
             </div>
        </main>
    </div>
  )
}
