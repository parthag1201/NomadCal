import { useEffect, useMemo, useState } from 'react'

type TravelWindow = {
  label: string
  start: string
  end: string
  days: number
  leaves_needed: number
  type: 'long_weekend' | 'custom_leave' | 'extended_leave'
  anchored_holiday: string | null
}

type WindowsResponse = {
  year: number
  count: number
  windows: TravelWindow[]
}

const MONTH_OPTIONS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

function App() {
  const [year, setYear] = useState(2026)
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['march', 'october'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<WindowsResponse | null>(null)

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

  const toggleMonth = (month: string) => {
    setSelectedMonths((prev) =>
      prev.includes(month)
        ? prev.filter((m) => m !== month)
        : [...prev, month]
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-5xl font-semibold tracking-tight">
            Nomad<span className="text-emerald-400">Cal</span>
          </h1>
          <p className="text-slate-400 text-lg">
            AI-powered yearly travel windows based on holidays + your preferred months
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="year" className="text-sm text-slate-400">Year</label>
            <input
              id="year"
              type="number"
              min={2025}
              max={2035}
              value={year}
              onChange={(e) => setYear(Number(e.target.value) || 2026)}
              className="w-28 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {MONTH_OPTIONS.map((month) => {
              const active = selectedMonths.includes(month)
              return (
                <button
                  key={month}
                  onClick={() => toggleMonth(month)}
                  className={`rounded-full px-3 py-1.5 text-sm border transition ${
                    active
                      ? 'border-emerald-400 bg-emerald-400/20 text-emerald-200'
                      : 'border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {month}
                </button>
              )
            })}
          </div>
        </section>

        <section className="space-y-3">
          {loading && <p className="text-slate-400">Loading travel windows...</p>}
          {error && <p className="text-rose-400">{error}</p>}

          {data && (
            <div className="space-y-3">
              <p className="text-slate-300">
                Found <span className="text-emerald-300 font-semibold">{data.count}</span> windows for {data.year}
              </p>

              <div className="grid md:grid-cols-2 gap-3">
                {data.windows.map((w) => (
                  <article key={`${w.start}-${w.end}-${w.label}`} className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2">
                    <h3 className="text-base font-semibold text-slate-100">{w.label}</h3>
                    <p className="text-sm text-slate-400">
                      {w.start} to {w.end}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-slate-800 px-2 py-1">{w.days} days</span>
                      <span className="rounded-full bg-slate-800 px-2 py-1">{w.leaves_needed} leave(s)</span>
                      <span className="rounded-full bg-slate-800 px-2 py-1">{w.type}</span>
                      {w.anchored_holiday && (
                        <span className="rounded-full bg-emerald-900/40 border border-emerald-700 px-2 py-1 text-emerald-200">
                          {w.anchored_holiday}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default App
