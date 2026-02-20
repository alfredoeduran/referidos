import Link from 'next/link'
import Header from '@/app/components/Header'
import LoginForm from '@/app/components/LoginForm'
import { UserRound } from 'lucide-react'
import heroBg from '@/public/uploads/heroreferal.png'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { error } = await searchParams
  
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `url(${heroBg.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <Header variant="onImage" />
      <div className="relative flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            INVIERTE EN TIERRA
          </h1>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F47C20]">
            GANA POR REFERIR
          </p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
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
          <div className="relative bg-white/20 backdrop-blur py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/20">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#F47C20] shadow-lg ring-4 ring-white/20">
              <UserRound className="text-white" size={26} />
            </div>
            <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-white">Bienvenido</h2>
            <div className="mt-6">
              <LoginForm />
            </div>
            <div className="mt-4 text-right">
              <Link href="#" className="text-sm text-white/90 hover:text-[#F47C20]">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-white/90">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-semibold text-[#F47C20] hover:text-white">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
