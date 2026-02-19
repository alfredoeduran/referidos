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
  const [referralCode] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('referralCode')
  })
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [visitorPhone, setVisitorPhone] = useState(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('visitorPhone') || ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    // noop: mantenemos el efecto para posibles futuras suscripciones
  }, [])

  const phoneNumber = '573216583860'
  const message = `Hola 👋
Quiero invertir en el lote: ${loteTitle}
ID: ${loteId}
Referido por: ${referralCode || 'N/A'}
Teléfono de contacto: ${visitorPhone || 'No proporcionado'}
Link: https://app.goodsco.com/lote/${loteSlug}`

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    // Acepta números de 10 a 12 dígitos (permite con o sin indicativo)
    return digits.length >= 10 && digits.length <= 12
  }

  const sendToCrmAndOpen = async () => {
    try {
      await fetch('/api/whatsapp-lead', {
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
      })
    } catch (err) {
      console.error('Error enviando lead de WhatsApp', err)
    } finally {
      window.open(whatsappUrl, '_blank')
    }
  }

  const handleOpenWhatsApp = () => {
    if (!validatePhone(visitorPhone)) {
      setShowPhoneModal(true)
      return
    }
    sendToCrmAndOpen()
  }

  const handleConfirmPhone = () => {
    if (!validatePhone(visitorPhone)) {
      setError('Ingresa un número válido (10-12 dígitos).')
      return
    }
    localStorage.setItem('visitorPhone', visitorPhone)
    setShowPhoneModal(false)
    setError('')
    // Registrar en CRM y luego abrir WhatsApp
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
                    <QRCodeSVG value={`https://app.goodsco.com/lote/${loteSlug}?ref=${referralCode}`} size={100} />
                </div>
            </div>
        )}

        {showPhoneModal && (
          <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Antes de continuar</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ingresa tu número de teléfono para que podamos contactarte y registrar tu interés.
              </p>
              <div className="space-y-2">
                <label htmlFor="visitorPhone" className="text-xs font-semibold text-gray-700">Número de teléfono</label>
                <input
                  id="visitorPhone"
                  type="tel"
                  value={visitorPhone}
                  onChange={e => { setVisitorPhone(e.target.value); setError('') }}
                  placeholder="Ej: 3001234567 o +573001234567"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {error && <p className="text-xs text-red-600">{error}</p>}
              </div>
              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  onClick={() => { setShowPhoneModal(false); setError('') }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmPhone}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-green-500 text-white hover:bg-green-600"
                >
                  Continuar a WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
