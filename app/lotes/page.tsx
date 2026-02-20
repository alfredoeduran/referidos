import Link from 'next/link'
import { getLotes } from '@/lib/wordpress'
import Header from '@/app/components/Header'

export default async function LotesPage() {
  const lotes = await getLotes()

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Header />
      
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="mb-6">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-[#F47C20] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#d86816]"
              >
                Registrarme
              </Link>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F47C20] mb-3 uppercase">Nuestros Proyectos</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explora nuestra selección exclusiva de lotes campestres y encuentra el lugar perfecto para tu inversión.
            </p>
          </div>
        
          {lotes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-[#2D948A]/10">
                  <p className="text-xl text-gray-500">No hay lotes disponibles en este momento.</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {lotes.map((lote) => (
                  <Link
                    key={lote.id}
                    href={`/lote/${lote.slug}`}
                    className="group relative block rounded-3xl overflow-hidden shadow-md bg-black"
                  >
                    {lote._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
                      <img
                        src={lote._embedded['wp:featuredmedia'][0].source_url}
                        alt={lote.title.rendered}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#1D293F]/30" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                    <div className="relative p-8 sm:p-10 h-[260px] flex flex-col justify-center">
                      <p className="text-white/90 text-sm">Excelente oportunidad de inversión.</p>
                      <h2
                        className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#F47C20]"
                        dangerouslySetInnerHTML={{ __html: lote.title.rendered }}
                      />
                      <p className="mt-3 text-white/90">Inicia tu inversión hoy</p>
                      <span className="mt-5 inline-flex w-max rounded-full bg-[#F47C20] px-5 py-3 text-sm font-semibold text-white shadow-sm group-hover:bg-[#d86816]">
                        Ver Detalles
                      </span>
                    </div>
                  </Link>
              ))}
              </div>
          )}
        </div>
      </main>
    </div>
  )
}
