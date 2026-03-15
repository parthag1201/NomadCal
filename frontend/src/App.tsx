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

type Recommendation = {
  name: string
  country: string
  state: string | null
  dest_type: string
  avg_cost_per_day: number | null
  activities: string[]
  tags: string[]
  score: number
}

type RecommendationsResponse = {
  year: number
  suggestions: Recommendation[]
}

type PreferencesPayload = {
  travel_style: 'adventure' | 'relaxation' | 'culture' | 'mixed'
  budget_per_trip: number
  annual_budget: number
  group_type: 'solo' | 'couple' | 'family' | 'friends'
  activity_interests: string[]
  domestic_international: 'domestic' | 'international' | 'both'
  comfort_level: 'backpacker' | 'mid-range' | 'luxury'
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
  const [userEmail, setUserEmail] = useState('agarwal.parth25@gmail.com')
  const [year, setYear] = useState(2026)
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['march', 'october'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<WindowsResponse | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [apiMessage, setApiMessage] = useState('')

  const [preferences, setPreferences] = useState<PreferencesPayload>({
    travel_style: 'adventure',
    budget_per_trip: 12000,
    annual_budget: 90000,
    group_type: 'friends',
    activity_interests: ['trekking', 'beach'],
    domestic_international: 'both',
    comfort_level: 'mid-range',
  })

  const [tripDestination, setTripDestination] = useState('Goa')
  const [tripStart, setTripStart] = useState('2026-10-02')
  const [tripEnd, setTripEnd] = useState('2026-10-04')
  const [tripBudget, setTripBudget] = useState(15000)
  const [interestInput, setInterestInput] = useState('trekking, beach, nightlife')

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

        const recParams = new URLSearchParams({
          year: String(year),
          budget_per_trip: String(preferences.budget_per_trip),
          max_results: '6',
        })
        selectedMonths.forEach((m) => recParams.append('preferred_months', m))
        preferences.activity_interests.forEach((i) => recParams.append('interests', i))

        const recRes = await fetch(`/api/trips/recommendations?${recParams.toString()}`)
        if (recRes.ok) {
          const recJson = (await recRes.json()) as RecommendationsResponse
          setRecommendations(recJson.suggestions || [])
        } else {
          setRecommendations([])
        }
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

  const savePreferences = async () => {
    setApiMessage('Saving preferences...')
    try {
      const parsedInterests = interestInput
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)

      const qs = new URLSearchParams({ user_email: userEmail }).toString()
      const res = await fetch(`/api/preferences/?${qs}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...preferences,
          activity_interests: parsedInterests,
        }),
      })
      const body = await res.json()
      if (!res.ok) {
        throw new Error(body?.detail || `API error ${res.status}`)
      }
      setApiMessage('Preferences saved successfully.')
    } catch (e) {
      setApiMessage(e instanceof Error ? e.message : 'Failed to save preferences')
    }
  }

  const loadPreferences = async () => {
    setApiMessage('Loading preferences...')
    try {
      const qs = new URLSearchParams({ user_email: userEmail }).toString()
      const res = await fetch(`/api/preferences/?${qs}`)
      const body = await res.json()
      if (!res.ok) {
        throw new Error(body?.detail || `API error ${res.status}`)
      }

      if (body?.exists && body?.preferences) {
        setPreferences(body.preferences as PreferencesPayload)
        setInterestInput((body.preferences.activity_interests || []).join(', '))
        setApiMessage('Preferences loaded.')
      } else {
        setApiMessage(body?.message || 'No preferences found yet.')
      }
    } catch (e) {
      setApiMessage(e instanceof Error ? e.message : 'Failed to load preferences')
    }
  }

  const seedDestinations = async () => {
    setApiMessage('Seeding destinations...')
    try {
      const res = await fetch('/api/trips/seed-destinations', { method: 'POST' })
      const body = await res.json()
      if (!res.ok) {
        throw new Error(body?.detail || `API error ${res.status}`)
      }
      setApiMessage(`Destinations inserted: ${body.inserted}/${body.total_in_file}`)
    } catch (e) {
      setApiMessage(e instanceof Error ? e.message : 'Failed to seed destinations')
    }
  }

  const createTripDraft = async () => {
    setApiMessage('Creating trip draft...')
    try {
      const qs = new URLSearchParams({ user_email: userEmail }).toString()
      const res = await fetch(`/api/trips/draft?${qs}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: tripDestination,
          start_date: tripStart,
          end_date: tripEnd,
          estimated_budget: tripBudget,
          notes: 'Generated from frontend MVP panel',
        }),
      })
      const body = await res.json()
      if (!res.ok) {
        throw new Error(body?.detail || `API error ${res.status}`)
      }
      setApiMessage(`Draft created: ${body.id}`)
    } catch (e) {
      setApiMessage(e instanceof Error ? e.message : 'Failed to create trip draft')
    }
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
            <label htmlFor="userEmail" className="text-sm text-slate-400">User Email</label>
            <input
              id="userEmail"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-80 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>

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

          <div className="grid md:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
            <button
              onClick={savePreferences}
              className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-medium py-2 px-3"
            >
              Save Preferences
            </button>

            <button
              onClick={loadPreferences}
              className="rounded-lg bg-indigo-500 hover:bg-indigo-400 text-slate-900 font-medium py-2 px-3"
            >
              Load Preferences
            </button>

            <button
              onClick={createTripDraft}
              className="rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-medium py-2 px-3"
            >
              Create Trip Draft
            </button>

            <button
              onClick={seedDestinations}
              className="rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium py-2 px-3"
            >
              Seed Destinations
            </button>

            <div className="md:col-span-4 text-xs text-slate-300 rounded-lg border border-slate-700 px-3 py-2">
              {apiMessage || 'No API action yet'}
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-3 text-sm">
            <input
              value={tripDestination}
              onChange={(e) => setTripDestination(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              placeholder="Destination"
            />
            <input
              type="date"
              value={tripStart}
              onChange={(e) => setTripStart(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            />
            <input
              type="date"
              value={tripEnd}
              onChange={(e) => setTripEnd(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            />
            <input
              type="number"
              value={tripBudget}
              onChange={(e) => setTripBudget(Number(e.target.value) || 0)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              placeholder="Budget"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-3 text-sm border-t border-slate-800 pt-3">
            <select
              value={preferences.travel_style}
              onChange={(e) => setPreferences((p) => ({ ...p, travel_style: e.target.value as PreferencesPayload['travel_style'] }))}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            >
              <option value="adventure">adventure</option>
              <option value="relaxation">relaxation</option>
              <option value="culture">culture</option>
              <option value="mixed">mixed</option>
            </select>

            <select
              value={preferences.group_type}
              onChange={(e) => setPreferences((p) => ({ ...p, group_type: e.target.value as PreferencesPayload['group_type'] }))}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            >
              <option value="solo">solo</option>
              <option value="couple">couple</option>
              <option value="family">family</option>
              <option value="friends">friends</option>
            </select>

            <select
              value={preferences.comfort_level}
              onChange={(e) => setPreferences((p) => ({ ...p, comfort_level: e.target.value as PreferencesPayload['comfort_level'] }))}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            >
              <option value="backpacker">backpacker</option>
              <option value="mid-range">mid-range</option>
              <option value="luxury">luxury</option>
            </select>

            <input
              type="number"
              value={preferences.budget_per_trip}
              onChange={(e) => setPreferences((p) => ({ ...p, budget_per_trip: Number(e.target.value) || 0 }))}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              placeholder="Budget per trip"
            />

            <input
              type="number"
              value={preferences.annual_budget}
              onChange={(e) => setPreferences((p) => ({ ...p, annual_budget: Number(e.target.value) || 0 }))}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              placeholder="Annual budget"
            />

            <select
              value={preferences.domestic_international}
              onChange={(e) => setPreferences((p) => ({ ...p, domestic_international: e.target.value as PreferencesPayload['domestic_international'] }))}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            >
              <option value="domestic">domestic</option>
              <option value="international">international</option>
              <option value="both">both</option>
            </select>

            <input
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              className="md:col-span-3 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              placeholder="Interests (comma separated): trekking, beach, nightlife"
            />
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

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-100">Suggested Destinations</h2>
          {recommendations.length === 0 ? (
            <p className="text-slate-400 text-sm">No suggestions yet.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              {recommendations.map((r) => (
                <article key={`${r.name}-${r.dest_type}`} className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2">
                  <h3 className="font-semibold text-slate-100">{r.name}</h3>
                  <p className="text-sm text-slate-400">{r.state ? `${r.state}, ${r.country}` : r.country}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-slate-800 px-2 py-1">score: {r.score}</span>
                    <span className="rounded-full bg-slate-800 px-2 py-1">{r.dest_type}</span>
                    {r.avg_cost_per_day && (
                      <span className="rounded-full bg-slate-800 px-2 py-1">~INR {r.avg_cost_per_day}/day</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default App
