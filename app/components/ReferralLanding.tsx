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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#1D293F] via-[#2D948A] to-[#FFFFFF] p-4">
      <div className="w-full max-w-md bg-white/95 p-8 rounded-2xl shadow-2xl text-center border border-[#2D948A]/20">
         <div className="mb-6 flex justify-center">
           <img 
             src="https://goodsco.com.co/wp-content/uploads/elementor/thumbs/logo-rhve9fe880lsryba0aexm0awj2nb61s6ec3w0mx2d8.png" 
             alt="Goods & Co Logo" 
             className="h-16 w-auto"
           />
         </div>
         <h1 className="text-2xl font-bold text-[#1D293F] mb-4">¡Bienvenido a Goods & Co!</h1>
         <p className="text-gray-600 mb-8">
            Estás ingresando gracias a un aliado de confianza. Hemos activado beneficios exclusivos para ti.
         </p>
         
         <button 
            onClick={() => router.push('/lotes')}
            className="w-full bg-[#2D948A] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#1f6961] transition transform hover:scale-105"
         >
            Ver Lotes Disponibles
         </button>
         
         <p className="mt-4 text-xs text-gray-500">
            Código de referido activo: {code}
         </p>
      </div>
    </div>
  )
}
