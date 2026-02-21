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
  const [visitorPhone, setVisitorPhone] = useState(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('visitorPhone') || ''
  })
  const [error, setError] = useState('')
  const [baseUrl, setBaseUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin)
      const stored = localStorage.getItem('referralCode')
      if (stored) {
        setReferralCode(stored)
      }
    }
  }, [])

  const phoneNumber = '573216583860'
  const effectiveBaseUrl = baseUrl || 'https://app.goodsco.com'
  const loteUrl = `${effectiveBaseUrl}/lote/${loteSlug}`
  const message = `Hola 👋
Quiero invertir en el lote: ${loteTitle}
ID: ${loteId}
Referido por: ${referralCode || 'N/A'}
Teléfono de contacto: ${visitorPhone || 'No proporcionado'}
Link: ${loteUrl}`

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    // Acepta números de 10 a 12 dígitos (permite con o sin indicativo)
    return digits.length >= 10 && digits.length <= 12
  }

  const phoneStatus = visitorPhone
    ? validatePhone(visitorPhone)
      ? 'valid'
      : 'invalid'
    : 'empty'

  const sendToCrmAndOpen = () => {
    try {
      fetch('/api/whatsapp-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: visitorPhone,
          loteId,
          loteTitle,
          loteSlug,
          referralCode
        })
      }).catch(err => {
        console.error('Error enviando lead de WhatsApp', err)
      })
    } catch (err) {
      console.error('Error enviando lead de WhatsApp', err)
    } finally {
      window.location.href = whatsappUrl
    }
  }

  const handleOpenWhatsApp = () => {
    if (!validatePhone(visitorPhone)) {
      setError('Ingresa un número válido (10-12 dígitos).')
      return
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('visitorPhone', visitorPhone)
    }
    sendToCrmAndOpen()
  }

  return (
    <div className="mt-6 space-y-4">
        {referralCode && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                <p className="text-sm text-blue-800 font-medium mb-2">
                    Estás siendo referido por: <span className="font-bold">{referralCode}</span>
                </p>
            </div>
        )}

        <div className="space-y-2">
          <label htmlFor="visitorPhone" className="text-xs font-semibold text-gray-700">
            Número de teléfono
          </label>
          <input
            id="visitorPhone"
            type="tel"
            value={visitorPhone}
            onChange={e => { setVisitorPhone(e.target.value); setError('') }}
            placeholder="Ej: 3001234567 o +573001234567"
            className={
              'w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 text-gray-900 ' +
              (phoneStatus === 'valid'
                ? 'border-green-500 focus:ring-green-500'
                : phoneStatus === 'invalid'
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-200 focus:ring-green-500')
            }
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <button
          onClick={handleOpenWhatsApp}
          className="block w-full text-center bg-green-500 text-white font-bold py-4 rounded-lg hover:bg-green-600 transition shadow-lg text-lg flex items-center justify-center gap-2"
          aria-label="Invertir vía WhatsApp"
        >
          <span>📱</span> Invertir vía WhatsApp
        </button>

        {referralCode && (
            <div className="text-center mt-4">
                <p className="text-xs text-gray-500 mb-2">Tu código de referido activo para este lote:</p>
                <div className="flex justify-center">
                    <QRCodeSVG value={`${loteUrl}?ref=${referralCode}`} size={100} />
                </div>
            </div>
        )}
    </div>
  )
}
