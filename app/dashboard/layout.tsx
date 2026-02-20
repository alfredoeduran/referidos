import PartnerSidebar from '../components/PartnerSidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8F9FA] font-sans pb-24 lg:pb-0">
      <PartnerSidebar />
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
