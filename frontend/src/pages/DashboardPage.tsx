import { Link } from 'react-router-dom'

const METRICS = [
  { label: 'Preferred Months', value: '2 active', hint: 'March + October windows' },
  { label: 'Draft Readiness', value: 'Live', hint: 'Create and update trip drafts' },
  { label: 'Recommendation Depth', value: '6 targets', hint: 'Budget-aware suggestions' },
]

function DashboardPage() {
  return (
    <section className="dashboard-page">
      <div className="hero-panel">
        <p className="hero-kicker">NomadCal Workspace</p>
        <h3>Plan the year in one command cockpit</h3>
        <p>
          The new UI foundation is now in place. Use this dashboard to navigate
          workflows and open the planner panel for full API-driven trip planning.
        </p>
        <div className="hero-actions">
          <Link to="/planner" className="hero-button hero-button-primary">
            Launch Planner
          </Link>
          <Link to="/itineraries" className="hero-button hero-button-subtle">
            Review Itineraries
          </Link>
        </div>
      </div>

      <div className="metric-grid">
        {METRICS.map((metric, index) => (
          <article
            key={metric.label}
            className="metric-card"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <p>{metric.label}</p>
            <h4>{metric.value}</h4>
            <span>{metric.hint}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default DashboardPage