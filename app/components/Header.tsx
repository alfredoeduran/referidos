import Link from 'next/link'
import { cookies } from 'next/headers'

export default async function Header() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
                <img 
                    src="https://goodsco.com.co/wp-content/uploads/elementor/thumbs/logo-rhve9fe880lsryba0aexm0awj2nb61s6ec3w0mx2d8.png" 
                    alt="Goods & Co Logo" 
                    className="h-12 w-auto transition-transform group-hover:scale-105"
                />
            </Link>
          </div>
          <nav className="flex items-center gap-6">
             <Link href="/lotes" className="text-gray-600 hover:text-indigo-600 font-medium text-sm transition-colors">
                Proyectos
             </Link>
             {userId ? (
                 <Link 
                    href="/dashboard" 
                    className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
                 >
                    Mi Cuenta
                 </Link>
             ) : (
                 <Link 
                    href="/login" 
                    className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 transition-all"
                 >
                    Iniciar Sesión
                 </Link>
             )}
          </nav>
        </div>
      </div>
    </header>
  )
}
