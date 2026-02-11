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

  // Provisional balance: leads in negotiation/interested but not yet 'Cuota inicial'
  // Assuming a fixed commission of 1,000,000 for calculation (this should be dynamic in real app)
  const provisionalCommission = leads
    .filter(l => ['Interesado', 'En negociación'].includes(l.status) && !l.commission)
    .length * 1000000

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
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
             {/* Stats */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="bg-white p-6 rounded-lg shadow">
                     <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
                     <p className="mt-2 text-3xl font-semibold text-gray-900">{leads.length}</p>
                 </div>
                 <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-400">
                     <h3 className="text-sm font-medium text-gray-500">Saldo Pendiente</h3>
                     <p className="mt-2 text-3xl font-semibold text-gray-900">${pendingCommission.toLocaleString()}</p>
                     <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">Disponible para pago</p>
                        {pendingCommission > 0 && (
                            <a 
                                href={withdrawalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded font-medium transition-colors"
                            >
                                Solicitar Retiro
                            </a>
                        )}
                     </div>
                 </div>
                 <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                     <h3 className="text-sm font-medium text-gray-500">Saldo Pagado</h3>
                     <p className="mt-2 text-3xl font-semibold text-gray-900">${paidCommission.toLocaleString()}</p>
                 </div>
                 <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-400">
                     <h3 className="text-sm font-medium text-gray-500">Proyección</h3>
                     <p className="mt-2 text-3xl font-semibold text-gray-900">${provisionalCommission.toLocaleString()}</p>
                     <p className="text-xs text-gray-500">En negociación</p>
                 </div>
             </div>

             {/* Link Section */}
             <div className="bg-white p-6 rounded-lg shadow">
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
             
             {/* Document Upload Section */}
             <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Documentación Requerida</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {requiredDocs.map(docReq => {
                        const existingDoc = documents.find(d => d.type === docReq.type)
                        const status = existingDoc?.status || 'MISSING'
                        const statusColors: Record<string, string> = {
                            'APPROVED': 'bg-green-100 text-green-800',
                            'PENDING': 'bg-yellow-100 text-yellow-800',
                            'REJECTED': 'bg-red-100 text-red-800',
                            'MISSING': 'bg-gray-100 text-gray-600'
                        }
                        const statusLabels: Record<string, string> = {
                            'APPROVED': 'Aprobado',
                            'PENDING': 'En Revisión',
                            'REJECTED': 'Rechazado',
                            'MISSING': 'Pendiente'
                        }

                        return (
                            <div key={docReq.type} className="border rounded-lg p-4 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium text-sm text-gray-900">{docReq.label}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
                                        {statusLabels[status]}
                                    </span>
                                </div>
                                {status === 'REJECTED' && existingDoc?.feedback && (
                                    <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{existingDoc.feedback}</p>
                                )}
                                {(status === 'MISSING' || status === 'REJECTED') && (
                                    <form action={uploadDocument} className="mt-2">
                                        <input type="hidden" name="type" value={docReq.type} />
                                        <div className="flex flex-col gap-2">
                                            <input 
                                                name="url" 
                                                required 
                                                placeholder="Pegar link (Drive/Dropbox)..." 
                                                className="w-full text-sm border-2 border-dashed border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:border-indigo-500 transition-colors"
                                            />
                                            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-all flex justify-center items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                                Subir Documento
                                            </button>
                                        </div>
                                    </form>
                                )}
                                {(status === 'PENDING' || status === 'APPROVED') && (
                                    <div className="mt-2 text-xs text-blue-600 truncate">
                                        <a href={existingDoc?.url} target="_blank" rel="noopener noreferrer" className="hover:underline">Ver documento</a>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
             </div>

             {/* Mis Referidos */}
             <div className="bg-white p-6 rounded-lg shadow">
                 <h2 className="text-lg font-bold text-gray-900 mb-4">Mis Referidos</h2>
                 <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50">
                             <tr>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interés</th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                             </tr>
                         </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                             {leads.map((lead) => (
                                 <tr key={lead.id}>
                                     <td className="px-6 py-4 whitespace-nowrap">
                                         <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                                         <div className="text-sm text-gray-500">{lead.email}</div>
                                     </td>
                                     <td className="px-6 py-4 whitespace-nowrap">
                                         <StatusBadge status={lead.status} />
                                     </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                         {lead.projectInterest || 'General'}
                                     </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                         <ContactButton 
                                            leadId={lead.id} 
                                            phone={lead.phone} 
                                            currentStatus={lead.status} 
                                         />
                                     </td>
                                 </tr>
                             ))}
                             {leads.length === 0 && (
                                 <tr>
                                     <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                         No tienes referidos registrados aún.
                                     </td>
                                 </tr>
                             )}
                         </tbody>
                     </table>
                 </div>
             </div>

             {/* Projects Share Section */}
             <div className="bg-white p-6 rounded-lg shadow mb-6">
                 <h2 className="text-lg font-medium text-gray-900 mb-4">Compartir Proyectos Específicos</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {lotes.map(lote => {
                         const projectUrl = `${baseUrl}/lote/${lote.slug}?ref=${user.referralCode}`;
                         const projectMsg = `Hola! Te recomiendo ver el proyecto ${lote.title.rendered}. Info aquí: ${projectUrl}`;
                         const projectWa = `https://wa.me/?text=${encodeURIComponent(projectMsg)}`;
                         
                         return (
                             <div key={lote.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                 <h3 className="font-bold text-gray-900 mb-2 truncate" dangerouslySetInnerHTML={{ __html: lote.title.rendered }} />
                                 <div className="flex flex-col gap-3">
                                      <div className="flex items-center gap-2">
                                         <input readOnly value={projectUrl} className="flex-1 text-xs bg-gray-50 border rounded p-2 text-gray-600 truncate" />
                                         <CopyButton text={projectUrl} />
                                      </div>
                                      <div className="flex gap-2">
                                          <a 
                                             href={projectWa}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 rounded text-center transition-colors flex items-center justify-center gap-1"
                                          >
                                             <span>WhatsApp</span>
                                          </a>
                                          <a
                                             href={projectUrl}
                                             target="_blank"
                                             className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 text-sm font-medium"
                                          >
                                             Ver
                                          </a>
                                      </div>
                                      <div className="flex justify-center mt-2 p-2 bg-white border rounded">
                                          <QRCodeSVG value={projectUrl} size={100} />
                                      </div>
                                 </div>
                             </div>
                         )
                     })}
                 </div>
            </div>

            {/* Benefits Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Tus Beneficios y Descuentos</h2>
                {discounts.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay descuentos activos por el momento.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {discounts.map(discount => (
                            <div key={discount.id} className="border border-purple-100 bg-purple-50 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900">{discount.commerceName}</h3>
                                    <span className="bg-purple-200 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{discount.category}</span>
                                </div>
                                <p className="text-sm text-gray-700 mb-3">{discount.benefit}</p>
                                {discount.code ? (
                                    <div className="bg-white border border-purple-200 rounded p-2 text-center">
                                            <span className="text-xs text-gray-500 block mb-1">Código:</span>
                                            <div className="flex items-center justify-center gap-2">
                                                <code className="font-mono font-bold text-lg text-purple-700">{discount.code}</code>
                                                <CopyButton text={discount.code} />
                                            </div>
                                    </div>
                                ) : (
                                    <div className="text-xs text-center italic text-gray-500">
                                        Presenta tu carnet de referidor
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
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
                                        <StatusBadge status={lead.status} />
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
