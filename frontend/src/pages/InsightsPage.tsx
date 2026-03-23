import { useState, useMemo } from 'react'
import { useTravelWindows, useRecommendations } from '../hooks'
import { LoadingSkeleton } from '../components'

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

export function InsightsPage() {
  const [year, setYear] = useState(2026)
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['march', 'october'])
  const [budgetPerTrip, setBudgetPerTrip] = useState(12000)
  const [interestInput, setInterestInput] = useState('trekking, beach')

  const normalizedInterests = useMemo(
    () =>
      interestInput
        .split(',')
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean)
        .filter((value, index, arr) => arr.indexOf(value) === index),
    [interestInput]
  )

  const { data: windows, loading: loadingWindows, error: errorWindows } = useTravelWindows(
    year,
    selectedMonths
  )
  const { recommendations, loading: loadingRecommendations } = useRecommendations(
    year,
    selectedMonths,
    budgetPerTrip,
    normalizedInterests
  )

  const toggleMonth = (month: string) => {
    setSelectedMonths((prev) =>
      prev.includes(month)
        ? prev.filter((m) => m !== month)
        : [...prev, month]
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Travel Insights & Recommendations</h1>
        <p className="text-slate-400">
          Explore optimized travel windows and AI-recommended destinations for your year.
        </p>
      </div>

      {/* Filters */}
      <div className="frost-card rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-100">Filters & Preferences</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-300">Year</span>
            <input
              type="number"
              min={2025}
              max={2035}
              value={year}
              onChange={(e) => setYear(Number(e.target.value) || 2026)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-300">Budget Per Trip (INR)</span>
            <input
              type="number"
              value={budgetPerTrip}
              onChange={(e) => setBudgetPerTrip(Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-300">Interests</span>
            <input
              type="text"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              placeholder="trekking, beach"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
            />
          </label>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-300">Preferred Months</p>
          <div className="flex flex-wrap gap-2">
            {MONTH_OPTIONS.map((month) => {
              const active = selectedMonths.includes(month)
              return (
                <button
                  key={month}
                  onClick={() => toggleMonth(month)}
                  className={`pill-button rounded-full px-3 py-1.5 text-xs transition ${
                    active
                      ? 'border-emerald-300 bg-emerald-400/20 text-emerald-100'
                      : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-cyan-500'
                  }`}
                >
                  {month.slice(0, 3).toUpperCase()}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Travel Windows */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-100">Travel Windows for {year}</h2>
          {loadingWindows && <span className="text-xs text-slate-400 animate-pulse">Loading...</span>}
        </div>

        {errorWindows && (
          <div className="rounded-lg bg-rose-900/30 border border-rose-700 text-rose-200 p-4 text-sm">
            {errorWindows}
          </div>
        )}

        {loadingWindows && !windows ? (
          <LoadingSkeleton count={2} />
        ) : windows?.windows && windows.windows.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {windows.windows.map((w) => (
              <article
                key={`${w.start}-${w.end}-${w.label}`}
                className="frost-card rounded-2xl p-4 space-y-3"
              >
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{w.label}</h3>
                  <p className="text-sm text-slate-400">
                    {new Date(w.start).toLocaleDateString()} to {new Date(w.end).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-200">
                    {w.days} days
                  </span>
                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-200">
                    {w.leaves_needed} leave(s)
                  </span>
                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-200">
                    {w.type.replace('_', ' ')}
                  </span>
                  {w.anchored_holiday && (
                    <span className="rounded-full bg-emerald-900/40 border border-emerald-700 px-2.5 py-1 text-xs text-emerald-200">
                      📌 {w.anchored_holiday}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-slate-900/50 border border-slate-800 p-6 text-center">
            <p className="text-slate-400">No travel windows found for your selection.</p>
          </div>
        )}
      </div>

      {/* Recommended Destinations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-100">Recommended Destinations</h2>
          {loadingRecommendations && (
            <span className="text-xs text-slate-400 animate-pulse">Analyzing...</span>
          )}
        </div>

        {loadingRecommendations && !recommendations.length ? (
          <LoadingSkeleton count={3} />
        ) : recommendations && recommendations.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {recommendations.map((r) => (
              <article key={`${r.name}-${r.dest_type}`} className="frost-card rounded-2xl p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-slate-100">{r.name}</h3>
                  <p className="text-sm text-slate-400">
                    {r.state ? `${r.state}, ${r.country}` : r.country}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/50 px-2 py-1 text-xs text-amber-200">
                    ⭐ {r.score.toFixed(1)}
                  </span>
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-200">
                    {r.dest_type}
                  </span>
                  {r.avg_cost_per_day && (
                    <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-200">
                      ~INR {r.avg_cost_per_day}/day
                    </span>
                  )}
                </div>

                {r.activities && r.activities.length > 0 && (
                  <div className="pt-2 border-t border-slate-800">
                    <p className="text-xs text-slate-400 mb-2">Activities:</p>
                    <div className="flex flex-wrap gap-1">
                      {r.activities.slice(0, 3).map((act) => (
                        <span
                          key={act}
                          className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-300"
                        >
                          {act}
                        </span>
                      ))}
                      {r.activities.length > 3 && (
                        <span className="text-xs text-slate-400 px-2 py-1">
                          +{r.activities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-slate-900/50 border border-slate-800 p-6 text-center">
            <p className="text-slate-400">No recommendations yet. Adjust your filters or save preferences first.</p>
          </div>
        )}
      </div>
    </div>
  )
}
