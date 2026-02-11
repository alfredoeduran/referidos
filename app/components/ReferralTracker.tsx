'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import { recordClick } from '../actions'

function Tracker() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const ref = searchParams.get('ref')

  useEffect(() => {
    if (ref) {
      // Store in localStorage
      localStorage.setItem('referralCode', ref)
      
      // Record click server-side
      recordClick(ref, pathname).catch(console.error)
    }
  }, [ref, pathname])

  return null
}

export default function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  )
}
