"use client"

import { ReactNode, useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

type AuthWrapperProps = {
  children: ReactNode
  redirectTo?: string
}

export function AuthWrapper({ children, redirectTo = "/login" }: AuthWrapperProps) {
  const { token, loading } = useAuth()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!token) router.push(redirectTo)
      else setReady(true)
    }
  }, [token, loading, router, redirectTo])

    if (!ready) return null

  return <>{children}</>
}
