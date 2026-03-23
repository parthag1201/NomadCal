import { useState } from 'react'

export type PreferencesPayload = {
  travel_style: 'adventure' | 'relaxation' | 'culture' | 'mixed'
  budget_per_trip: number
  annual_budget: number
  group_type: 'solo' | 'couple' | 'family' | 'friends'
  activity_interests: string[]
  domestic_international: 'domestic' | 'international' | 'both'
  comfort_level: 'backpacker' | 'mid-range' | 'luxury'
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<PreferencesPayload>({
    travel_style: 'adventure',
    budget_per_trip: 12000,
    annual_budget: 90000,
    group_type: 'friends',
    activity_interests: ['trekking', 'beach'],
    domestic_international: 'both',
    comfort_level: 'mid-range',
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const savePreferences = async (userEmail: string, activityInterests: string[]) => {
    setMessage('Saving preferences...')
    setLoading(true)
    try {
      const qs = new URLSearchParams({ user_email: userEmail }).toString()
      const res = await fetch(`/api/preferences/?${qs}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...preferences,
          activity_interests: activityInterests,
        }),
      })
      const body = await res.json()
      if (!res.ok) {
        throw new Error(body?.detail || `API error ${res.status}`)
      }
      setPreferences((p) => ({ ...p, activity_interests: activityInterests }))
      setMessage('Preferences saved successfully.')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to save preferences')
    } finally {
      setLoading(false)
    }
  }

  const loadPreferences = async (userEmail: string) => {
    setMessage('Loading preferences...')
    setLoading(true)
    try {
      const qs = new URLSearchParams({ user_email: userEmail }).toString()
      const res = await fetch(`/api/preferences/?${qs}`)
      const body = await res.json()
      if (!res.ok) {
        throw new Error(body?.detail || `API error ${res.status}`)
      }

      if (body?.exists && body?.preferences) {
        setPreferences(body.preferences as PreferencesPayload)
        setMessage('Preferences loaded.')
        return body.preferences
      } else {
        setMessage(body?.message || 'No preferences found yet.')
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to load preferences')
    } finally {
      setLoading(false)
    }
  }

  return {
    preferences,
    setPreferences,
    loading,
    message,
    savePreferences,
    loadPreferences,
  }
}
