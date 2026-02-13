'use client'

import { useState } from 'react'
import { Discount } from '@prisma/client'
import { ChevronLeft, ChevronRight, Search, Tag, CheckCircle, XCircle } from 'lucide-react'

export default function DiscountsTable({ initialDiscounts }: { initialDiscounts: Discount[] }) {
  const [filter, setFilter] = useState('')
  const [discounts, setDiscounts] = useState(initialDiscounts)
  
  const filteredDiscounts = discounts.filter(discount => 
    discount.commerceName.toLowerCase().includes(filter.toLowerCase()) || 
    discount.category.toLowerCase().includes(filter.toLowerCase()) ||
    (discount.code && discount.code.toLowerCase().includes(filter.toLowerCase()))
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
          placeholder="Buscar por comercio, categoría o código..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-50">
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4">#</th>
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4">Comercio</th>
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4">Categoría</th>
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4">Beneficio</th>
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4">Código</th>
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4">Estado</th>
              <th className="pb-4 font-bold text-xs text-[#2D2D2D] uppercase tracking-wider px-4 text-right">Creado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredDiscounts.length > 0 ? (
              filteredDiscounts.map((discount, index) => (
                <tr key={discount.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-4 text-sm font-bold text-[#2D2D2D]">{index + 1}</td>
                  <td className="py-5 px-4 text-sm font-bold text-[#2D2D2D] flex items-center gap-2">
                    <Tag size={16} className="text-indigo-500" />
                    {discount.commerceName}
                  </td>
                  <td className="py-5 px-4 text-sm text-gray-500 font-medium">{discount.category}</td>
                  <td className="py-5 px-4 text-sm text-gray-500 font-medium">{discount.benefit}</td>
                  <td className="py-5 px-4 text-sm font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit">
                    {discount.code || 'N/A'}
                  </td>
                  <td className="py-5 px-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      discount.isActive 
                        ? 'bg-[#E6F6F4] text-[#00A189]' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {discount.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {discount.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-sm text-gray-500 font-medium text-right">
                    {new Date(discount.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-500">
                  No se encontraron descuentos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="mt-12 flex items-center justify-between">
        <p className="text-sm text-gray-400 font-medium">
          Mostrando {filteredDiscounts.length} de {initialDiscounts.length} resultados
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
