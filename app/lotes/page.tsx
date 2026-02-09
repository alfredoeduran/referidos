import Link from 'next/link'
import { getLotes } from '@/lib/wordpress'
import Header from '@/app/components/Header'

export default async function LotesPage() {
  const lotes = await getLotes()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Nuestros Proyectos</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explora nuestra selección exclusiva de lotes campestres y encuentra el lugar perfecto para tu inversión.
            </p>
          </div>
        
          {lotes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                  <p className="text-xl text-gray-500">No hay lotes disponibles en este momento.</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lotes.map((lote) => (
                  <div key={lote.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col border border-gray-100 group">
                  <div className="relative overflow-hidden h-56">
                    {lote._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
                        <img 
                        src={lote._embedded['wp:featuredmedia'][0].source_url} 
                        alt={lote.title.rendered} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                            Sin imagen
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <span className="text-white font-medium text-sm">Ver Detalles &rarr;</span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                      <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1" dangerouslySetInnerHTML={{ __html: lote.title.rendered }} />
                      
                      {lote.excerpt?.rendered ? (
                          <div className="text-gray-600 mb-4 text-sm line-clamp-2" dangerouslySetInnerHTML={{ __html: lote.excerpt.rendered }} />
                      ) : (
                           <p className="text-gray-500 mb-4 text-sm italic">Sin descripción disponible.</p>
                      )}
                      
                      <div className="mt-auto pt-4 border-t border-gray-50">
                        {(!Array.isArray(lote.acf) && (lote.acf?.precio || lote.acf?.precio_desde)) && (
                            <div className="mb-4">
                                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Precio desde</p>
                                <p className="text-xl font-bold text-green-600">
                                    {lote.acf.precio || lote.acf.precio_desde}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            {lote.acf?.plan_financiacion ? (
                                <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                                    Financiación
                                </span>
                            ) : <span></span>}
                            
                            <Link 
                                href={`/lote/${lote.slug}`}
                                className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                            >
                                Ver más <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>
                      </div>
                  </div>
                  </div>
              ))}
              </div>
          )}
        </div>
      </main>
    </div>
  )
}
