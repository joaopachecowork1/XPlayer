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
            if (!token) {
                router.push(redirectTo)
            } else {
                setReady(true)
            }
        }
    }, [token, loading, router, redirectTo])

    // Em vez de null, mostramos um pequeno indicador de loading
    if (!ready) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/20 animate-spin border-t-2 border-primary"></div>
                    <p className="text-muted-foreground text-sm">A carregar a tua sessão...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}