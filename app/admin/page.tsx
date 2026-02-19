import prisma from '@/lib/prisma'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { 
  logout, 
  toggleLeadValidity, 
  toggleUserStatus, 
} from '../actions'
import { getLotes } from '@/lib/wordpress'
import AdminSidebar from '../components/AdminSidebar'
import { 
  Filter, 
  Users, 
  Handshake, 
  Percent, 
  Wallet, 
  ChevronRight,
  User as UserIcon,
  Search
} from 'lucide-react'

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const cookieStore = await cookies()
  const role = cookieStore.get('role')?.value
  
  if (!['ADMIN', 'SUPERADMIN', 'MANAGER'].includes(role || '')) {
    redirect('/login')
  }

  const filters = await searchParams

  const whereClause: any = {}
  if (filters?.partnerId) whereClause.referrerId = filters.partnerId as string
  if (filters?.status) whereClause.status = filters.status as string
  
  const lotes = await getLotes()

  const leads = await prisma.lead.findMany({
      where: whereClause,
      include: { referrer: true, commission: true },
      orderBy: { createdAt: 'desc' }
  })

  const referrers = await prisma.user.findMany({
    where: { role: 'REFERRER' },
    include: { 
        _count: { select: { leads: true } },
        commissions: true,
        leads: true
    },
    orderBy: { createdAt: 'desc' }
  })
  
  const discounts = await prisma.discount.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const totalLeads = leads.length
  const totalPartners = referrers.length

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const activePartners = referrers.filter(r => 
    r.leads.some(l => l.createdAt >= startOfMonth && l.createdAt <= endOfMonth)
  ).length
  const activeLeads = leads.filter(l => ['Contactado', 'Interesado', 'En negociación', 'Separado', 'Cuota inicial'].includes(l.status)).length
  const separations = leads.filter(l => l.status === 'Separado').length
  const conversionRate = totalLeads > 0 ? Math.round((separations / totalLeads) * 100) : 0

  // Financials
  const pendingAmount = leads
    .filter(l => l.commission?.status === 'PENDING' || l.commission?.status === 'RELEASED')
    .reduce((acc, l) => acc + Number(l.commission?.amount || 0), 0)

  const paidAmount = leads
    .filter(l => l.commission?.status === 'PAID')
    .reduce((acc, l) => acc + Number(l.commission?.amount || 0), 0)
  return (
    <div className="grid grid-cols-12 gap-6">
        {/* Left/Middle Column (KPIs + Partners) */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <StatCard icon={Filter} label="Total Leads" value={totalLeads} />
                        <StatCard icon={Users} label="Partners Registrados" value={totalPartners} />
                        <StatCard icon={Handshake} label="Partners Activos" value={activePartners} />
                        <StatCard icon={Percent} label="Tasa Conversión (%)" value={conversionRate} />
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 md:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <h2 className="text-xl font-bold text-[#2D2D2D]">Partners Registrados</h2>
                            <Link
                              href="/admin/partners"
                              className="w-full sm:w-auto bg-[#F97316] hover:bg-[#EA580C] text-white px-6 py-2 rounded-full flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-lg shadow-orange-200"
                            >
                                <span>Ver todos los partners</span>
                                <Filter className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {referrers.map(user => (
                                <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-gray-50 hover:border-orange-100 hover:bg-orange-50/30 transition-all group gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-[#F97316] shrink-0">
                                            <UserIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#2D2D2D] capitalize break-all">{user.name.toLowerCase()}</h3>
                                            <p className="text-xs text-gray-400">Registrado: {user.createdAt.toLocaleDateString('es-ES')}</p>
                                        </div>
                                    </div>
                                    <div className="font-mono text-sm font-bold text-gray-600 tracking-widest bg-gray-50 px-3 py-1 rounded-lg sm:bg-transparent sm:p-0">
                                        {user.referralCode}
                                    </div>

                                    <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            user.status === 'ACTIVE'
                                              ? 'bg-green-100 text-green-700'
                                              : user.status === 'PENDING'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {user.status === 'ACTIVE' ? 'Activo' : user.status === 'PENDING' ? 'Pendiente' : 'Inactivo'}
                                        </span>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#F97316] transition-colors" />
                                    </div>
                                </div>
                            ))}
                       </div>
                    </div>
                </div>
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <FinancialCard 
            icon={Wallet} 
            label="Comisiones Pendientes" 
            value={pendingAmount} 
          />
          <FinancialCard 
            icon={Wallet} 
            label="Comisiones Pagadas" 
            value={paidAmount} 
          />
        </div>
            </div>
    )
}

function StatCard({ icon: Icon, label, value }: { icon: any, label: string, value: number }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F97316] mb-4">
            <Icon className="w-6 h-6" />
        </div>
        <p className="text-3xl font-bold text-[#2D2D2D] mb-1">{value}</p>
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{label}</p>
    </div>
  )
}

function FinancialCard({ icon: Icon, label, value }: { icon: any, label: string, value: number }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#F97316] mb-4">
            <Icon className="w-5 h-5" />
        </div>
        <p className="text-2xl font-bold text-[#2D2D2D] mb-1">$ {value.toLocaleString('es-ES')}</p>
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{label}</p>
    </div>
  )
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return null
}
