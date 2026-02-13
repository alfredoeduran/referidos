'use client'

import { useState } from 'react'
import { User } from '@prisma/client'
import { ChevronLeft, ChevronRight, Search, Info, Lock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { updatePartnerStatus } from '@/app/actions'
import { useRouter } from 'next/navigation'

type PartnerWithCount = User & {
  _count: {
    leads: number
  }
}

export default function PartnersTable({ initialPartners }: { initialPartners: PartnerWithCount[] }) {
  const [filter, setFilter] = useState('')
  const [partners, setPartners] = useState(initialPartners)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<PartnerWithCount | null>(null)
  const [blockingReason, setBlockingReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()

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
    </div>
  )
}
