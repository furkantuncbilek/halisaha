import { useState } from 'react'
import { ratingColor } from '../utils/formations'

function TeamRatingBlock({ title, side, players, match, readOnly, onSetRating }) {
  if (!players.length) {
    return (
      <div className={`rating-team rating-team--${side}`}>
        <h4>{title}</h4>
        <p className="muted">Oyuncu yok.</p>
      </div>
    )
  }

  return (
    <div className={`rating-team rating-team--${side}`}>
      <h4>{title}</h4>
      <div className="rating-grid">
        {players.map((p) => {
          const val = match.ratings?.[p.id]
          return (
            <label key={p.id} className="rating-cell">
              <span className="rating-cell-name">{p.name}</span>
              {readOnly ? (
                <span className="rating-display" style={{ color: ratingColor(val) }}>
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
                  onChange={(e) => onSetRating(match.id, p.id, e.target.value)}
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
  )
}

export default function MatchRatings({
  home,
  away,
  matches,
  readOnly,
  onAddMatch,
  onRemoveMatch,
  onSetRating,
  onUpdateMatch,
}) {
  const [label, setLabel] = useState('')
  const [openId, setOpenId] = useState(matches.at(-1)?.id || null)
  const totalPlayers = home.players.length + away.players.length

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
            placeholder={`${home.name} vs ${away.name}`}
            maxLength={40}
          />
          <button type="submit" className="btn btn-accent" disabled={totalPlayers === 0}>
            Maç ekle
          </button>
        </form>
      )}

      {totalPlayers === 0 && (
        <p className="muted">Önce her iki takıma oyuncu ekle.</p>
      )}

      <div className="match-list">
        {sorted.map((m) => {
          const open = openId === m.id
          const ids = [...home.players, ...away.players].map((p) => p.id)
          const filled = ids.filter((id) => m.ratings?.[id] != null && m.ratings[id] !== '').length
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
                    {m.date} · {filled}/{ids.length} reyting
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

                  <div className="rating-teams">
                    <TeamRatingBlock
                      title={home.name}
                      side="home"
                      players={home.players}
                      match={m}
                      readOnly={readOnly}
                      onSetRating={onSetRating}
                    />
                    <TeamRatingBlock
                      title={away.name}
                      side="away"
                      players={away.players}
                      match={m}
                      readOnly={readOnly}
                      onSetRating={onSetRating}
                    />
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
