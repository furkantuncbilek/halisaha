import { useState } from 'react'
import MatchRatings from './components/MatchRatings'
import Pitch from './components/Pitch'
import PlayerPanel from './components/PlayerPanel'
import ShareBar from './components/ShareBar'
import Stats from './components/Stats'
import { useSquad } from './hooks/useSquad'
import { FORMATIONS } from './utils/formations'

const TABS = [
  { id: 'pitch', label: 'Saha' },
  { id: 'ratings', label: 'Reyting' },
  { id: 'stats', label: 'Grafik' },
]

export default function App() {
  const squad = useSquad()
  const { state, bench, shareUrl } = squad
  const [tab, setTab] = useState('pitch')
  const [selectedId, setSelectedId] = useState(null)

  const selectedName = state.players.find((p) => p.id === selectedId)?.name

  const handleAssign = (slotId, playerId) => {
    squad.assignSlot(slotId, playerId)
    setSelectedId(null)
  }

  return (
    <div className="app">
      <div className="bg-glow" aria-hidden />
      <div className="bg-grid" aria-hidden />

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <div>
            <h1>SAHA</h1>
            <p>Kadro · Diziliş · Reyting</p>
          </div>
        </div>

        <label className="team-name">
          <span className="sr-only">Takım adı</span>
          <input
            type="text"
            value={state.teamName}
            disabled={state.readOnly}
            onChange={(e) => squad.setTeamName(e.target.value)}
            maxLength={28}
            aria-label="Takım adı"
          />
        </label>
      </header>

      <ShareBar
        shareUrl={shareUrl}
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
              <div className="formation-row">
                <label>
                  Formasyon
                  <select
                    value={state.formation}
                    disabled={state.readOnly}
                    onChange={(e) => squad.setFormation(e.target.value)}
                  >
                    {Object.entries(FORMATIONS).map(([key, f]) => (
                      <option key={key} value={key}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="hint">
                  {selectedName
                    ? `${selectedName} seçili — sahada bir pozisyona dokun.`
                    : 'Oyuncuya dokun/sürükle, sonra pozisyona bırak.'}
                </p>
              </div>

              <Pitch
                formationKey={state.formation}
                lineup={state.lineup}
                players={state.players}
                matches={state.matches}
                readOnly={state.readOnly}
                selectedId={selectedId}
                onAssign={handleAssign}
                onClear={squad.clearSlot}
                onSelectPlayer={setSelectedId}
              />
            </div>

            <PlayerPanel
              players={state.players}
              bench={bench}
              matches={state.matches}
              readOnly={state.readOnly}
              selectedId={selectedId}
              onAdd={squad.addPlayer}
              onRemove={squad.removePlayer}
              onSelectPlayer={setSelectedId}
            />
          </div>
        )}

        {tab === 'ratings' && (
          <MatchRatings
            players={state.players}
            matches={state.matches}
            readOnly={state.readOnly}
            onAddMatch={squad.addMatch}
            onRemoveMatch={squad.removeMatch}
            onSetRating={squad.setRating}
            onUpdateMatch={squad.updateMatchMeta}
          />
        )}

        {tab === 'stats' && (
          <Stats players={state.players} matches={state.matches} />
        )}
      </main>

      <footer className="footer">
        <span>SAHA</span>
        <span>Halı saha kadro & form paneli</span>
      </footer>
    </div>
  )
}
