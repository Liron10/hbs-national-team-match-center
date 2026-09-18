export function MatchListSkeleton() {
  return (
    <div className="match-list" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--score" />
          <div className="skeleton skeleton--row" />
        </div>
      ))}
    </div>
  )
}
