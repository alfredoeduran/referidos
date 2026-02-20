import Link from 'next/link'
import Image from 'next/image'
import { getLotes } from '@/lib/wordpress'

export default async function Home() {
  const lotes = await getLotes()
  const featuredLote = lotes.length > 0 ? lotes[0] : null

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFFFF]">
      {/* Navbar */}
      <nav className="absolute z-20 inset-x-0 top-0 flex items-center justify-between p-6 lg:px-8 text-white" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Goods & Co</span>
            <img
                className="h-12 w-auto"
                src="https://goodsco.com.co/wp-content/uploads/elementor/thumbs/logo-rhve9fe880lsryba0aexm0awj2nb61s6ec3w0mx2d8.png"
                alt="Goods & Co"
            />
          </Link>
        </div>
        <div className="flex gap-x-3">
          <Link href="/lotes" className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:border-[#F47C20] hover:text-[#F47C20] transition-colors">Proyectos</Link>
          <Link href="/login" className="rounded-full bg-[#F47C20] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d86816] transition-colors">Soy partner</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative isolate overflow-hidden pt-14">
        <Image
          src="/uploads/heroreferal.png"
          alt="Hero background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl py-28 sm:py-44 lg:py-56 text-center">
            <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <Link href="/register" className="relative rounded-full px-5 py-2 text-sm font-semibold leading-6 text-white bg-[#F47C20] shadow hover:bg-[#d86816]">
                Registrarme
              </Link>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              INVIERTE EN TIERRA
              <br />
              <span className="text-[#F47C20]">GANA POR REFERIR</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/90">
              Accede a los mejores lotes campestres del país con planes de financiación exclusivos. Únete a nuestra red de partners y genera comisiones por cada venta referida.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-4">
              <Link
                href="/lotes"
                className="rounded-full bg-[#F47C20] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#d86816] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F47C20]"
              >
                Ver Lotes Disponibles
              </Link>
              <Link href="/register" className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold leading-6 text-white hover:text-[#F47C20] hover:border-[#F47C20]">
                Quiero ser Partner →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="bg-[#FFFFFF] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-[#2D948A]">Sistema de Partners</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-[#1D293F] sm:text-4xl">
              ¿Cómo funciona?
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Es simple. Te registras, obtienes tu enlace único y empiezas a compartir. Nosotros nos encargamos del resto.
            </p>
          </div>
          <div className="mx-auto mt-16 lg:mt-24 max-w-6xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 p-8">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F47C20] text-white font-bold">1</div>
                <h3 className="text-lg font-semibold text-[#1D293F]">Regístrate</h3>
                <p className="mt-2 text-base leading-7 text-gray-600">Crea tu cuenta y accede a tu panel de control personalizado.</p>
              </div>
              <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 p-8">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F47C20] text-white font-bold">2</div>
                <h3 className="text-lg font-semibold text-[#1D293F]">Comparte</h3>
                <p className="mt-2 text-base leading-7 text-gray-600">Comparte tu enlace o QR con inversores potenciales y registra sus leads.</p>
              </div>
              <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 p-8">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F47C20] text-white font-bold">3</div>
                <h3 className="text-lg font-semibold text-[#1D293F]">Gana</h3>
                <p className="mt-2 text-base leading-7 text-gray-600">Recibe comisiones cuando tus referidos concreten su inversión.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Lotes Preview */}
      {featuredLote && (
        <div className="bg-[#FFFFFF] py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mb-8 flex items-end justify-between">
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">Oportunidades</h2>
                      <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F47C20]">Proyectos destacados</p>
                    </div>
                    <Link href="/lotes" className="rounded-full bg-[#F47C20] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d86816]">Ver todos los proyectos</Link>
                </div>
                <div className="relative isolate overflow-hidden px-6 py-16 shadow-2xl sm:rounded-3xl sm:px-16 lg:px-24 border border-white/10">
                    <Image
                      src="/uploads/proyectosdestacados.png"
                      alt="Proyecto destacado"
                      fill
                      className="object-cover"
                      sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
                    <div className="relative mx-auto max-w-lg lg:mx-0 lg:py-20 text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        {featuredLote.title.rendered}
                        <br />
                        Inicia tu inversión hoy.
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-gray-200" dangerouslySetInnerHTML={{ __html: featuredLote.excerpt?.rendered || 'Excelente oportunidad de inversión.' }} />
                        <div className="mt-10 flex items-center gap-x-6">
                        <Link
                            href={`/lote/${featuredLote.slug}`}
                            className="rounded-full bg-[#F47C20] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#d86816] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F47C20]"
                        >
                            Ver Detalles
                        </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}
