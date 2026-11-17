import { useState } from 'react'
import { formatRating, ratingColor } from '../utils/formations'
import { getPlayerAvg } from '../utils/storage'

export default function PlayerPanel({
  players,
  bench,
  matches,
  readOnly,
  selectedId,
  onAdd,
  onRemove,
  onSelectPlayer,
}) {
  const [name, setName] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name)
    setName('')
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Oyuncular</h2>
        <span className="chip">{players.length} kişi</span>
      </div>

      {!readOnly && (
        <form className="add-form" onSubmit={submit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="İsim gir — örn. Emre"
            maxLength={24}
            autoComplete="off"
          />
          <button type="submit" className="btn btn-accent">
            Ekle
          </button>
        </form>
      )}

      <div className="player-list">
        {players.length === 0 && (
          <p className="muted">Henüz oyuncu yok. İsim ekle, sonra sahaya yerleştir.</p>
        )}
        {players.map((p) => {
          const avg = getPlayerAvg(p.id, matches)
          const isBench = bench.some((b) => b.id === p.id)
          const selected = selectedId === p.id
          return (
            <div
              key={p.id}
              className={`player-row ${isBench ? '' : 'player-row--on'} ${selected ? 'player-row--selected' : ''}`}
              draggable={!readOnly}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/player-id', p.id)
                onSelectPlayer?.(p.id)
              }}
              onClick={() => {
                if (readOnly) return
                onSelectPlayer?.(selected ? null : p.id)
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (!readOnly) onSelectPlayer?.(selected ? null : p.id)
                }
              }}
            >
              <div className="player-row-main">
                <span className="player-dot" style={{ background: ratingColor(avg) }} />
                <div>
                  <strong>{p.name}</strong>
                  <small>{selected ? 'Seçili — pozisyona dokun' : isBench ? 'Yedek' : 'Sahada'}</small>
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
                      onRemove(p.id)
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
