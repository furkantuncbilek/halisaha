import { useState } from 'react'
import MatchRatings from './components/MatchRatings'
import Pitch from './components/Pitch'
import PlayerPanel from './components/PlayerPanel'
import ShareBar from './components/ShareBar'
import Stats from './components/Stats'
import { useSquad } from './hooks/useSquad'

const TABS = [
  { id: 'pitch', label: 'Saha' },
  { id: 'ratings', label: 'Reyting' },
  { id: 'stats', label: 'Grafik' },
]

export default function App() {
  const squad = useSquad()
  const { state, shareUrl } = squad
  const [tab, setTab] = useState('pitch')
  const [selected, setSelected] = useState({ side: null, id: null })

  const selectPlayer = (side, id) => {
    if (!id) {
      setSelected({ side: null, id: null })
      return
    }
    setSelected({ side, id })
  }

  const handleAssign = (side, slotId, playerId) => {
    squad.assignSlot(side, slotId, playerId)
    setSelected({ side: null, id: null })
  }

  const selectedName =
    selected.id && selected.side
      ? state[selected.side].players.find((p) => p.id === selected.id)?.name
      : null

  return (
    <div className="app">
      <div className="bg-glow" aria-hidden />
      <div className="bg-grid" aria-hidden />

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <div>
            <h1>SAHA</h1>
            <p>İki takım · Diziliş · Reyting</p>
          </div>
        </div>

        <div className="vs-title" aria-label="Maç">
          <span className="vs-home">
            {state.home.logo && <img src={state.home.logo} alt="" />}
            {state.home.name}
          </span>
          <span className="vs-badge">VS</span>
          <span className="vs-away">
            {state.away.logo && <img src={state.away.logo} alt="" />}
            {state.away.name}
          </span>
        </div>
      </header>

      <ShareBar
        shareUrl={shareUrl}
        state={state}
        readOnly={state.readOnly}
        fromShare={state.fromShare}
        onClone={squad.cloneShared}
        onReset={squad.resetAll}
      />

      <nav className="tabs" aria-label="Bölümler">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'tab is-active' : 'tab'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="main">
        {tab === 'pitch' && (
          <div className="layout-pitch">
            <div className="pitch-column">
              <p className="hint hint-center">
                {selectedName
                  ? `${selectedName} seçili — boş pozisyona dokun veya sahada sürükle.`
                  : 'Oyuncuyu pozisyona koy, sonra sahada sürükleyerek yerini ayarla.'}
              </p>

              <Pitch
                home={state.home}
                away={state.away}
                matches={state.matches}
                readOnly={state.readOnly}
                selectedId={selected.id}
                selectedSide={selected.side}
                onAssign={handleAssign}
                onClear={squad.clearSlot}
                onMove={squad.moveSlot}
                onSelectPlayer={selectPlayer}
              />
            </div>

            <div className="teams-column">
              <PlayerPanel
                side="home"
                team={state.home}
                matches={state.matches}
                bench={squad.bench('home')}
                readOnly={state.readOnly}
                selectedId={selected.id}
                selectedSide={selected.side}
                onAdd={squad.addPlayer}
                onRemove={squad.removePlayer}
                onSelectPlayer={selectPlayer}
                onSetFormation={squad.setFormation}
                onSetTeamName={squad.setTeamName}
                onSetTeamLogo={squad.setTeamLogo}
                onSetPlayerPhoto={squad.setPlayerPhoto}
              />
              <PlayerPanel
                side="away"
                team={state.away}
                matches={state.matches}
                bench={squad.bench('away')}
                readOnly={state.readOnly}
                selectedId={selected.id}
                selectedSide={selected.side}
                onAdd={squad.addPlayer}
                onRemove={squad.removePlayer}
                onSelectPlayer={selectPlayer}
                onSetFormation={squad.setFormation}
                onSetTeamName={squad.setTeamName}
                onSetTeamLogo={squad.setTeamLogo}
                onSetPlayerPhoto={squad.setPlayerPhoto}
              />
            </div>
          </div>
        )}

        {tab === 'ratings' && (
          <MatchRatings
            home={state.home}
            away={state.away}
            matches={state.matches}
            readOnly={state.readOnly}
            onAddMatch={squad.addMatch}
            onRemoveMatch={squad.removeMatch}
            onSetRating={squad.setRating}
            onUpdateMatch={squad.updateMatchMeta}
          />
        )}

        {tab === 'stats' && (
          <Stats home={state.home} away={state.away} matches={state.matches} />
        )}
      </main>

      <footer className="footer">
        <span>SAHA</span>
        <span>İki takımlı halı saha paneli</span>
      </footer>
    </div>
  )
}
