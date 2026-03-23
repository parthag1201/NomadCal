import { useEffect, useState } from 'react'

export type TripDraft = {
  id: string
  title: string
  destination: string | null
  start_date: string
  end_date: string
  duration_days: number
  estimated_budget: number | null
  status: 'suggested' | 'confirmed' | 'completed'
  notes: string | null
}

export type TripDraftsResponse = {
  count: number
  trips: TripDraft[]
}

export function useTripDrafts(userEmail: string, statusFilter: 'all' | 'suggested' | 'confirmed' | 'completed' = 'all') {
  const [tripDrafts, setTripDrafts] = useState<TripDraft[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const loadTripDrafts = async () => {
    setMessage('Loading trip drafts...')
    setLoading(true)
    try {
      const params = new URLSearchParams({ user_email: userEmail, limit: '20' })
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      const qs = params.toString()
      const res = await fetch(`/api/trips?${qs}`)
      const body = (await res.json()) as TripDraftsResponse | { detail?: string }
      if (!res.ok) {
        throw new Error((body as { detail?: string }).detail || `API error ${res.status}`)
      }
      const typed = body as TripDraftsResponse
      setTripDrafts(typed.trips || [])
      setMessage(`Loaded ${typed.count} draft(s).`)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to load trip drafts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadTripDrafts()
  }, [userEmail, statusFilter])

  const updateTripDraft = async (
    tripId: string,
    patch: { status?: 'suggested' | 'confirmed' | 'completed'; notes?: string }
  ) => {
    setMessage('Updating draft...')
    try {
      const qs = new URLSearchParams({ user_email: userEmail }).toString()
      const res = await fetch(`/api/trips/${tripId}?${qs}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const body = await res.json()
      if (!res.ok) {
        throw new Error(body?.detail || `API error ${res.status}`)
      }
      setMessage(`Draft updated: ${body.status}`)
      await loadTripDrafts()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to update draft')
    }
  }

  const deleteTripDraft = async (tripId: string) => {
    setMessage('Deleting draft...')
    try {
      const qs = new URLSearchParams({ user_email: userEmail }).toString()
      const res = await fetch(`/api/trips/${tripId}?${qs}`, { method: 'DELETE' })
      const body = await res.json()
      if (!res.ok) {
        throw new Error(body?.detail || `API error ${res.status}`)
      }
      setMessage(`Draft deleted: ${body.id}`)
      await loadTripDrafts()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to delete draft')
    }
  }

  const createTripDraft = async (
    destination: string,
    startDate: string,
    endDate: string,
    budget: number,
    notes: string = ''
  ) => {
    setMessage('Creating trip draft...')
    try {
      const qs = new URLSearchParams({ user_email: userEmail }).toString()
      const res = await fetch(`/api/trips/draft?${qs}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          start_date: startDate,
          end_date: endDate,
          estimated_budget: budget,
          notes: notes || 'Generated from frontend',
        }),
      })
      const body = await res.json()
      if (!res.ok) {
        throw new Error(body?.detail || `API error ${res.status}`)
      }
      setMessage(`Draft created: ${body.id}`)
      await loadTripDrafts()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to create trip draft')
    }
  }

  const seedDestinations = async () => {
    setMessage('Seeding destinations...')
    try {
      const res = await fetch('/api/trips/seed-destinations', { method: 'POST' })
      const body = await res.json()
      if (!res.ok) {
        throw new Error(body?.detail || `API error ${res.status}`)
      }
      setMessage(`Destinations inserted: ${body.inserted}/${body.total_in_file}`)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to seed destinations')
    }
  }

  return {
    tripDrafts,
    loading,
    message,
    loadTripDrafts,
    updateTripDraft,
    deleteTripDraft,
    createTripDraft,
    seedDestinations,
  }
}
