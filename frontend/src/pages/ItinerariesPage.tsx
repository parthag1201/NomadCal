import { useState } from 'react'
import { useTripDrafts } from '../hooks'
import { LoadingSpinner, ErrorAlert, SuccessAlert } from '../components'

export function ItinerariesPage() {
  const [userEmail, setUserEmail] = useState('agarwal.parth25@gmail.com')
  const [statusFilter, setStatusFilter] = useState<'all' | 'suggested' | 'confirmed' | 'completed'>('all')
  const [isCreating, setIsCreating] = useState(false)
  const [newTrip, setNewTrip] = useState({
    destination: 'Goa',
    start_date: '2026-10-02',
    end_date: '2026-10-04',
    budget: 15000,
  })

  const {
    tripDrafts,
    loading,
    message,
    updateTripDraft,
    deleteTripDraft,
    createTripDraft,
    seedDestinations,
  } = useTripDrafts(userEmail, statusFilter)

  const handleCreateTrip = async () => {
    await createTripDraft(
      newTrip.destination,
      newTrip.start_date,
      newTrip.end_date,
      newTrip.budget,
      'Created from frontend'
    )
    setNewTrip({
      destination: 'Goa',
      start_date: '2026-10-02',
      end_date: '2026-10-04',
      budget: 15000,
    })
    setIsCreating(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'suggested':
        return 'bg-sky-900/40 border-sky-700 text-sky-200'
      case 'confirmed':
        return 'bg-emerald-900/40 border-emerald-700 text-emerald-200'
      case 'completed':
        return 'bg-slate-900/40 border-slate-700 text-slate-200'
      default:
        return 'bg-slate-900/40 border-slate-700 text-slate-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'suggested':
        return '💡'
      case 'confirmed':
        return '✓'
      case 'completed':
        return '🎉'
      default:
        return '📌'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Your Itineraries</h1>
        <p className="text-slate-400">Create and manage your trip drafts. Track suggestions, confirmations, and completed trips.</p>
      </div>

      {/* User Section */}
      <div className="frost-card rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-100">User & Settings</h2>

        <div className="grid md:grid-cols-2 gap-4">
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
            <span className="text-sm font-medium text-slate-300">Filter by Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
            >
              <option value="all">All Statuses</option>
              <option value="suggested">Suggested</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => setIsCreating(!isCreating)}
            disabled={loading}
            className="flex-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold py-2 px-3 transition text-sm"
          >
            {isCreating ? '✕ Cancel' : '+ New Trip'}
          </button>

          <button
            onClick={() => seedDestinations()}
            disabled={loading}
            className="flex-1 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold py-2 px-3 transition text-sm"
          >
            Seed Destinations
          </button>
        </div>

        {message && (
          message.includes('error') || message.includes('Failed') ? (
            <ErrorAlert message={message} />
          ) : (
            <SuccessAlert message={message} />
          )
        )}
      </div>

      {/* Create New Trip Form */}
      {isCreating && (
        <div className="frost-card rounded-2xl p-6 space-y-4 border-2 border-cyan-500/50">
          <h2 className="text-lg font-semibold text-slate-100">Create New Trip</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Destination</span>
              <input
                type="text"
                value={newTrip.destination}
                onChange={(e) => setNewTrip((t) => ({ ...t, destination: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
                placeholder="e.g., Goa, Bali, Tokyo"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Budget (INR)</span>
              <input
                type="number"
                value={newTrip.budget}
                onChange={(e) => setNewTrip((t) => ({ ...t, budget: Number(e.target.value) || 0 }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Start Date</span>
              <input
                type="date"
                value={newTrip.start_date}
                onChange={(e) => setNewTrip((t) => ({ ...t, start_date: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">End Date</span>
              <input
                type="date"
                value={newTrip.end_date}
                onChange={(e) => setNewTrip((t) => ({ ...t, end_date: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
              />
            </label>
          </div>

          <button
            onClick={handleCreateTrip}
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold py-3 px-4 transition"
          >
            {loading ? 'Creating...' : 'Create Trip'}
          </button>
        </div>
      )}

      {/* Trip Drafts List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-100">
          {statusFilter !== 'all' ? `${statusFilter.toUpperCase()} Trips` : 'All Trips'}
        </h2>

        {loading && !tripDrafts.length && <LoadingSpinner />}

        {tripDrafts.length === 0 && !loading && (
          <div className="rounded-lg bg-slate-900/50 border border-slate-800 p-6 text-center">
            <p className="text-slate-400">No trips yet. Create one to get started!</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {tripDrafts.map((trip) => (
            <article
              key={trip.id}
              className="frost-card rounded-2xl p-5 space-y-4 hover:border-cyan-700/50 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-100 text-lg">{trip.title}</h3>
                  <p className="text-sm text-slate-400">{trip.destination || 'Custom destination'}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    trip.status
                  )}`}
                >
                  {getStatusIcon(trip.status)} {trip.status}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-slate-400">
                  📅{' '}
                  <span className="text-slate-300">
                    {new Date(trip.start_date).toLocaleDateString()} to{' '}
                    {new Date(trip.end_date).toLocaleDateString()}
                  </span>
                </p>
                <p className="text-sm text-slate-400">
                  ⏱ <span className="text-slate-300">{trip.duration_days} days</span>
                </p>
                {trip.estimated_budget && (
                  <p className="text-sm text-slate-400">
                    💰 <span className="text-slate-300">INR {trip.estimated_budget.toLocaleString()}</span>
                  </p>
                )}
              </div>

              {trip.notes && (
                <div className="rounded-lg bg-slate-900/50 border border-slate-800 p-3">
                  <p className="text-xs text-slate-400 mb-1">Notes</p>
                  <p className="text-sm text-slate-300">{trip.notes}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800">
                {trip.status !== 'confirmed' && (
                  <button
                    onClick={() => updateTripDraft(trip.id, { status: 'confirmed' })}
                    className="flex-1 text-xs rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white py-2 px-3 transition font-medium"
                  >
                    Confirm
                  </button>
                )}

                {trip.status !== 'completed' && (
                  <button
                    onClick={() => updateTripDraft(trip.id, { status: 'completed' })}
                    className="flex-1 text-xs rounded-lg bg-sky-600/80 hover:bg-sky-500 text-white py-2 px-3 transition font-medium"
                  >
                    Complete
                  </button>
                )}

                <button
                  onClick={() => {
                    const notes = window.prompt('Update notes', trip.notes || '')
                    if (notes !== null) {
                      updateTripDraft(trip.id, { notes })
                    }
                  }}
                  className="flex-1 text-xs rounded-lg bg-slate-700/80 hover:bg-slate-600 text-white py-2 px-3 transition font-medium"
                >
                  Edit
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Delete this trip permanently?')) {
                      deleteTripDraft(trip.id)
                    }
                  }}
                  className="flex-1 text-xs rounded-lg bg-rose-700/80 hover:bg-rose-600 text-white py-2 px-3 transition font-medium"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
