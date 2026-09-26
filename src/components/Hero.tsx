interface HeroProps {
  windowLabel: string
}

export function Hero({ windowLabel }: HeroProps) {
  return (
    <section className="hero">
      <p className="hero__eyebrow">{windowLabel}</p>
      <h1>האדומים בנבחרות</h1>
      <p className="hero__lede">
        עוקבים אחרי נציגי הפועל באר שבע בנבחרות הלאומיות – המשחקים, התוצאות והביצועים במקום אחד.
      </p>
    </section>
  )
}
