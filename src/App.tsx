import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Footer } from './components/Footer'
import { EmptyState } from './components/EmptyState'
import { MatchListSkeleton } from './components/MatchListSkeleton'
import { FilterTabs } from './features/matches/FilterTabs'
import { LiveSpotlight } from './features/matches/LiveSpotlight'
import { MatchList } from './features/matches/MatchList'
import { useMatchBoard } from './hooks/useMatchBoard'
import { useMatches } from './hooks/useMatches'
import { useNow } from './hooks/useNow'
import { deriveBucket, hasLiveMatches } from './utils/matchStatus'
import { sortMatches } from './utils/sortMatches'

export default function App() {
  const now = useNow()
  const { matches, loading, error, refresh } = useMatches()
  const { filter, setFilter, visible } = useMatchBoard(matches, now)
  const live = hasLiveMatches(matches, now)
  const spotlight = sortMatches(matches, now).find((match) => {
    const bucket = deriveBucket(match, now)
    return bucket === 'live' || bucket === 'today'
  })

  return (
    <div className="app-shell">
      <Header live={live} />
      <main>
        <Hero />
        {import.meta.env.DEV && import.meta.env.VITE_USE_DEMO_DATA === 'true' ? (
          <p className="dev-banner" role="note">
            מוצגים נתוני פיתוח לדוגמה, כולל משחק LIVE. בבילד לפרודקשן הם לא נכללים.
          </p>
        ) : null}
        {spotlight ? <LiveSpotlight match={spotlight} /> : null}
        <section className="board" aria-labelledby="board-heading">
          <div className="section-heading">
            <h2 id="board-heading">לוח המשחקים</h2>
            <p>מיון: LIVE, היום, קרובים, ואז משחקים שהסתיימו מהחדש לישן.</p>
          </div>
          <FilterTabs value={filter} onChange={setFilter} liveAvailable={live} />
          {loading ? <MatchListSkeleton /> : null}
          {error ? (
            <EmptyState
              title="שגיאה במשיכת נתונים"
              description={`${error} אפשר לנסות שוב.`}
            />
          ) : null}
          {error ? (
            <div className="retry-wrap">
              <button type="button" className="retry-btn" onClick={() => void refresh()}>
                נסו שוב
              </button>
            </div>
          ) : null}
          {!loading && !error ? <MatchList matches={visible} filter={filter} now={now} /> : null}
        </section>
      </main>
      <Footer />
    </div>
  )
}
