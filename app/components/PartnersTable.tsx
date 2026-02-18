'use client'

import { useEffect, useState } from 'react'
import { Document, User } from '@prisma/client'
import { ChevronLeft, ChevronRight, Search, Info, Lock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { updatePartnerStatus, approveDocument, rejectDocument } from '@/app/actions'
import { useRouter } from 'next/navigation'

type PartnerWithCount = User & {
  _count: {
    leads: number
  },
  documents: Document[]
}

const REQUIRED_DOC_TYPES = ['ID_CARD_FRONT', 'ID_CARD_BACK', 'RUT', 'BANK_CERT']

const DOCUMENT_LABELS: Record<string, string> = {
  ID_CARD_FRONT: 'Cédula (Frontal)',
  ID_CARD_BACK: 'Cédula (Trasera)',
  RUT: 'RUT',
  BANK_CERT: 'Certificación Bancaria'
}

const getDocumentStatusStyles = (status: string) => {
  if (status === 'APPROVED') return 'bg-green-50 text-green-700'
  if (status === 'REJECTED') return 'bg-red-50 text-red-700'
  return 'bg-yellow-50 text-yellow-700'
}

export default function PartnersTable({ initialPartners, role }: { initialPartners: PartnerWithCount[]; role: string }) {
  const [filter, setFilter] = useState('')
  const [partners, setPartners] = useState(initialPartners)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<PartnerWithCount | null>(null)
  const [blockingReason, setBlockingReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [docsModalPartner, setDocsModalPartner] = useState<PartnerWithCount | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    setPartners(initialPartners)
  }, [initialPartners])

  const filteredPartners = partners.filter(partner => 
    partner.name.toLowerCase().includes(filter.toLowerCase()) || 
    partner.email.toLowerCase().includes(filter.toLowerCase())
  )

  const handleStatusChange = async (partner: PartnerWithCount, newStatus: string) => {
    if (newStatus === 'INACTIVE') {
      setSelectedPartner(partner)
      setBlockingReason(partner.blockingReason || '')
      setIsModalOpen(true)
    } else {
      // Activating
      await updateStatus(partner.id, 'ACTIVE')
    }
  }

  const updateStatus = async (partnerId: string, status: string, reason?: string) => {
    setIsLoading(true)
    try {
      const result = await updatePartnerStatus(partnerId, status, reason)
      if (result.success) {
        setPartners(prev => prev.map(p => 
          p.id === partnerId 
            ? { ...p, status, blockingReason: reason || null } 
            : p
        ))
        router.refresh()
      } else {
        alert('Error al actualizar estado')
      }
    } catch (error) {
      console.error(error)
      alert('Ocurrió un error inesperado')
    } finally {
      setIsLoading(false)
      setIsModalOpen(false)
      setSelectedPartner(null)
      setBlockingReason('')
    }
  }

  const confirmBlock = async () => {
    if (!selectedPartner || !blockingReason.trim()) {
      alert('Por favor ingrese un motivo')
      return
    }
    await updateStatus(selectedPartner.id, 'INACTIVE', blockingReason)
  }

  const getDocumentSummary = (partner: PartnerWithCount) => {
    const required = REQUIRED_DOC_TYPES
    const docsByType = new Map<string, Document>()
    partner.documents.forEach(d => {
      if (!docsByType.has(d.type) || d.createdAt > docsByType.get(d.type)!.createdAt) {
        docsByType.set(d.type, d)
      }
    })
    const approved = required.filter(t => docsByType.get(t)?.status === 'APPROVED').length
    const rejected = required.filter(t => docsByType.get(t)?.status === 'REJECTED').length
    return { total: required.length, approved, rejected }
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
          placeholder="Buscar por nombre o correo..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-50">
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4">#</th>
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4">Usuario</th>
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4">Contacto</th>
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4">Código</th>
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4">Leads</th>
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4">Teléfono</th>
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4">Estado</th>
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4">Docs</th>
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4 text-right">Fecha de registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredPartners.length > 0 ? (
              filteredPartners.map((partner, index) => (
                <tr key={partner.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-4 text-sm font-bold text-[#2D2D2D]">{index + 1}</td>
                  <td className="py-5 px-4 text-sm font-bold text-[#2D2D2D]">{partner.name}</td>
                  <td className="py-5 px-4 text-sm text-gray-500 font-medium">{partner.email}</td>
                  <td className="py-5 px-4 text-sm text-gray-500 font-bold uppercase tracking-tight">{partner.referralCode || 'N/A'}</td>
                  <td className="py-5 px-4 text-sm text-gray-500 font-bold">{partner._count.leads}</td>
                  <td className="py-5 px-4 text-sm text-gray-500 font-medium">{partner.phone || 'Sin teléfono'}</td>
                  <td className="py-5 px-4 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleStatusChange(partner, partner.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                        className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                          partner.status === 'ACTIVE' 
                            ? 'bg-[#E6F6F4] text-[#00A189] hover:bg-[#d0f0eb]' 
                            : 'bg-red-50 text-red-500 hover:bg-red-100'
                        }`}
                      >
                        {partner.status === 'ACTIVE' ? (
                          <>
                            <CheckCircle size={12} /> Activo
                          </>
                        ) : (
                          <>
                            <XCircle size={12} /> Inactivo
                          </>
                        )}
                      </button>
                      
                      {partner.status === 'INACTIVE' && partner.blockingReason && (
                        <div className="group/tooltip relative">
                          <Info size={16} className="text-gray-400 hover:text-gray-600 cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                            <div className="font-bold mb-1">Motivo de bloqueo:</div>
                            {partner.blockingReason}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-800"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-5 px-4 text-sm text-gray-500 font-medium align-top">
                    {(() => {
                      const summary = getDocumentSummary(partner)
                      return (
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-1 text-xs font-medium">
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              {summary.approved}/{summary.total} aprobados
                            </span>
                            {summary.rejected > 0 && (
                              <span className="inline-flex items-center gap-1 text-red-500">
                                <AlertTriangle size={12} /> {summary.rejected} rechazados
                              </span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => setDocsModalPartner(partner)}
                            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline"
                          >
                            Gestionar
                          </button>
                        </div>
                      )
                    })()}
                  </td>
                  <td className="py-5 px-4 text-sm text-gray-500 font-medium text-right">
                    {new Date(partner.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-500">
                  No se encontraron partners.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="mt-12 flex items-center justify-between">
        <p className="text-sm text-gray-400 font-medium">
          Mostrando {filteredPartners.length} de {initialPartners.length} resultados
        </p>
        <div className="flex gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-100 text-gray-400 hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-100 text-gray-400 hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Blocking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <div className="p-2 bg-red-50 rounded-full">
                <Lock size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Bloquear Acceso</h3>
            </div>
            
            <p className="text-gray-500 text-sm mb-4">
              Estás a punto de desactivar la cuenta de <span className="font-bold text-gray-700">{selectedPartner?.name}</span>. 
              Esto impedirá que acceda a la plataforma. Por favor indica el motivo:
            </p>
            
            <textarea
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm min-h-[100px] mb-6"
              placeholder="Ej: Violación de términos y condiciones..."
              value={blockingReason}
              onChange={(e) => setBlockingReason(e.target.value)}
            />
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmBlock}
                disabled={isLoading || !blockingReason.trim()}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? 'Procesando...' : 'Confirmar Bloqueo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Management Modal */}
      {docsModalPartner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Gestión de documentación</h3>
                <p className="text-sm text-gray-500">
                  Partner: <span className="font-semibold text-gray-700">{docsModalPartner.name}</span> ({docsModalPartner.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDocsModalPartner(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-medium"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-3 space-y-4">
              {(() => {
                const docsByType = new Map<string, Document>()
                docsModalPartner.documents.forEach(d => {
                  if (!docsByType.has(d.type) || d.createdAt > docsByType.get(d.type)!.createdAt) {
                    docsByType.set(d.type, d)
                  }
                })

                return REQUIRED_DOC_TYPES.map(type => {
                  const doc = docsByType.get(type)
                  const label = DOCUMENT_LABELS[type] || type
                  return (
                    <div key={type} className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-800">{label}</p>
                        {doc ? (
                          <>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className={`px-2 py-0.5 rounded-full font-medium ${getDocumentStatusStyles(doc.status)}`}>
                                {doc.status === 'PENDING'
                                  ? 'Pendiente'
                                  : doc.status === 'APPROVED'
                                  ? 'Aprobado'
                                  : 'Rechazado'}
                              </span>
                              {doc.feedback && (
                                <span className="text-[11px] text-red-500">Motivo rechazo: {doc.feedback}</span>
                              )}
                            </div>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-indigo-600 hover:text-indigo-800"
                            >
                              Ver documento
                            </a>
                            <p className="text-[11px] text-gray-400">
                              Subido el{' '}
                              {new Date(doc.createdAt).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">Sin documento cargado</span>
                        )}
                      </div>

                      {['ADMIN', 'SUPERADMIN'].includes(role) && doc && (
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <form action={approveDocument}>
                            <input type="hidden" name="docId" value={doc.id} />
                            <button className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded text-[11px] font-bold">
                              Aprobar
                            </button>
                          </form>
                          <form action={rejectDocument} className="flex items-center gap-2">
                            <input type="hidden" name="docId" value={doc.id} />
                            <input
                              name="reason"
                              required
                              placeholder="Motivo..."
                              className="text-[11px] border border-gray-200 rounded px-2 py-1 w-40"
                            />
                            <button className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-[11px] font-bold">
                              Rechazar
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  )
                })
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
