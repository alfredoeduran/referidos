import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { updateLeadStatus, logout, createDiscount, updateCommissionStatus, toggleLeadValidity, createLead, updateDocumentStatus, toggleUserStatus, createPartner } from '../actions'
import { getLotes } from '@/lib/wordpress'
import StatusBadge from '../components/StatusBadge'
import ContactButton from '../components/ContactButton'

import AdminFilters from './AdminFilters'
import ExportButton from '../components/ExportButton'

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const cookieStore = await cookies()
  const role = cookieStore.get('role')?.value
  
  if (!['ADMIN', 'SUPERADMIN', 'MANAGER'].includes(role || '')) {
    redirect('/login')
  }

  const canEdit = ['ADMIN', 'SUPERADMIN'].includes(role || '')
  const filters = await searchParams

  const whereClause: any = {}
  
  if (filters?.partnerId) whereClause.referrerId = filters.partnerId as string
  if (filters?.status) whereClause.status = filters.status as string
  if (filters?.project) whereClause.projectInterest = { contains: filters.project as string }
  
  if (filters?.startDate || filters?.endDate) {
    whereClause.createdAt = {}
    if (filters.startDate) whereClause.createdAt.gte = new Date(filters.startDate as string)
    if (filters.endDate) whereClause.createdAt.lte = new Date(new Date(filters.endDate as string).setHours(23, 59, 59, 999))
  }

  const lotes = await getLotes()

  const leads = await prisma.lead.findMany({
      where: whereClause,
      include: { referrer: true, commission: true },
      orderBy: { createdAt: 'desc' }
  })

  const referrers = await prisma.user.findMany({
    where: { role: 'REFERRER' },
    include: { 
        _count: { select: { leads: true } } 
    },
    orderBy: { createdAt: 'desc' }
  })
  
  const discounts = await prisma.discount.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const pendingDocuments = await prisma.document.findMany({
    where: { status: 'PENDING' },
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  })

  // KPIs Calculation
  const totalLeads = leads.length
  const activeLeads = leads.filter(l => ['Contactado', 'Interesado', 'En negociación', 'Cuota inicial'].includes(l.status)).length
  const pendingCommissions = leads.filter(l => l.commission?.status === 'PENDING').length
  const paidCommissions = leads.filter(l => l.commission?.status === 'PAID').length
  const activeDiscounts = discounts.filter(d => d.isActive).length
  const totalReferrers = referrers.length

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                    <p className="text-sm text-gray-500">Gestión centralizada de referidos y comisiones</p>
                </div>
                <form action={logout}>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                        Cerrar Sesión
                    </button>
                </form>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <KpiCard title="Total Leads" value={totalLeads} />
                <KpiCard title="Leads Activos" value={activeLeads} color="blue" />
                <KpiCard title="Comisiones Pendientes" value={pendingCommissions} color="yellow" />
                <KpiCard title="Comisiones Pagadas" value={paidCommissions} color="green" />
                <KpiCard title="Descuentos Activos" value={activeDiscounts} color="purple" />
                <KpiCard title="Referidores" value={totalReferrers} color="indigo" />
            </div>

            {/* Referrers Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Referidores Registrados</h2>
                </div>
                {referrers.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No hay referidores registrados.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {referrers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-xs text-gray-500">Registrado: {user.createdAt.toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{user.email}</div>
                                            <div className="text-sm text-gray-500">{user.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                                                {user.referralCode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-gray-900">{user._count.leads}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <form action={async () => {
                                                'use server'
                                                await toggleUserStatus(user.id)
                                            }}>
                                                <button className={`${user.status === 'ACTIVE' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}>
                                                    {user.status === 'ACTIVE' ? 'Bloquear' : 'Activar'}
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pending Documents Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Documentos Pendientes</h2>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{pendingDocuments.length} pendientes</span>
                </div>
                {pendingDocuments.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No hay documentos pendientes de revisión.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pendingDocuments.map(doc => (
                                    <tr key={doc.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{doc.user.name}</div>
                                            <div className="text-xs text-gray-500">{doc.user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {doc.type === 'ID_CARD' ? 'Cédula' : doc.type === 'RUT' ? 'RUT' : 'Cert. Bancaria'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 text-sm flex items-center gap-1">
                                                <span>Ver Archivo</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {doc.createdAt.toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <form action={async () => {
                                                    'use server'
                                                    await updateDocumentStatus(doc.id, 'APPROVED')
                                                }}>
                                                    <button className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded text-xs font-bold transition-colors">
                                                        Aprobar
                                                    </button>
                                                </form>
                                                <form action={async (formData) => {
                                                    'use server'
                                                    const reason = formData.get('reason') as string
                                                    await updateDocumentStatus(doc.id, 'REJECTED', reason)
                                                }} className="flex items-center gap-2">
                                                    <input 
                                                        name="reason" 
                                                        required 
                                                        placeholder="Motivo de rechazo..." 
                                                        className="text-xs border-gray-300 rounded focus:ring-red-500 focus:border-red-500 w-32"
                                                    />
                                                    <button className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-xs font-bold transition-colors">
                                                        Rechazar
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Manual Lead Registration */}
            {canEdit && (
            <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Registrar Nuevo Lead (Manual)</h2>
                <form action={async (formData) => {
                    'use server'
                    await createLead(formData)
                }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto de Interés</label>
                        <select name="project" className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-900 bg-white">
                            <option value="">Seleccionar Proyecto...</option>
                            {lotes.map(lote => (
                                <option key={lote.id} value={lote.title.rendered}>{lote.title.rendered}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Código de Referido</label>
                        <input name="referralCode" required className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm bg-white text-gray-900" placeholder="Código (del WhatsApp)" />
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                        <button className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium text-sm transition-colors">
                            Registrar Lead
                        </button>
                    </div>
                </form>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Registrar Nuevo Partner</h2>
                <form action={async (formData) => {
                    'use server'
                    await createPartner(formData)
                }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
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
                         <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                         <input name="password" type="password" required className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-900 bg-white" placeholder="******" />
                    </div>
                    <div className="md:col-span-4 flex justify-end">
                        <button className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 font-medium text-sm transition-colors">
                            Crear Partner
                        </button>
                    </div>
                </form>
            </div>
            </>
            )}

            {/* Leads Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-gray-900">Gestión de Leads</h2>
                        <ExportButton data={leads} />
                    </div>
                </div>
                
                <AdminFilters partners={referrers} projects={lotes} />
                
                {leads.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        Aún no hay leads registrados.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referidor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validación</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leads.map(lead => (
                                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                                            <div className="text-sm text-gray-500">{lead.phone}</div>
                                            <div className="text-xs text-gray-400">{lead.projectInterest}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{lead.referrer.name}</div>
                                            <div className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded w-fit text-gray-600">
                                                {lead.referrer.referralCode}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <form action={async () => {
                                                'use server'
                                                await toggleLeadValidity(lead.id)
                                            }}>
                                                <button className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${lead.isValid ? 'bg-green-600' : 'bg-gray-200'}`} role="switch" aria-checked={lead.isValid}>
                                                    <span className="sr-only">Validar lead</span>
                                                    <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${lead.isValid ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                                <div className="text-xs mt-1 text-gray-500">{lead.isValid ? 'Validado' : 'Pendiente'}</div>
                                            </form>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={lead.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {lead.commission ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        ${Number(lead.commission.amount).toLocaleString()}
                                                    </span>
                                                    <form action={async (formData) => {
                                                        'use server'
                                                        await updateCommissionStatus(lead.commission!.id, formData.get('status') as string)
                                                    }}>
                                                        <select 
                                                            name="status" 
                                                            className="text-xs border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-1 pl-2 pr-6"
                                                            defaultValue={lead.commission.status}
                                                            onChange={(e) => e.target.form?.requestSubmit()}
                                                        >
                                                            <option value="PENDING">Pendiente</option>
                                                            <option value="RELEASED">Liberada</option>
                                                            <option value="PAID">Pagada</option>
                                                        </select>
                                                    </form>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex flex-col gap-2">
                                                <ContactButton leadId={lead.id} phone={lead.phone} currentStatus={lead.status} />
                                                
                                                <form action={async (formData) => {
                                                    'use server'
                                                    await updateLeadStatus(lead.id, formData.get('status') as string)
                                                }} className="flex items-center gap-2">
                                                    <select 
                                                        name="status" 
                                                        className="block w-full text-xs border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                        defaultValue={lead.status}
                                                    >
                                                        <option value="Registrado">Registrado</option>
                                                        <option value="Contactado">Contactado</option>
                                                        <option value="Interesado">Interesado</option>
                                                        <option value="En negociación">En negociación</option>
                                                        <option value="Cuota inicial">Cuota inicial</option>
                                                        <option value="Pagado">Pagado</option>
                                                    </select>
                                                    <button className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded-md text-xs font-bold transition-colors">
                                                        💾
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Discounts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Descuentos Activos</h2>
                    <div className="space-y-4">
                        {discounts.length === 0 ? (
                            <p className="text-gray-500 text-sm">No hay descuentos configurados.</p>
                        ) : (
                            discounts.map(discount => (
                                <div key={discount.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900">{discount.commerceName}</h3>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${discount.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {discount.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{discount.benefit} • <span className="font-mono text-xs bg-gray-200 px-1 rounded">{discount.code || 'SIN CODIGO'}</span></p>
                                    </div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                                        {discount.category}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Create Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Nuevo Descuento</h2>
                    <form action={async (formData) => {
                        'use server'
                        await createDiscount(formData)
                    }} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Comercio</label>
                            <input name="commerceName" required className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-900 bg-white" placeholder="Ej: Restaurante X" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <select name="category" className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-900 bg-white">
                                <option value="GASTRONOMIA">Gastronomía</option>
                                <option value="HOGAR">Hogar</option>
                                <option value="SALUD">Salud</option>
                                <option value="OTROS">Otros</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Beneficio</label>
                            <input name="benefit" required className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-900 bg-white" placeholder="Ej: 20% off" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Código (Opcional)</label>
                            <input name="code" className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-900 bg-white" placeholder="Ej: GOODS20" />
                        </div>
                        <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium text-sm transition-colors">
                            Crear Descuento
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
  )
}

function KpiCard({ title, value, color = 'gray' }: { title: string, value: number, color?: string }) {
    const colors: Record<string, string> = {
        gray: 'bg-gray-50 text-gray-900',
        blue: 'bg-blue-50 text-blue-900',
        green: 'bg-green-50 text-green-900',
        yellow: 'bg-yellow-50 text-yellow-900',
        purple: 'bg-purple-50 text-purple-900',
    }
    
    return (
        <div className={`p-4 rounded-xl border border-transparent ${colors[color]} shadow-sm`}>
            <h3 className="text-xs font-medium uppercase tracking-wider opacity-70">{title}</h3>
            <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
    )
}