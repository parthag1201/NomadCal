import { useEffect, useState } from 'react'

export type Recommendation = {
  name: string
  country: string
  state: string | null
  dest_type: string
  avg_cost_per_day: number | null
  activities: string[]
  tags: string[]
  score: number
}

export type RecommendationsResponse = {
  year: number
  suggestions: Recommendation[]
}

export function useRecommendations(
  year: number,
  selectedMonths: string[],
  budgetPerTrip: number,
  interests: string[]
) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true)
      try {
        const recParams = new URLSearchParams({
          year: String(year),
          budget_per_trip: String(budgetPerTrip),
          max_results: '6',
        })
        selectedMonths.forEach((m) => recParams.append('preferred_months', m))
        interests.forEach((i) => recParams.append('interests', i))

        const res = await fetch(`/api/trips/recommendations?${recParams.toString()}`)
        if (res.ok) {
          const recJson = (await res.json()) as RecommendationsResponse
          setRecommendations(recJson.suggestions || [])
        } else {
          setRecommendations([])
        }
      } catch (e) {
        console.error('Failed to fetch recommendations:', e)
        setRecommendations([])
      } finally {
        setLoading(false)
      }
    }

    void fetchRecommendations()
  }, [year, selectedMonths, budgetPerTrip, interests])

  return { recommendations, loading }
}
