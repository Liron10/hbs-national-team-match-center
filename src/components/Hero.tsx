interface HeroProps {
  windowLabel: string
}

export function Hero({ windowLabel }: HeroProps) {
  return (
    <section className="hero">
      <p className="hero__eyebrow">{windowLabel}</p>
      <h1>האדומים בנבחרות</h1>
      <p className="hero__lede">
        Match Center של נציגי הפועל באר שבע בנבחרות – מי משחק, מתי, ומה קורה על המגרש.
      </p>
    </section>
  )
}
