"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  /** Keeps compatibility with next-themes' API used in RootLayout */
  attribute?: "class"
  defaultTheme?: Theme
  enableSystem?: boolean
}

type ThemeContextValue = {
  resolvedTheme: Exclude<Theme, "system">
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function getSystemTheme(): Exclude<Theme, "system"> {
  if (typeof window === "undefined") return "light"
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function applyThemeToDocument(theme: Exclude<Theme, "system">) {
  if (typeof document === "undefined") return
  document.documentElement.classList.toggle("dark", theme === "dark")
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
}: ThemeProviderProps) {
  // `attribute` is kept only for API compatibility.
  void attribute

  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = React.useState<Exclude<Theme, "system">>(
    defaultTheme === "dark" || defaultTheme === "light" ? defaultTheme : "light"
  )

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next)
    try {
      localStorage.setItem("theme", next)
    } catch {
      // ignore
    }
  }, [])

  // Initial load
  React.useEffect(() => {
    let saved: Theme | null = null
    try {
      saved = (localStorage.getItem("theme") as Theme | null) ?? null
    } catch {
      saved = null
    }

    const initial = saved ?? defaultTheme
    setThemeState(initial)

    const nextResolved =
      initial === "system" ? (enableSystem ? getSystemTheme() : "light") : initial
    setResolvedTheme(nextResolved)
    applyThemeToDocument(nextResolved)
  }, [defaultTheme, enableSystem])

  // React to system changes when in system mode
  React.useEffect(() => {
    if (!enableSystem) return
    if (theme !== "system") return
    if (!window.matchMedia) return

    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      const nextResolved = getSystemTheme()
      setResolvedTheme(nextResolved)
      applyThemeToDocument(nextResolved)
    }

    // Initial sync
    onChange()

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    }

    // Safari fallback
    // eslint-disable-next-line deprecation/deprecation
    mql.addListener(onChange)
    // eslint-disable-next-line deprecation/deprecation
    return () => mql.removeListener(onChange)
  }, [enableSystem, theme])

  // Apply theme when explicitly set
  React.useEffect(() => {
    const nextResolved = theme === "system" ? (enableSystem ? getSystemTheme() : "light") : theme
    setResolvedTheme(nextResolved)
    applyThemeToDocument(nextResolved)
  }, [theme, enableSystem])

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) {
    // Fail gracefully in case someone uses the hook without provider.
    return {
      theme: "system" as Theme,
      resolvedTheme: "light" as Exclude<Theme, "system">,
      setTheme: (_: Theme) => {},
    }
  }
  return ctx
}
