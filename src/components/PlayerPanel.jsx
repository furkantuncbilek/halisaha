import { useState } from 'react'
import { formatRating, ratingColor } from '../utils/formations'
import { getPlayerAvg } from '../utils/storage'

export default function PlayerPanel({
  players,
  bench,
  matches,
  readOnly,
  onAdd,
  onRemove,
  onDragStartPlayer,
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
          <p className="muted">Henüz oyuncu yok. İsim ekleyip sahaya sürükle.</p>
        )}
        {players.map((p) => {
          const avg = getPlayerAvg(p.id, matches)
          const isBench = bench.some((b) => b.id === p.id)
          return (
            <div
              key={p.id}
              className={`player-row ${isBench ? '' : 'player-row--on'}`}
              draggable={!readOnly}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/player-id', p.id)
                onDragStartPlayer?.(p.id)
              }}
            >
              <div className="player-row-main">
                <span className="player-dot" style={{ background: ratingColor(avg) }} />
                <div>
                  <strong>{p.name}</strong>
                  <small>{isBench ? 'Yedek' : 'Sahada'}</small>
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
                    onClick={() => onRemove(p.id)}
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
