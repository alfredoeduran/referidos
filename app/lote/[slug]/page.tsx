import { getLoteBySlug } from '@/lib/wordpress'
import FloatingInterest from '@/app/components/FloatingInterest'
import { notFound } from 'next/navigation'
import Header from '@/app/components/Header'

export default async function LoteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const lote = await getLoteBySlug(slug)

  if (!lote) {
    notFound()
  }

  const wpUrl = `https://goodsco.com.co/inmueble/${slug}/`

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <Header showLogo={false} />
      
      <div className="flex-grow relative w-full">
        <iframe 
            src={wpUrl} 
            className="w-full h-full border-0"
            title={lote.title.rendered}
            allowFullScreen
        />
        
        <FloatingInterest 
            loteId={lote.id} 
            loteTitle={lote.title.rendered} 
            loteSlug={slug} 
        />
      </div>
    </div>
  )
}
