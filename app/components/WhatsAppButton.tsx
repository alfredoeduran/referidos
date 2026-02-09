'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function WhatsAppButton({ 
  loteId, 
  loteTitle, 
  loteSlug 
}: { 
  loteId: number
  loteTitle: string
  loteSlug: string 
}) {
  const [referralCode, setReferralCode] = useState<string | null>(null)

  useEffect(() => {
    // Client-side only: get referral code from storage
    const stored = localStorage.getItem('referralCode')
    if (stored) {
      setReferralCode(stored)
    }
  }, [])

  const phoneNumber = '573216583860'
  const message = `Hola 👋
Quiero invertir en el lote: ${loteTitle}
ID: ${loteId}
Referido por: ${referralCode || 'N/A'}
Link: https://app.goodsco.com/lote/${loteSlug}`

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <div className="mt-6 space-y-4">
        {referralCode && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                <p className="text-sm text-blue-800 font-medium mb-2">
                    Estás siendo referido por: <span className="font-bold">{referralCode}</span>
                </p>
            </div>
        )}

        <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-green-500 text-white font-bold py-4 rounded-lg hover:bg-green-600 transition shadow-lg text-lg flex items-center justify-center gap-2"
        >
            <span>📱</span> Invertir vía WhatsApp
        </a>

        {referralCode && (
            <div className="text-center mt-4">
                <p className="text-xs text-gray-500 mb-2">Tu código de referido activo para este lote:</p>
                <div className="flex justify-center">
                    <QRCodeSVG value={`https://app.goodsco.com/lote/${loteSlug}?ref=${referralCode}`} size={100} />
                </div>
            </div>
        )}
    </div>
  )
}
