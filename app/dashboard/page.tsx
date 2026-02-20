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

             {!docsValidated && (
               <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                 <p className="text-sm text-yellow-800">
                   Tu cuenta está en validación. Ve a <a href="/dashboard/documentacion" className="font-semibold underline">Documentación</a> para subir y revisar tus archivos.
                 </p>
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

                 <div className="bg-white p-6 rounded-lg shadow">
                   <h3 className="text-lg font-medium text-gray-900 mb-2">Tus Fondos</h3>
                   <p className="text-gray-600 mb-4">Saldo pendiente: <span className="font-bold">${pendingCommission.toLocaleString()}</span></p>
                   <a href="/dashboard/fondos" className="inline-flex rounded-full bg-[#F47C20] px-5 py-3 text-sm font-semibold text-white shadow hover:bg-[#d86816]">
                     Gestionar retiros
                   </a>
                 </div>
             </div>

            {/* Acceso a Referidos */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#2D2D2D]">Mis Referidos</h3>
                <p className="text-sm text-gray-500">Consulta el estado de tus leads</p>
              </div>
              <a href="/dashboard/referidos" className="inline-flex rounded-full bg-[#F47C20] px-5 py-3 text-sm font-semibold text-white shadow hover:bg-[#d86816]">
                Ver referidos
              </a>
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
