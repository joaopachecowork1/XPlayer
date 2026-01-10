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
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Login failed")
      }
      const data = await res.json()
      localStorage.setItem("token", data.token)
      setToken(data.token)
      return true
    } catch (err: any) {
      return err.message
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
