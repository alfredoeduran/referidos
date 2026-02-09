import { getLoteBySlug } from '@/lib/wordpress'
import WhatsAppButton from '@/app/components/WhatsAppButton'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/app/components/Header'

export default async function LoteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const lote = await getLoteBySlug(slug)

  if (!lote) {
    notFound()
  }

  // Handle potential empty array from WP API for empty ACF
  const acf = Array.isArray(lote.acf) ? null : lote.acf
  const featuredImage = lote._embedded?.['wp:featuredmedia']?.[0]?.source_url

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-gray-900">
        {featuredImage ? (
            <>
                <img 
                    src={featuredImage} 
                    alt={lote.title.rendered} 
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
            </>
        ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <span className="text-gray-500 text-lg">Sin imagen disponible</span>
            </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 pb-12 sm:pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white shadow-sm mb-4" dangerouslySetInnerHTML={{ __html: lote.title.rendered }} />
                {acf?.ubicacion && (
                    <div className="flex items-center text-gray-300 text-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {acf.ubicacion}
                    </div>
                )}
            </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
                {/* Highlights Bar */}
                {acf && (
                    <div className="bg-white rounded-xl shadow-lg p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
                        {(acf.precio || acf.precio_desde) && (
                            <div className="col-span-2 md:col-span-1">
                                <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Precio</p>
                                <p className="text-2xl font-bold text-green-600">{acf.precio || acf.precio_desde}</p>
                            </div>
                        )}
                        {acf.area && (
                            <div>
                                <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Área</p>
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-indigo-600">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                                    </svg>
                                    <span className="text-xl font-medium text-gray-900">{acf.area}</span>
                                </div>
                            </div>
                        )}
                        {acf.estado && (
                             <div>
                                <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Estado</p>
                                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20 mt-1">
                                    {acf.estado}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Description */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Descripción del Proyecto</h2>
                    <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: lote.content.rendered }} />
                </div>

                {/* Financing Plan */}
                {acf?.plan_financiacion && (
                    <div className="bg-indigo-50 rounded-xl p-8 border border-indigo-100">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="p-3 bg-indigo-600 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Plan de Financiación</h3>
                                <div className="text-gray-700 whitespace-pre-line bg-white/60 p-4 rounded-lg border border-indigo-100/50">
                                    {acf.plan_financiacion}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                    <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-indigo-600">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">¿Interesado en este lote?</h3>
                        <p className="text-gray-600 mb-6 text-sm">
                            Contacta a uno de nuestros asesores expertos para recibir información personalizada y programar una visita.
                        </p>
                        
                        <WhatsAppButton 
                            loteId={lote.id} 
                            loteTitle={lote.title.rendered} 
                            loteSlug={lote.slug} 
                        />
                        
                        <div className="mt-6 flex items-center justify-center text-xs text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                            </svg>
                            Tus datos están protegidos
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <h4 className="font-semibold text-gray-900 mb-4">¿Por qué invertir con Goods & Co?</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start text-sm text-gray-600">
                                <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Respaldo jurídico garantizado
                            </li>
                            <li className="flex items-start text-sm text-gray-600">
                                <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Alta valorización asegurada
                            </li>
                            <li className="flex items-start text-sm text-gray-600">
                                <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Acompañamiento personalizado
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  )
}
