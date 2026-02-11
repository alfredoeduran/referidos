'use client'

import { markLeadAsContacted } from '../actions'

export default function ContactButton({ leadId, phone, currentStatus }: { leadId: string, phone: string, currentStatus: string }) {
  const handleClick = async () => {
    // Open WhatsApp immediately
    window.open(`https://wa.me/${phone}`, '_blank')
    
    // Update status if it's currently Registered
    if (currentStatus === 'Registrado') {
      await markLeadAsContacted(leadId)
    }
  }

  return (
    <button 
      onClick={handleClick}
      className="text-green-600 hover:text-green-800 bg-green-50 px-3 py-1 rounded-md text-xs font-bold transition-colors flex items-center gap-1"
      title="Contactar por WhatsApp"
    >
      <span>📱</span> WhatsApp
    </button>
  )
}
