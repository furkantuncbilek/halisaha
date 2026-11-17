import { useState } from 'react'
import { FORMATIONS, formatRating, ratingColor } from '../utils/formations'
import { getPlayerAvg } from '../utils/storage'

export default function PlayerPanel({
  side,
  team,
  matches,
  bench,
  readOnly,
  selectedId,
  selectedSide,
  onAdd,
  onRemove,
  onSelectPlayer,
  onSetFormation,
  onSetTeamName,
}) {
  const [name, setName] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(side, name)
    setName('')
  }

  return (
    <section className={`panel panel--${side}`}>
      <div className="panel-head">
        <h2>{side === 'home' ? 'Ev' : 'Deplasman'}</h2>
        <span className={`chip chip--${side}`}>{team.players.length} kişi</span>
      </div>

      <div className="team-controls">
        <label>
          Takım adı
          <input
            type="text"
            value={team.name}
            disabled={readOnly}
            maxLength={24}
            onChange={(e) => onSetTeamName(side, e.target.value)}
          />
        </label>
        <label>
          Formasyon
          <select
            value={team.formation}
            disabled={readOnly}
            onChange={(e) => onSetFormation(side, e.target.value)}
          >
            {Object.entries(FORMATIONS).map(([key, f]) => (
              <option key={key} value={key}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!readOnly && (
        <form className="add-form" onSubmit={submit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Oyuncu ismi"
            maxLength={24}
            autoComplete="off"
          />
          <button type="submit" className={`btn btn-accent btn--${side}`}>
            Ekle
          </button>
        </form>
      )}

      <div className="player-list">
        {team.players.length === 0 && (
          <p className="muted">Bu takıma oyuncu ekle.</p>
        )}
        {team.players.map((p) => {
          const avg = getPlayerAvg(p.id, matches)
          const isBench = bench.some((b) => b.id === p.id)
          const selected = selectedId === p.id && selectedSide === side
          return (
            <div
              key={p.id}
              className={`player-row player-row--${side} ${isBench ? '' : 'player-row--on'} ${selected ? 'player-row--selected' : ''}`}
              draggable={!readOnly}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/player-id', p.id)
                e.dataTransfer.setData('text/team-side', side)
                onSelectPlayer?.(side, p.id)
              }}
              onClick={() => {
                if (readOnly) return
                onSelectPlayer?.(side, selected ? null : p.id)
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (!readOnly) onSelectPlayer?.(side, selected ? null : p.id)
                }
              }}
            >
              <div className="player-row-main">
                <span className="player-dot" style={{ background: ratingColor(avg) }} />
                <div>
                  <strong>{p.name}</strong>
                  <small>
                    {selected ? 'Seçili — kendi sahasına koy' : isBench ? 'Yedek' : 'Sahada'}
                  </small>
                </div>
              </div>
              <div className="player-row-meta">
                <span className="rating-pill" style={{ color: ratingColor(avg) }}>
                  {formatRating(avg)}
                </span>
                {!readOnly && (
                  <button
                    type="button"
                    className="btn-icon"
                    aria-label="Sil"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemove(side, p.id)
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
