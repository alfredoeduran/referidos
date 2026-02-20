import Link from 'next/link'
import Header from '@/app/components/Header'
import RegisterForm from './RegisterForm'
import { UserRound } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: 'url(/uploads/heroreferal.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <Header variant="onImage" />
      <div className="relative flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-3xl text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            REGISTRO DE <span className="text-[#F47C20]">PARTNER</span>
          </h1>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl">
          <div className="relative bg-white/20 backdrop-blur py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/20">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#F47C20] shadow-lg ring-4 ring-white/20">
              <UserRound className="text-white" size={26} />
            </div>
            <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-white">Crea tu cuenta</h2>
            <div className="mt-6">
              <RegisterForm />
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-white/90">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-semibold text-[#F47C20] hover:text-white">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
