// hooks/useAuth.ts
"use client"

import { useState, useEffect, useCallback } from "react"

export function useAuth() {
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const saved = localStorage.getItem("token")
        if (saved) setToken(saved)
        setLoading(false)
    }, [])

    const login = useCallback(async (email: string, password: string) => {
        try {
            // Nota: o ideal será apontar diretamente para a API do backend
            // usando process.env.NEXT_PUBLIC_API_URL + "/api/auth/login"
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Login falhou. Verifica as credenciais.")
            }

            localStorage.setItem("token", data.token)
            setToken(data.token)
            return { success: true }
        } catch (err: any) {
            // Agora retornamos sempre um objeto consistente
            return { success: false, error: err.message }
        }
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem("token")
        setToken(null)
    }, [])

    const authFetch = useCallback(
        async (url: string, options: RequestInit = {}) => {
            if (!token) throw new Error("Not authenticated")
            return fetch(url, {
                ...options,
                headers: {
                    ...(options.headers || {}),
                    Authorization: `Bearer ${token}`,
                },
            })
        },
        [token]
    )

    return { token, login, logout, authFetch, loading, isLogged: !!token }
}
