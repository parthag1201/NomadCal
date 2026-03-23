import { useEffect, useMemo, useState } from 'react'

export type TravelWindow = {
  label: string
  start: string
  end: string
  days: number
  leaves_needed: number
  type: 'long_weekend' | 'custom_leave' | 'extended_leave'
  anchored_holiday: string | null
}

export type WindowsResponse = {
  year: number
  count: number
  windows: TravelWindow[]
}

export function useTravelWindows(year: number, selectedMonths: string[]) {
  const [data, setData] = useState<WindowsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ year: String(year) })
    selectedMonths.forEach((m) => params.append('preferred_months', m))
    return params.toString()
  }, [year, selectedMonths])

  useEffect(() => {
    const fetchWindows = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/trips/windows?${queryString}`)
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`)
        }
        const json = (await res.json()) as WindowsResponse
        setData(json)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    void fetchWindows()
  }, [queryString])

  return { data, loading, error }
}
