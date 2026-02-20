'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions'
import { Loader2 } from 'lucide-react'

const initialState = {
  error: '',
}

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    try {
      const result = await login(formData)
      if (result?.error) {
        return { error: result.error }
      }
      return { error: '' }
    } catch (e) {
      return { error: 'Ocurrió un error inesperado' }
    }
  }, initialState)

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">
                {state.error}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-[#F47C20]">
          Correo electrónico
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full appearance-none rounded-lg border border-transparent bg-gray-100/80 px-3 py-2 placeholder-gray-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#F47C20] sm:text-sm text-gray-900 transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-[#F47C20]">
          Contraseña
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="block w-full appearance-none rounded-lg border border-transparent bg-gray-100/80 px-3 py-2 placeholder-gray-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#F47C20] sm:text-sm text-gray-900 transition-colors"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full justify-center rounded-full bg-[#F47C20] py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#d86816] focus:outline-none focus:ring-2 focus:ring-[#F47C20] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </button>
      </div>
    </form>
  )
}
