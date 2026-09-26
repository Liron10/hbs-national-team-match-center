import { useCallback, useEffect, useRef, useState } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Footer } from './components/Footer'
import { EmptyState } from './components/EmptyState'
import { MatchListSkeleton } from './components/MatchListSkeleton'
import { PlayerSheet } from './components/PlayerSheet'
import { WindowStrip } from './components/WindowStrip'
import { FilterTabs } from './features/matches/FilterTabs'
import { LiveSpotlight } from './features/matches/LiveSpotlight'
import { MatchList } from './features/matches/MatchList'
import { PlayersGrid } from './features/players/PlayersGrid'
import { getPlayer } from './data/players'
import matchDataset from './data/matches.json'
import { useMatchBoard } from './hooks/useMatchBoard'
import { useMatches } from './hooks/useMatches'
import { useNow } from './hooks/useNow'
import { boardPulse, liveTabTitle, nextScheduledMatch } from './utils/boardPulse'
import { dayBrief, nextMatchLine } from './utils/fanDay'
import { formatWindowLabel } from './utils/datetime'
import { deriveBucket, hasLiveMatches, isLiveStatus } from './utils/matchStatus'
import { sortMatches } from './utils/sortMatches'

const DEFAULT_TITLE = 'האדומים בנבחרות | הפועל באר שבע'

export default function App() {
  const now = useNow()
  const { matches, loading, error, refresh } = useMatches()
  const {
    filter,
    setFilter,
    openMatches,
    finishedMatches,
    selectedPlayerId,
    selectPlayer,
    clearPlayer,
  } = useMatchBoard(matches, now)
  const [sheetPlayerId, setSheetPlayerId] = useState<string | null>(null)
  const [sheetMatchId, setSheetMatchId] = useState<string | null>(null)
  const scrollYRef = useRef(0)
  const live = hasLiveMatches(matches, now)
  const windowLabel = formatWindowLabel(matchDataset.meta.window)
  const selectedPlayer = selectedPlayerId ? getPlayer(selectedPlayerId) : undefined
  const sheetPlayer = sheetPlayerId ? getPlayer(sheetPlayerId) : undefined
  const pulse = boardPulse(matches, now)
  const nextMatch = nextScheduledMatch(openMatches, now)
  const nextOverall = nextScheduledMatch(matches, now)
  const brief = selectedPlayerId ? null : dayBrief(matches, now)
  const liveOpen = openMatches.filter((match) => isLiveStatus(match.status))
  const restOpen = openMatches.filter(
    (match) => !isLiveStatus(match.status) && match.id !== nextMatch?.id,
  )
  const spotlight = selectedPlayerId
    ? undefined
    : sortMatches(matches, now).find((match) => deriveBucket(match, now) === 'live')
  const showFinished = finishedMatches.length > 0 && (filter === 'all' || filter === 'finished')
  const showOpen = filter !== 'finished'
  const showLiveList = showOpen && liveOpen.length > 0
  const showNext = Boolean(showOpen && nextMatch)
  const showRest = showOpen && restOpen.length > 0
  const showEmptyOpen =
    showOpen && !showLiveList && !showNext && !showRest && (filter !== 'all' || !showFinished)
  const tabs = <FilterTabs value={filter} onChange={setFilter} liveAvailable={live} />

  const openPlayer = useCallback((id: string, matchId: string) => {
    scrollYRef.current = window.scrollY
    setSheetPlayerId(id)
    setSheetMatchId(matchId)
  }, [])

  const closePlayer = useCallback(() => {
    setSheetPlayerId(null)
    setSheetMatchId(null)
    const y = scrollYRef.current
    requestAnimationFrame(() => window.scrollTo(0, y))
  }, [])

  const showMatch = useCallback(
    (matchId: string) => {
      setFilter('all')
      clearPlayer()
      setSheetPlayerId(null)
      setSheetMatchId(null)
      window.setTimeout(() => {
        document.getElementById(`match-${matchId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    },
    [clearPlayer, setFilter],
  )

  useEffect(() => {
    document.title = liveTabTitle(matches) ?? DEFAULT_TITLE
    return () => {
      document.title = DEFAULT_TITLE
    }
  }, [matches])

  useEffect(() => {
    if (!sheetPlayerId) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [sheetPlayerId])

  return (
    <div className="page">
      <div className="page-atmosphere" aria-hidden="true" />
      <div className="app-shell">
        <Header live={live} windowLabel={windowLabel} pulse={pulse} />
        <main>
          <Hero windowLabel={windowLabel} />
          {import.meta.env.DEV && import.meta.env.VITE_USE_DEMO_DATA === 'true' ? (
            <p className="dev-banner" role="note">
              מוצגים נתוני פיתוח לדוגמה, כולל משחק LIVE. בבילד לפרודקשן הם לא נכללים.
            </p>
          ) : null}
          {spotlight ? <LiveSpotlight match={spotlight} /> : null}
          {!spotlight && brief ? (
            <section className="day-brief" aria-label={brief.title}>
              <h2>{brief.title}</h2>
              <p>{brief.line}</p>
            </section>
          ) : null}
          {!loading && !error ? <WindowStrip matches={matches} /> : null}
          <PlayersGrid selectedId={selectedPlayerId} onSelect={selectPlayer} />
          {selectedPlayer ? (
            <p className="player-filter">
              <span>משחקים של {selectedPlayer.nameHe}</span>
              <button type="button" onClick={() => selectPlayer(selectedPlayer.id)}>
                הצגת כל המשחקים
              </button>
            </p>
          ) : null}
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
          {!loading && !error && (showOpen || showFinished) ? tabs : null}
          {!loading && !error && showLiveList ? (
            <section className="board board--live" aria-labelledby="live-heading">
              <div className="section-heading">
                <h2 id="live-heading">LIVE</h2>
              </div>
              <MatchList
                matches={liveOpen}
                allMatches={matches}
                filter="live"
                now={now}
                empty={false}
                onOpenPlayer={openPlayer}
              />
            </section>
          ) : null}
          {!loading && !error && showNext && nextMatch ? (
            <section className="board board--next" aria-labelledby="next-heading">
              <div className="section-heading">
                <h2 id="next-heading">המשחק הקרוב</h2>
              </div>
              <MatchList
                matches={[nextMatch]}
                allMatches={matches}
                filter="upcoming"
                now={now}
                empty={false}
                nextMatchId={nextMatch.id}
                onOpenPlayer={openPlayer}
              />
            </section>
          ) : null}
          {!loading && !error && showEmptyOpen ? (
            <section className="board">
              {filter === 'all' || filter === 'today' ? (
                <EmptyState
                  title="אין משחקים היום"
                  description={nextOverall ? nextMatchLine(nextOverall, now) : undefined}
                />
              ) : (
                <MatchList
                  matches={[]}
                  allMatches={matches}
                  filter={filter}
                  now={now}
                  onOpenPlayer={openPlayer}
                />
              )}
            </section>
          ) : null}
          {!loading && !error && showRest ? (
            <section className="board" aria-labelledby="board-heading">
              <div className="section-heading">
                <h2 id="board-heading">{showNext || showLiveList ? 'עוד משחקים' : 'המשחקים'}</h2>
              </div>
              <MatchList
                matches={restOpen}
                allMatches={matches}
                filter={filter === 'all' ? 'upcoming' : filter}
                now={now}
                empty={false}
                onOpenPlayer={openPlayer}
              />
            </section>
          ) : null}
          {!loading && !error && showFinished ? (
            <section className="board" aria-labelledby="finished-heading">
              <div className="section-heading">
                <h2 id="finished-heading">משחקים שהסתיימו</h2>
              </div>
              <MatchList
                matches={finishedMatches}
                allMatches={matches}
                filter="finished"
                now={now}
                empty={false}
                onOpenPlayer={openPlayer}
              />
            </section>
          ) : null}
        </main>
        <Footer />
      </div>
      {sheetPlayer ? (
        <PlayerSheet
          player={sheetPlayer}
          matches={matches}
          matchId={sheetMatchId}
          now={now}
          onClose={closePlayer}
          onShowMatch={showMatch}
        />
      ) : null}
    </div>
  )
}
