import { useRef, useState } from 'react'
import { FORMATIONS, formatRating, ratingColor } from '../utils/formations'
import { compressImage } from '../utils/image'
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
  onSetTeamLogo,
  onSetPlayerPhoto,
}) {
  const [name, setName] = useState('')
  const logoInputRef = useRef(null)

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(side, name)
    setName('')
  }

  const onLogoPick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const data = await compressImage(file, 180, 0.75)
      onSetTeamLogo(side, data)
    } catch {
      alert('Fotoğraf eklenemedi')
    }
  }

  const onPlayerPhoto = async (playerId, file) => {
    if (!file) return
    try {
      const data = await compressImage(file, 160, 0.72)
      onSetPlayerPhoto(side, playerId, data)
    } catch {
      alert('Oyuncu fotoğrafı eklenemedi')
    }
  }

  return (
    <section className={`panel panel--${side}`}>
      <div className="panel-head">
        <h2>{side === 'home' ? 'Ev' : 'Deplasman'}</h2>
        <span className={`chip chip--${side}`}>{team.players.length} kişi</span>
      </div>

      <div className="team-identity">
        <button
          type="button"
          className={`team-logo-btn team-logo-btn--${side}`}
          disabled={readOnly}
          onClick={() => logoInputRef.current?.click()}
          title="Takım logosu / fotoğraf"
        >
          {team.logo ? (
            <img src={team.logo} alt="" />
          ) : (
            <span>+</span>
          )}
        </button>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={onLogoPick}
        />
        <div className="team-controls">
          <label>
            Takım adı
            <input
              type="text"
              value={team.name}
              disabled={readOnly}
              maxLength={24}
              onChange={(e) => onSetTeamName(side, e.target.value)}
              placeholder="Takım ismi"
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
          {!readOnly && team.logo && (
            <button
              type="button"
              className="btn btn-ghost btn-slim"
              onClick={() => onSetTeamLogo(side, null)}
            >
              Logoyu kaldır
            </button>
          )}
        </div>
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
          <p className="muted">Bu takıma oyuncu ekle. İstersen fotoğraf da ekle.</p>
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
                <label
                  className="player-avatar"
                  onClick={(e) => e.stopPropagation()}
                  title={readOnly ? p.name : 'Fotoğraf ekle'}
                >
                  {p.photo ? (
                    <img src={p.photo} alt="" />
                  ) : (
                    <span style={{ background: ratingColor(avg) }} />
                  )}
                  {!readOnly && (
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        e.target.value = ''
                        onPlayerPhoto(p.id, file)
                      }}
                    />
                  )}
                </label>
                <div>
                  <strong>{p.name}</strong>
                  <small>
                    {selected
                      ? 'Seçili — pozisyona koy / sürükle'
                      : isBench
                        ? 'Yedek'
                        : 'Sahada · sürükleyerek ayarla'}
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
