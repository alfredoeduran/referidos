'use client'

import WhatsAppButton from './WhatsAppButton'

export default function FloatingInterest({ 
  loteId, 
  loteTitle, 
  loteSlug 
}: { 
  loteId: number
  loteTitle: string
  loteSlug: string 
}) {
  return (
    <div className="fixed z-[999] bottom-0 right-0 w-full md:top-1/2 md:bottom-auto md:right-5 md:-translate-y-1/2 md:w-[360px] bg-white shadow-2xl rounded-t-xl md:rounded-xl border border-gray-200 p-6 transition-all duration-300">
      <h3 className="text-xl font-bold text-gray-900 mb-2">¿Interesado en este lote?</h3>
      <p className="text-gray-600 mb-4 text-sm">
        Contacta a uno de nuestros asesores expertos para recibir información personalizada.
      </p>
      
      <WhatsAppButton 
        loteId={loteId} 
        loteTitle={loteTitle} 
        loteSlug={loteSlug} 
      />
      
      <div className="mt-4 flex items-center justify-center text-xs text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
        </svg>
        Tus datos están protegidos
      </div>
    </div>
  )
}
