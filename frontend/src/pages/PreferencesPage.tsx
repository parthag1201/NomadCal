import { useState, useMemo } from 'react'
import { usePreferences } from '../hooks'
import { ErrorAlert, SuccessAlert, LoadingSpinner } from '../components'

export function PreferencesPage() {
  const [userEmail, setUserEmail] = useState('agarwal.parth25@gmail.com')
  const [interestInput, setInterestInput] = useState('trekking, beach')
  const {
    preferences,
    setPreferences,
    loading,
    message,
    savePreferences,
    loadPreferences,
  } = usePreferences()

  const normalizedInterests = useMemo(
    () =>
      interestInput
        .split(',')
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean)
        .filter((value, index, arr) => arr.indexOf(value) === index),
    [interestInput]
  )

  const handleSave = async () => {
    await savePreferences(userEmail, normalizedInterests)
  }

  const handleLoad = async () => {
    const loaded = await loadPreferences(userEmail)
    if (loaded?.activity_interests) {
      setInterestInput(loaded.activity_interests.join(', '))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Travel Preferences</h1>
        <p className="text-slate-400">
          Set your travel style, budget, and interests to get personalized recommendations.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Identity Section */}
        <div className="frost-card rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-100">Your Profile</h2>

          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-300">User Email</span>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Travel Style</span>
              <select
                value={preferences.travel_style}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    travel_style: e.target.value as any,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
              >
                <option value="adventure">Adventure</option>
                <option value="relaxation">Relaxation</option>
                <option value="culture">Culture</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Group Type</span>
              <select
                value={preferences.group_type}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    group_type: e.target.value as any,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
              >
                <option value="solo">Solo</option>
                <option value="couple">Couple</option>
                <option value="family">Family</option>
                <option value="friends">Friends</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Comfort Level</span>
              <select
                value={preferences.comfort_level}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    comfort_level: e.target.value as any,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
              >
                <option value="backpacker">Backpacker</option>
                <option value="mid-range">Mid-range</option>
                <option value="luxury">Luxury</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Domestic vs International</span>
              <select
                value={preferences.domestic_international}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    domestic_international: e.target.value as any,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
              >
                <option value="domestic">Domestic</option>
                <option value="international">International</option>
                <option value="both">Both</option>
              </select>
            </label>
          </div>
        </div>

        {/* Budget Section */}
        <div className="frost-card rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-100">Budget Planning</h2>

          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Budget Per Trip (INR)</span>
              <input
                type="number"
                value={preferences.budget_per_trip}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    budget_per_trip: Number(e.target.value) || 0,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Annual Budget (INR)</span>
              <input
                type="number"
                value={preferences.annual_budget}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    annual_budget: Number(e.target.value) || 0,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
              />
            </label>

            <div className="rounded-lg bg-slate-900/50 border border-slate-800 p-4 mt-4">
              <p className="text-sm text-slate-400">
                <span className="font-semibold text-slate-300">Annual trips:</span> ~
                {Math.floor(preferences.annual_budget / preferences.budget_per_trip)} trips
              </p>
              <p className="text-sm text-slate-400 mt-2">
                <span className="font-semibold text-slate-300">Avg per trip:</span> INR{' '}
                {Math.floor(preferences.budget_per_trip).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interests Section */}
      <div className="frost-card rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-100">Interests & Activities</h2>

        <label className="block">
          <span className="text-sm font-medium text-slate-300">
            Activities (comma-separated, e.g., trekking, beach, nightlife)
          </span>
          <textarea
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400 resize-none"
          />
        </label>

        <div className="space-y-2">
          <p className="text-xs text-slate-400">Your interests:</p>
          <div className="flex flex-wrap gap-2">
            {normalizedInterests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {loading && <LoadingSpinner />}

        {message && (
          message.includes('error') || message.includes('Failed') ? (
            <ErrorAlert message={message} retry={message.includes('Failed') ? handleLoad : undefined} />
          ) : (
            <SuccessAlert message={message} />
          )
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold py-3 px-4 transition"
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>

          <button
            onClick={handleLoad}
            disabled={loading}
            className="flex-1 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold py-3 px-4 transition"
          >
            {loading ? 'Loading...' : 'Load Preferences'}
          </button>
        </div>
      </div>
    </div>
  )
}
