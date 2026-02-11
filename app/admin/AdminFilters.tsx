'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function AdminFilters({ partners, projects }: { partners: any[], projects: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState({
    partnerId: searchParams.get('partnerId') || '',
    status: searchParams.get('status') || '',
    project: searchParams.get('project') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (filters.partnerId) params.set('partnerId', filters.partnerId)
    if (filters.status) params.set('status', filters.status)
    if (filters.project) params.set('project', filters.project)
    if (filters.startDate) params.set('startDate', filters.startDate)
    if (filters.endDate) params.set('endDate', filters.endDate)
    
    router.push(`/admin?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({ partnerId: '', status: '', project: '', startDate: '', endDate: '' })
    router.push('/admin')
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select name="partnerId" value={filters.partnerId} onChange={handleChange} className="rounded-md border-gray-300 text-sm">
                <option value="">Todos los Partners</option>
                {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select name="status" value={filters.status} onChange={handleChange} className="rounded-md border-gray-300 text-sm">
                <option value="">Todos los Estados</option>
                <option value="REGISTERED">Registrado</option>
                <option value="CONTACTED">Contactado</option>
                <option value="INTERESTED">Interesado</option>
                <option value="NEGOTIATION">En negociación</option>
                <option value="DOWN_PAYMENT">Cuota inicial</option>
                <option value="PAID">Pagado</option>
            </select>
            <select name="project" value={filters.project} onChange={handleChange} className="rounded-md border-gray-300 text-sm">
                <option value="">Todos los Proyectos</option>
                {projects.map((p: any) => <option key={p.id} value={p.title.rendered}>{p.title.rendered}</option>)}
            </select>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleChange} className="rounded-md border-gray-300 text-sm" placeholder="Desde" />
            <input type="date" name="endDate" value={filters.endDate} onChange={handleChange} className="rounded-md border-gray-300 text-sm" placeholder="Hasta" />
        </div>
        <div className="flex justify-end gap-2">
            <button onClick={clearFilters} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Limpiar</button>
            <button onClick={applyFilters} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700">Filtrar</button>
        </div>
    </div>
  )
}
