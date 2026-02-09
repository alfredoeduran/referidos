'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ReferralLanding({ code }: { code: string }) {
  const router = useRouter()

  useEffect(() => {
    // Save referral code to LocalStorage
    localStorage.setItem('referralCode', code)
    
    // Also set a cookie for server-side access if needed later (optional for MVP but good practice)
    document.cookie = `referralCode=${code}; path=/; max-age=31536000` // 1 year
  }, [code])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl text-center">
         <div className="mb-6 text-green-500 text-6xl">✨</div>
         <h1 className="text-2xl font-bold text-gray-900 mb-4">¡Bienvenido a Goods & Co!</h1>
         <p className="text-gray-600 mb-8">
            Estás ingresando gracias a un aliado de confianza. Hemos activado beneficios exclusivos para ti.
         </p>
         
         <button 
            onClick={() => router.push('/lotes')}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition transform hover:scale-105"
         >
            Ver Lotes Disponibles
         </button>
         
         <p className="mt-4 text-xs text-gray-400">
            Código de referido activo: {code}
         </p>
      </div>
    </div>
  )
}
