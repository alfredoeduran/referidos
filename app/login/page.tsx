import Link from 'next/link'
import Header from '@/app/components/Header'
import LoginForm from '@/app/components/LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { error } = await searchParams
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1D293F] via-[#2D948A] to-[#FFFFFF] flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
            Inicia sesión en tu cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-100">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-medium text-[#F47C20] hover:text-white">
              Regístrate aquí
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error === 'account_blocked' ? 'Tu cuenta ha sido bloqueada. Por favor contacta al administrador.' : error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white/95 backdrop-blur py-8 px-4 shadow-lg sm:rounded-2xl sm:px-10 border border-[#2D948A]/20">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
