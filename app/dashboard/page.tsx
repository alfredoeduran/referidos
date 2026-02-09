import prisma from '@/lib/prisma'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { logout, uploadDocument, createLead } from '../actions'
import CopyButton from '../components/CopyButton'
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
  if (role === 'ADMIN') {
    redirect('/admin')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
        leads: {
            include: { commission: true }
        },
        commissions: true,
        documents: true
    }
  })

  if (!user) {
      redirect('/login')
  }

  const lotes = await getLotes()

  const leads = user.leads
  const documents = user.documents
  const totalCommission = user.commissions.reduce((acc, c) => acc + Number(c.amount), 0)
  
  const discounts = await prisma.discount.findMany({ where: { isActive: true } })
  
  // Dynamic Base URL detection
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`
  const referralLink = `${baseUrl}/r/${user.referralCode}`
  
  const whatsappMessage = `Hola! Te invito a unirte a Goods & Co. Regístrate aquí: ${referralLink}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard de Referidor</h1>
                <form action={logout}>
                    <button className="text-red-600 hover:text-red-800 font-medium">Cerrar Sesión</button>
                </form>
            </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
             {/* Link Section */}
             <div className="bg-white p-6 rounded-lg shadow mb-6">
                 <h2 className="text-lg font-medium text-gray-900">Tu Link de Referido</h2>
                 <div className="mt-4 flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 w-full">
                        <div className="flex items-center mb-4 gap-2">
                            <code className="bg-gray-100 p-2 rounded flex-1 text-black border border-gray-200 break-all">{referralLink}</code>
                            <CopyButton text={referralLink} />
                            <a 
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded transition-colors flex items-center justify-center"
                                title="Compartir en WhatsApp"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                            </a>
                        </div>
                        <p className="text-sm text-gray-500">Comparte este link para registrar leads.</p>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                        <QRCodeSVG value={referralLink} size={128} />
                        <span className="text-xs text-gray-500 mt-2">Tu QR Personal</span>
                    </div>
                 </div>
             </div>

             {/* Manual Lead Registration Form for Referrers */}
             <div className="bg-white p-6 rounded-lg shadow mb-6">
                 <h2 className="text-lg font-medium text-gray-900 mb-4">Registrar Nuevo Referido</h2>
                 <form action={async (formData) => {
                    'use server'
                    await createLead(formData)
                }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Hidden Referral Code */}
                     <input type="hidden" name="referralCode" value={user.referralCode || ''} />
                     
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente</label>
                         <input name="name" required className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-900 bg-white" placeholder="Nombre completo" />
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                         <input name="email" type="email" required className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-900 bg-white" placeholder="correo@ejemplo.com" />
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                         <input name="phone" required className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-900 bg-white" placeholder="+57 300..." />
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                         <input name="city" className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-900 bg-white" placeholder="Ciudad" />
                     </div>
                     <div className="md:col-span-2">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto de Interés</label>
                         <select name="project" className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-900 bg-white">
                             <option value="">Seleccionar Proyecto...</option>
                             {lotes.map(lote => (
                                 <option key={lote.id} value={lote.title.rendered}>{lote.title.rendered}</option>
                             ))}
                         </select>
                     </div>
                     <div className="md:col-span-2 flex justify-end">
                         <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-medium text-sm transition-colors">
                             Registrar Referido
                         </button>
                     </div>
                 </form>
             </div>

             {/* Stats */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                 <div className="bg-white p-6 rounded-lg shadow">
                     <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
                     <p className="mt-2 text-3xl font-semibold text-gray-900">{leads.length}</p>
                 </div>
                 <div className="bg-white p-6 rounded-lg shadow">
                     <h3 className="text-sm font-medium text-gray-500">Comisiones Generadas</h3>
                     <p className="mt-2 text-3xl font-semibold text-gray-900">${totalCommission.toLocaleString()}</p>
                 </div>
                 <div className="bg-white p-6 rounded-lg shadow">
                     <h3 className="text-sm font-medium text-gray-500">Estado Documentos</h3>
                     <p className="mt-2 text-xl font-semibold text-gray-900">
                        {documents.some(d => d.status === 'APPROVED') ? 'Aprobado' : 
                         documents.some(d => d.status === 'PENDING') ? 'En Revisión' : 'Pendiente'}
                     </p>
                 </div>
             </div>

             {/* Documents Section */}
             <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Mis Documentos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-medium text-gray-700 mb-2">Subir Documento</h3>
                        <form action={async (formData) => {
                            'use server'
                            await uploadDocument(formData)
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
                                <select name="type" className="w-full p-2 border rounded text-black bg-white">
                                    <option value="ID_CARD">Cédula</option>
                                    <option value="RUT">RUT</option>
                                    <option value="BANK_CERT">Certificación Bancaria</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Enlace al Documento (Drive/Dropbox)</label>
                                <input name="url" type="url" required className="w-full p-2 border rounded text-black" placeholder="https://..." />
                            </div>
                            <button className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Enviar Documento</button>
                        </form>
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-700 mb-2">Historial</h3>
                        <ul className="space-y-2">
                            {documents.map(doc => (
                                <li key={doc.id} className="border p-3 rounded flex justify-between items-center">
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {doc.type === 'ID_CARD' ? 'Cédula' : doc.type === 'RUT' ? 'RUT' : 'Cert. Bancaria'}
                                        </div>
                                        <div className="text-xs text-blue-600 truncate max-w-[200px]">{doc.url}</div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 text-xs leading-5 font-semibold rounded-full 
                                            ${doc.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                                              doc.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {doc.status}
                                        </span>
                                        {doc.feedback && <div className="text-xs text-red-500 mt-1">{doc.feedback}</div>}
                                    </div>
                                </li>
                            ))}
                            {documents.length === 0 && <p className="text-gray-500 text-sm">No has subido documentos.</p>}
                        </ul>
                    </div>
                </div>
             </div>

             {/* Leads Table */}
             <div className="bg-white p-6 rounded-lg shadow mb-6">
                 <h2 className="text-lg font-medium text-gray-900 mb-4">Mis Referidos</h2>
                 <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200">
                         <thead>
                             <tr>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validación</th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión</th>
                             </tr>
                         </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                             {leads.map(lead => (
                                 <tr key={lead.id}>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.name}</td>
                                     <td className="px-6 py-4 whitespace-nowrap">
                                        {lead.isValid ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Validado
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-500">
                                                Pendiente
                                            </span>
                                        )}
                                     </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${lead.status === 'REGISTERED' ? 'bg-yellow-100 text-yellow-800' : 
                                              lead.status === 'DOWN_PAYMENT_PAID' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {lead.status}
                                        </span>
                                     </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.createdAt.toLocaleDateString()}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                         {lead.commission ? `$${Number(lead.commission.amount)}` : '-'}
                                     </td>
                                 </tr>
                             ))}
                             {leads.length === 0 && (
                                 <tr>
                                     <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No hay referidos aún.</td>
                                 </tr>
                             )}
                         </tbody>
                     </table>
                 </div>
             </div>

             {/* Discounts Section */}
             <div className="bg-white p-6 rounded-lg shadow">
                 <h2 className="text-lg font-medium text-gray-900 mb-4">Beneficios Disponibles</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {discounts.map(d => (
                        <div key={d.id} className="border rounded p-4 hover:shadow-md transition">
                            <h3 className="font-bold text-gray-800">{d.commerceName}</h3>
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">{d.category}</span>
                            <p className="mt-2 text-gray-600 font-medium">{d.benefit}</p>
                            {d.code && (
                                <div className="mt-3 bg-gray-50 p-2 rounded text-center border border-dashed border-gray-300">
                                    <span className="text-sm text-gray-500 block">Tu código:</span>
                                    <span className="font-mono font-bold text-gray-800">{d.code}</span>
                                </div>
                            )}
                        </div>
                    ))}
                    {discounts.length === 0 && <p className="text-gray-500">No hay beneficios activos por el momento.</p>}
                 </div>
             </div>
        </main>
    </div>
  )
}
