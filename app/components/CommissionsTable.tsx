'use client'

import { useState } from 'react'
import { Commission, User, Lead } from '@prisma/client'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import StatusBadge from './StatusBadge'

type CommissionWithRelations = Commission & {
  referrer: User
  lead: Lead
}

export default function CommissionsTable({ initialCommissions }: { initialCommissions: CommissionWithRelations[] }) {
  const [filter, setFilter] = useState('')
  const [commissions, setCommissions] = useState(initialCommissions)
  
  const filteredCommissions = commissions.filter(commission => 
    commission.referrer.name.toLowerCase().includes(filter.toLowerCase()) || 
    commission.referrer.email.toLowerCase().includes(filter.toLowerCase()) ||
    commission.lead.name.toLowerCase().includes(filter.toLowerCase())
  )

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
          placeholder="Buscar por referidor, email o lead..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-50">
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4">#</th>
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4">Monto</th>
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4">Referidor</th>
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4">Lead Asociado</th>
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4">Estado</th>
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4 text-right">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredCommissions.length > 0 ? (
              filteredCommissions.map((commission, index) => (
                <tr key={commission.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-4 text-sm font-bold text-[#2D2D2D]">{index + 1}</td>
                  <td className="py-5 px-4 text-sm font-bold text-[#2D2D2D]">
                    ${Number(commission.amount).toLocaleString()}
                  </td>
                  <td className="py-5 px-4 text-sm text-gray-500 font-medium">
                    {commission.referrer.name}
                    <div className="text-xs text-gray-400">{commission.referrer.email}</div>
                  </td>
                  <td className="py-5 px-4 text-sm text-gray-500 font-medium">
                    {commission.lead.name}
                  </td>
                  <td className="py-5 px-4 px-4">
                    <StatusBadge status={commission.status} />
                  </td>
                  <td className="py-5 px-4 text-sm text-gray-500 font-medium text-right">
                    {new Date(commission.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-500">
                  No se encontraron comisiones.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="mt-12 flex items-center justify-between">
        <p className="text-sm text-gray-400 font-medium">
          Mostrando {filteredCommissions.length} de {initialCommissions.length} resultados
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
    </div>
  )
}
