import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Footer } from './components/Footer'
import { EmptyState } from './components/EmptyState'
import { MatchListSkeleton } from './components/MatchListSkeleton'
import { FilterTabs } from './features/matches/FilterTabs'
import { LiveSpotlight } from './features/matches/LiveSpotlight'
import { MatchList } from './features/matches/MatchList'
import { PlayersGrid } from './features/players/PlayersGrid'
import { getPlayer } from './data/players'
import matchDataset from './data/matches.json'
import { useMatchBoard } from './hooks/useMatchBoard'
import { useMatches } from './hooks/useMatches'
import { useNow } from './hooks/useNow'
import { formatUpdatedAt, formatWindowLabel, latestUpdateIso } from './utils/datetime'
import { deriveBucket, hasLiveMatches } from './utils/matchStatus'
import { sortMatches } from './utils/sortMatches'

export default function App() {
  const now = useNow()
  const { matches, loading, error, refresh } = useMatches()
  const { filter, setFilter, visible, selectedPlayerId, selectPlayer } = useMatchBoard(matches, now)
  const live = hasLiveMatches(matches, now)
  const windowLabel = formatWindowLabel(matchDataset.meta.window)
  const updatedAt = formatUpdatedAt(
    latestUpdateIso(
      matches.map((match) => match.lastUpdated),
      matchDataset.meta.updatedAt,
    ),
  )
  const selectedPlayer = selectedPlayerId ? getPlayer(selectedPlayerId) : undefined
  const spotlight = selectedPlayerId
    ? undefined
    : sortMatches(matches, now).find((match) => {
        const bucket = deriveBucket(match, now)
        return bucket === 'live' || bucket === 'today'
      })

  return (
    <div className="page">
      <div className="page-atmosphere" aria-hidden="true" />
      <div className="app-shell">
        <Header live={live} windowLabel={windowLabel} />
        <main>
          <Hero windowLabel={windowLabel} />
          {import.meta.env.DEV && import.meta.env.VITE_USE_DEMO_DATA === 'true' ? (
            <p className="dev-banner" role="note">
              מוצגים נתוני פיתוח לדוגמה, כולל משחק LIVE. בבילד לפרודקשן הם לא נכללים.
            </p>
          ) : null}
          <PlayersGrid selectedId={selectedPlayerId} onSelect={selectPlayer} />
          {spotlight ? <LiveSpotlight match={spotlight} /> : null}
          <section className="board" aria-labelledby="board-heading">
            <div className="section-heading">
              <h2 id="board-heading">המשחקים</h2>
            </div>
            {selectedPlayer ? (
              <p className="player-filter">
                <span>משחקים של {selectedPlayer.nameHe}</span>
                <button type="button" onClick={() => selectPlayer(selectedPlayer.id)}>
                  הצגת כל המשחקים
                </button>
              </p>
            ) : null}
            <FilterTabs value={filter} onChange={setFilter} liveAvailable={live} />
            {loading ? <MatchListSkeleton /> : null}
            {error ? (
              <EmptyState title="לא ניתן להציג את המשחקים כרגע" description="אפשר לנסות שוב." />
            ) : null}
            {error ? (
              <div className="retry-wrap">
                <button type="button" className="retry-btn" onClick={() => void refresh()}>
                  נסו שוב
                </button>
              </div>
            ) : null}
            {!loading && !error ? (
              <MatchList matches={visible} filter={filter} now={now} />
            ) : null}
            {!loading && !error ? (
              <p className="updated-note">הנתונים עודכנו לאחרונה: {updatedAt}</p>
            ) : null}
          </section>
        </main>
        <Footer />
      </div>
    </div>
  )
}
