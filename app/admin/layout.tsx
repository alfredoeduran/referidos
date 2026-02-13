import AdminSidebar from '../components/AdminSidebar'
import { Filter } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8F9FA] font-sans pb-24 lg:pb-0">
      {/* Sidebar/Navigation */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#2D2D2D]">Panel de Administración</h1>
            <p className="text-gray-500 text-sm">Gestión centralizada de referidos y comisiones</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-full shadow-sm border border-gray-100 w-full md:w-auto">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=Admin&background=DBEAFE&color=1E40AF" alt="Admin" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#2D2D2D]">Admin</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Administrador</p>
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  )
}
