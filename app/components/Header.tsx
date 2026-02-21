import Link from 'next/link'
import { cookies } from 'next/headers'

export default async function Header({
  variant = 'default',
  showLogo = true
}: {
  variant?: 'default' | 'onImage'
  showLogo?: boolean
}) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  const isOnImage = variant === 'onImage'
  return (
    <header className={isOnImage ? 'absolute inset-x-0 top-0 z-50 text-white' : 'bg-white/90 backdrop-blur sticky top-0 z-50'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {showLogo && (
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-3 group">
                <img
                  src="https://goodsco.com.co/wp-content/uploads/elementor/thumbs/logo-rhve9fe880lsryba0aexm0awj2nb61s6ec3w0mx2d8.png"
                  alt="Goods & Co Logo"
                  className="h-16 w-auto transition-transform group-hover:scale-105"
                />
              </Link>
            </div>
          )}
          <nav className="flex items-center gap-3">
            <Link
              href="/lotes"
              className="inline-flex items-center justify-center rounded-full bg-[#F47C20] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#d86816] transition-all"
            >
              Proyectos
            </Link>
            {userId ? (
              <Link
                href="/dashboard"
                className={`inline-flex items-center justify-center rounded-full border px-5 py-2 text-sm font-semibold transition-all ${isOnImage ? 'border-white/40 bg-white/10 text-white hover:bg-white/20' : 'border-[#F47C20] bg-white text-[#F47C20] hover:bg-[#FFF3EB]'}`}
              >
                Mi cuenta
              </Link>
            ) : (
              <Link
                href="/login"
                className={`inline-flex items-center justify-center rounded-full border px-5 py-2 text-sm font-semibold transition-all ${isOnImage ? 'border-white/40 bg-white/10 text-white hover:bg-white/20' : 'border-[#F47C20] bg-white text-[#F47C20] hover:bg-[#FFF3EB]'}`}
              >
                Soy partner
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
