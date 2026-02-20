'use client'

import { useState } from 'react'
import { registerReferrer } from '../actions'

function generateCaptcha() {
  const n1 = Math.floor(Math.random() * 10) + 1
  const n2 = Math.floor(Math.random() * 10) + 1
  return { q: `${n1} + ${n2}`, a: n1 + n2 }
}

export default function RegisterForm() {
  const [captcha, setCaptcha] = useState(generateCaptcha)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(formData: FormData) {
    setError('')
    if (parseInt(input) !== captcha.a) {
      setError('Captcha incorrecto. Por favor resuelve la suma.')
      setCaptcha(generateCaptcha())
      return
    }
    
    const res = await registerReferrer(formData)
    if (res?.error) {
      setError(res.error)
    }
  }

  return (
    <form className="space-y-6" action={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <div className="mt-1">
            <input
              id="name"
              name="name"
              type="text"
              required
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Apellido
          </label>
          <div className="mt-1">
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Teléfono
        </label>
        <div className="mt-1">
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
          Ciudad
        </label>
        <div className="mt-1">
          <input
            id="city"
            name="city"
            type="text"
            required
            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            required
            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Verificación de seguridad
        </label>
        <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-600 select-none bg-gray-200 px-3 py-1 rounded">
                {captcha.q} = ?
            </span>
            <input
                type="number"
                required
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Respuesta"
                className="block w-24 appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
            />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <button
          type="submit"
          className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Registrarse
        </button>
      </div>
    </form>
  )
}
