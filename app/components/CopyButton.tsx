'use client'

import { useState } from 'react'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy!', err)
    }
  }

  return (
    <button 
      onClick={handleCopy}
      className={`ml-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
        copied 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {copied ? '¡Copiado!' : 'Copiar'}
    </button>
  )
}
