import { useState } from 'react'
import { ratingColor } from '../utils/formations'

export default function MatchRatings({
  players,
  matches,
  readOnly,
  onAddMatch,
  onRemoveMatch,
  onSetRating,
  onUpdateMatch,
}) {
  const [label, setLabel] = useState('')
  const [openId, setOpenId] = useState(matches.at(-1)?.id || null)

  const submit = (e) => {
    e.preventDefault()
    onAddMatch(label)
    setLabel('')
  }

  const sorted = [...matches].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Maç Reytingleri</h2>
        <span className="chip">{matches.length} maç</span>
      </div>

      {!readOnly && (
        <form className="add-form" onSubmit={submit}>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Maç adı — örn. Perşembe 22:00"
            maxLength={40}
          />
          <button type="submit" className="btn btn-accent" disabled={players.length === 0}>
            Maç ekle
          </button>
        </form>
      )}

      {players.length === 0 && (
        <p className="muted">Önce oyuncu ekle, sonra maç reytingi gir.</p>
      )}

      <div className="match-list">
        {sorted.map((m) => {
          const open = openId === m.id
          const filled = Object.values(m.ratings || {}).filter((r) => r != null && r !== '').length
          return (
            <div key={m.id} className={`match-card ${open ? 'is-open' : ''}`}>
              <button
                type="button"
                className="match-card-head"
                onClick={() => setOpenId(open ? null : m.id)}
              >
                <div>
                  <strong>{m.label}</strong>
                  <small>
                    {m.date} · {filled}/{players.length} reyting
                  </small>
                </div>
                <span className="chev">{open ? '▾' : '▸'}</span>
              </button>

              {open && (
                <div className="match-card-body">
                  {!readOnly && (
                    <div className="match-meta">
                      <label>
                        Tarih
                        <input
                          type="date"
                          value={m.date}
                          onChange={(e) => onUpdateMatch(m.id, { date: e.target.value })}
                        />
                      </label>
                      <label>
                        İsim
                        <input
                          type="text"
                          value={m.label}
                          onChange={(e) => onUpdateMatch(m.id, { label: e.target.value })}
                        />
                      </label>
                      <button
                        type="button"
                        className="btn btn-ghost danger"
                        onClick={() => onRemoveMatch(m.id)}
                      >
                        Maçı sil
                      </button>
                    </div>
                  )}

                  <div className="rating-grid">
                    {players.map((p) => {
                      const val = m.ratings?.[p.id]
                      return (
                        <label key={p.id} className="rating-cell">
                          <span className="rating-cell-name">{p.name}</span>
                          {readOnly ? (
                            <span
                              className="rating-display"
                              style={{ color: ratingColor(val) }}
                            >
                              {val != null && val !== '' ? Number(val).toFixed(1) : '—'}
                            </span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              inputMode="decimal"
                              placeholder="0–10"
                              value={val ?? ''}
                              onChange={(e) => onSetRating(m.id, p.id, e.target.value)}
                              style={{
                                borderColor: val != null && val !== '' ? ratingColor(val) : undefined,
                              }}
                            />
                          )}
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
