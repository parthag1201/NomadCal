type PlaceholderPageProps = {
  title: string
  blurb: string
}

function PlaceholderPage({ title, blurb }: PlaceholderPageProps) {
  return (
    <section className="placeholder-page">
      <article className="placeholder-card">
        <p className="placeholder-kicker">Implementation in progress</p>
        <h3>{title}</h3>
        <p>{blurb}</p>
      </article>
    </section>
  )
}

export default PlaceholderPage