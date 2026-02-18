'use client'

import { useEffect, useState } from 'react'
import { Lead, User } from '@prisma/client'
import { ChevronLeft, ChevronRight, Search, Edit2, X, Save, Plus, Filter, Phone, User as UserIcon, Building, Check, AlertCircle } from 'lucide-react'
import { updateLeadStatus, toggleLeadValidity, createLead } from '@/app/actions'
import { useRouter } from 'next/navigation'
import StatusBadge from './StatusBadge'

type LeadWithReferrer = Lead & {
  referrer: User
}

const STATUS_OPTIONS = [
  'Registrado',
  'Contactado',
  'Interesado',
  'En negociación',
  'Separado',
  'Cuota inicial',
  'Pagado'
]

const PROJECTS = [
  {
    name: 'Baru Beach Condominio',
    image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Baru+Beach'
  },
  {
    name: 'Coveñas Beach Club',
    image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Coveñas+Beach'
  },
  {
    name: 'Palma de Mallorca Condominio',
    image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Palma+de+Mallorca'
  }
]

export default function LeadsTable({ initialLeads }: { initialLeads: LeadWithReferrer[] }) {
  const [filter, setFilter] = useState('')
  const [leads, setLeads] = useState(initialLeads)
  
  // Edit Status Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<LeadWithReferrer | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [loteValue, setLoteValue] = useState('')
  
  // Register Lead Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    city: '',
    phone: '',
    referralCode: '',
    project: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    try {
      const storedReferral = window.localStorage.getItem('referralCode') || ''
      if (storedReferral) {
        setRegisterForm(prev => ({ ...prev, referralCode: storedReferral }))
      }
    } catch (e) {
    }
  }, [])

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(filter.toLowerCase()) || 
    lead.email.toLowerCase().includes(filter.toLowerCase())
  )

  const openStatusModal = (lead: LeadWithReferrer) => {
    setSelectedLead(lead)
    setNewStatus(lead.status)
    setLoteValue(lead.loteValue ? lead.loteValue.toString() : '')
    setIsModalOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedLead) return

    setIsLoading(true)
    try {
      await updateLeadStatus(
        selectedLead.id, 
        newStatus, 
        newStatus === 'Separado' ? Number(loteValue) : undefined
      )
      
      setLeads(prev => prev.map(l => 
        l.id === selectedLead.id 
          ? { ...l, status: newStatus, loteValue: newStatus === 'Separado' ? Number(loteValue) : l.loteValue } as any 
          : l
      ))
      
      router.refresh()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error al actualizar el estado')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleValidity = async (lead: LeadWithReferrer) => {
    try {
      await toggleLeadValidity(lead.id)
      setLeads(prev => prev.map(l => 
        l.id === lead.id ? { ...l, isValid: !l.isValid } : l
      ))
      router.refresh()
    } catch (error) {
      console.error('Error toggling validity:', error)
      alert('Error al cambiar validación')
    }
  }

  const handleRegisterLead = async () => {
    if (!registerForm.name || !registerForm.email || !registerForm.project) {
      alert('Por favor complete los campos obligatorios')
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    Object.entries(registerForm).forEach(([key, value]) => {
      formData.append(key, value)
    })

    try {
      const result = await createLead(formData)
      if (result?.error) {
        alert(result.error)
      } else {
        setIsRegisterModalOpen(false)
        setRegisterForm({
          name: '',
          email: '',
          city: '',
          phone: '',
          referralCode: '',
          project: ''
        })
        router.refresh()
        // Ideally fetch new leads or wait for refresh
        window.location.reload() // Force reload to get new lead
      }
    } catch (error) {
      console.error(error)
      alert('Error al registrar lead')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Search Bar */}
        <div className="relative max-w-md w-full">
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

        <button 
          onClick={() => setIsRegisterModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-sm"
        >
          Registrar Lead
          <Filter size={18} />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 font-bold text-xs text-gray-500 uppercase tracking-wider">#</th>
                <th className="py-4 px-6 font-bold text-xs text-gray-500 uppercase tracking-wider">Lead</th>
                <th className="py-4 px-6 font-bold text-xs text-gray-500 uppercase tracking-wider">Partner</th>
                <th className="py-4 px-6 font-bold text-xs text-gray-500 uppercase tracking-wider">Proyecto</th>
                <th className="py-4 px-6 font-bold text-xs text-gray-500 uppercase tracking-wider">Validación</th>
                <th className="py-4 px-6 font-bold text-xs text-gray-500 uppercase tracking-wider">Acciones</th>
                <th className="py-4 px-6 font-bold text-xs text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead, index) => (
                  <tr key={lead.id} className="group hover:bg-gray-50/30 transition-colors">
                    <td className="py-5 px-6 text-sm font-bold text-gray-900">{index + 1}</td>
                    
                    {/* Lead Info */}
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">{lead.name}</span>
                        <span className="text-xs text-gray-500 font-medium">{lead.phone}</span>
                      </div>
                    </td>

                    {/* Partner Info */}
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">{lead.referrer.name}</span>
                        <span className="text-xs text-gray-500 font-medium uppercase">{lead.referrer.referralCode}</span>
                      </div>
                    </td>

                    {/* Project */}
                    <td className="py-5 px-6">
                      <span className="text-sm font-medium text-gray-600">
                        {lead.projectInterest || 'No especificado'}
                      </span>
                    </td>

                    {/* Validation Toggle */}
                    <td className="py-5 px-6">
                      <button 
                        onClick={() => handleToggleValidity(lead)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          lead.isValid ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`${
                            lead.isValid ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                        <span className={`ml-2 text-xs font-medium ${lead.isValid ? 'text-white' : 'text-gray-500'} absolute left-12 whitespace-nowrap`}>
                          {lead.isValid ? 'Validado' : 'No validado'}
                        </span>
                      </button>
                    </td>

                    {/* Actions (Update Button + Status Dropdown logic in Modal) */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2">
                         {/* We show current status in a disabled-like dropdown look or just a button that opens the modal */}
                         <div className="relative">
                            <button
                              onClick={() => openStatusModal(lead)}
                              className="flex items-center justify-between w-40 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
                            >
                              <span>{lead.status}</span>
                              <ChevronRight size={14} className="rotate-90 text-gray-400" />
                            </button>
                         </div>
                      </div>
                    </td>

                    {/* Status Badge & Update Button */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <StatusBadge status={lead.status} />
                        <button
                          onClick={() => openStatusModal(lead)}
                          className="px-4 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full hover:bg-orange-600 transition-colors shadow-sm"
                        >
                          Actualizar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-gray-50 rounded-full">
                        <Search className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium">No se encontraron leads</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-gray-400 font-medium">
          Mostrando {filteredLeads.length} de {initialLeads.length} resultados
        </p>
        <div className="flex gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-100 text-gray-400 hover:bg-white hover:shadow-sm transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-100 text-gray-400 hover:bg-white hover:shadow-sm transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Update Status Modal */}
      {isModalOpen && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Actualizar Estado</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Estado Actual
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-600 font-medium">
                  {selectedLead.status}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Nuevo Estado
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none"
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {newStatus === 'Separado' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Valor del Lote ($)
                  </label>
                  <input
                    type="number"
                    value={loteValue}
                    onChange={(e) => setLoteValue(e.target.value)}
                    placeholder="Ingrese el valor total del lote"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    Se calculará automáticamente la comisión del 1.5%
                  </p>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={isLoading || (newStatus === 'Separado' && !loteValue)}
                  className="flex-1 px-4 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Guardando...' : (
                    <>
                      <Save size={18} />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Lead Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-full text-orange-500">
                  <Plus size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Registrar Nuevo Lead (Manual)</h3>
              </div>
              <button onClick={() => setIsRegisterModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-300"
                    value={registerForm.name}
                    onChange={e => setRegisterForm({...registerForm, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-300"
                    value={registerForm.email}
                    onChange={e => setRegisterForm({...registerForm, email: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    placeholder="Ciudad"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-300"
                    value={registerForm.city}
                    onChange={e => setRegisterForm({...registerForm, city: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="text"
                      placeholder="Teléfono"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-300"
                      value={registerForm.phone}
                      onChange={e => setRegisterForm({...registerForm, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Código de Referido</label>
                    <input
                      type="text"
                      placeholder="Código (del whatsApp)"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-300"
                      value={registerForm.referralCode}
                      onChange={e => setRegisterForm({...registerForm, referralCode: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Project Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Proyecto de Interés</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {PROJECTS.map((project) => (
                    <div 
                      key={project.name}
                      onClick={() => setRegisterForm({...registerForm, project: project.name})}
                      className={`cursor-pointer group relative rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                        registerForm.project === project.name 
                          ? 'border-orange-500 ring-4 ring-orange-500/10' 
                          : 'border-transparent hover:border-gray-200'
                      }`}
                    >
                      <div className="aspect-[4/3] bg-gray-100 relative">
                        {/* Placeholder Image */}
                        <img 
                          src={project.image} 
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Selection Indicator */}
                        <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-colors ${
                          registerForm.project === project.name
                            ? 'bg-orange-500 border-orange-500'
                            : 'bg-white border-gray-300'
                        }`} />
                      </div>
                      <div className="p-3 bg-gray-50 text-center">
                        <p className="text-xs font-bold text-gray-700">{project.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button 
                onClick={handleRegisterLead}
                disabled={isLoading}
                className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Registrando...' : 'Registrar Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
