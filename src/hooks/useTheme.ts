import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

/**
 * Custom hook for managing the app theme (light/dark mode).
 * Persists preference to localStorage and applies `.dark` class to <html>.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'

    const stored = localStorage.getItem('aerosense-theme') as Theme | null
    if (stored) return stored

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })

  useEffect(() => {
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    localStorage.setItem('aerosense-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return { theme, setTheme, toggleTheme }
}
