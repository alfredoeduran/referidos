import Link from 'next/link'
import { getLotes } from '@/lib/wordpress'

export default async function Home() {
  const lotes = await getLotes()
  const featuredLote = lotes.length > 0 ? lotes[0] : null

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFFFF]">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 lg:px-8 border-b border-[#1D293F]/10 bg-[#1D293F] text-white" aria-label="Global">
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
        <div className="flex gap-x-12">
          <Link href="/lotes" className="text-sm font-semibold leading-6 text-white hover:text-[#F47C20] transition-colors">Proyectos</Link>
          <Link href="/login" className="text-sm font-semibold leading-6 text-white hover:text-[#F47C20] transition-colors">Soy Partner</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-[#1D293F] via-[#2D948A] to-[#FFFFFF] pt-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
            <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-[#1D293F] bg-white/80 ring-1 ring-white/40">
                ¡Nuevo sistema de referidos activo! <Link href="/register" className="font-semibold text-[#2D948A]"><span className="absolute inset-0" aria-hidden="true" />Registrarme <span aria-hidden="true">&rarr;</span></Link>
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Invierte en Tierra, <br/>
              <span className="text-[#F47C20]">Gana por Referir</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-100">
              Accede a los mejores lotes campestres del país con planes de financiación exclusivos. 
              Únete a nuestra red de partners y genera comisiones por cada venta referida.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/lotes"
                className="rounded-md bg-[#2D948A] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1f6961] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2D948A]"
              >
                Ver Lotes Disponibles
              </Link>
              <Link href="/register" className="text-sm font-semibold leading-6 text-white hover:text-[#F47C20]">
                Quiero ser Partner <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background Decorative */}
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
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
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-[#1D293F]">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-[#2D948A]">
                    <span className="text-white font-bold">1</span>
                  </div>
                  Regístrate
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Crea tu cuenta en segundos y accede a tu panel de control personalizado.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-[#1D293F]">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-[#2D948A]">
                     <span className="text-white font-bold">2</span>
                  </div>
                  Comparte
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Envía tu link o código QR a tus contactos interesados en invertir en bienes raíces.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-[#1D293F]">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-[#2D948A]">
                     <span className="text-white font-bold">3</span>
                  </div>
                  Gana
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Recibe comisiones atractivas cuando tus referidos completen su inversión.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Featured Lotes Preview */}
      {featuredLote && (
        <div className="bg-[#1D293F] py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center mb-16">
                    <h2 className="text-base font-semibold leading-7 text-[#2D948A]">Oportunidades</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Proyectos Destacados
                    </p>
                </div>
                <div className="relative isolate overflow-hidden bg-[#1D293F] px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0 border border-white/10">
                    <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        {featuredLote.title.rendered}
                        <br />
                        Inicia tu inversión hoy.
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-gray-300" dangerouslySetInnerHTML={{ __html: featuredLote.excerpt?.rendered || 'Excelente oportunidad de inversión.' }} />
                        <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                        <Link
                            href={`/lote/${featuredLote.slug}`}
                            className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                            Ver Detalles
                        </Link>
                        </div>
                    </div>
                    <div className="relative mt-16 h-80 lg:mt-8">
                        {featuredLote._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
                            <img
                            className="absolute left-0 top-0 w-[57rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10 object-cover"
                            src={featuredLote._embedded['wp:featuredmedia'][0].source_url}
                            alt="App screenshot"
                            width={1824}
                            height={1080}
                            />
                        ) : (
                            <div className="absolute left-0 top-0 w-[57rem] h-full bg-gray-700 rounded-md flex items-center justify-center text-gray-500">
                                Sin Imagen
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}
