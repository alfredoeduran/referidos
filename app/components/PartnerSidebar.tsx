'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, FileText, Wallet2, LogOut } from 'lucide-react'
import { logout } from '../actions'

const menuItems = [
  { name: 'Inicio', icon: Home, href: '/dashboard' },
  { name: 'Referidos', icon: Users, href: '/dashboard/referidos' },
  { name: 'Documentación', icon: FileText, href: '/dashboard/documentacion' },
  { name: 'Fondos', icon: Wallet2, href: '/dashboard/fondos' },
]

export default function PartnerSidebar() {
  const pathname = usePathname()

  return (
    <>
      <aside className="hidden lg:flex w-64 bg-[#2D2D2D] text-white flex-col h-screen sticky top-0 rounded-r-3xl my-4 ml-4 overflow-hidden">
        <div className="p-8 mb-4">
          <Link href="/dashboard" className="flex flex-col items-center">
            <img
              src="https://goodsco.com.co/wp-content/uploads/elementor/thumbs/logo-rhve9fe880lsryba0aexm0awj2nb61s6ec3w0mx2d8.png"
              alt="Goods Logo"
              className="h-16 w-auto brightness-0 invert"
            />
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-white/10 text-[#F97316] border-l-4 border-[#F97316]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-[#F97316]' : 'group-hover:text-white'}`} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-6">
          <form action={logout}>
            <button className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center justify-center gap-2 py-3 rounded-2xl transition-all font-bold text-sm">
              <span>Cerrar sesion</span>
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="bg-[#2D2D2D]/95 backdrop-blur-md text-white rounded-3xl shadow-2xl border border-white/10 p-2 flex items-center justify-around">
          {menuItems.map((item) => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-2xl transition-all duration-300 min-w-[50px] ${
                  isActive ? 'text-[#F97316] bg-white/5 px-4' : 'text-gray-400'
                }`}
              >
                <item.icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </Link>
            )
          })}

          <form action={logout}>
            <button className="flex flex-col items-center justify-center gap-1 p-2 text-gray-400 min-w-[50px]">
              <LogOut className="w-6 h-6" />
            </button>
          </form>
        </div>
      </nav>
    </>
  )
}
