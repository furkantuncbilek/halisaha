import { FORMATIONS, formatRating, ratingColor } from '../utils/formations'
import { getPlayerAvg } from '../utils/storage'

export default function Pitch({
  formationKey,
  lineup,
  players,
  matches,
  readOnly,
  selectedId,
  onAssign,
  onClear,
  onSelectPlayer,
}) {
  const formation = FORMATIONS[formationKey]
  const byId = Object.fromEntries(players.map((p) => [p.id, p]))

  const placeOnSlot = (slotId) => {
    if (readOnly) return
    if (selectedId) {
      onAssign(slotId, selectedId)
      return
    }
  }

  const handleDrop = (e, slotId) => {
    e.preventDefault()
    const playerId = e.dataTransfer.getData('text/player-id') || selectedId
    if (playerId && !readOnly) onAssign(slotId, playerId)
  }

  return (
    <div className="pitch-wrap">
      <div className="pitch" role="img" aria-label="Halı saha dizilişi">
        <div className="pitch-grass" />
        <div className="pitch-markings">
          <div className="pitch-outline" />
          <div className="pitch-halfway" />
          <div className="pitch-circle" />
          <div className="pitch-spot pitch-spot-c" />
          <div className="pitch-box pitch-box-top" />
          <div className="pitch-box pitch-box-bottom" />
          <div className="pitch-goal pitch-goal-top" />
          <div className="pitch-goal pitch-goal-bottom" />
        </div>

        {formation.positions.map((pos) => {
          const playerId = lineup[pos.id]
          const player = playerId ? byId[playerId] : null
          const avg = player ? getPlayerAvg(player.id, matches) : null
          const isTarget = !player && !!selectedId

          return (
            <div
              key={pos.id}
              className={`slot ${player ? 'slot--filled' : 'slot--empty'} ${isTarget ? 'slot--target' : ''}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, pos.id)}
              onClick={() => {
                if (!player) placeOnSlot(pos.id)
              }}
            >
              {player ? (
                <button
                  type="button"
                  className={`token ${selectedId === player.id ? 'token--selected' : ''}`}
                  draggable={!readOnly}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/player-id', player.id)
                    onSelectPlayer?.(player.id)
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (readOnly) return
                    if (selectedId && selectedId !== player.id) {
                      onAssign(pos.id, selectedId)
                      return
                    }
                    onClear(pos.id)
                  }}
                  title={
                    readOnly
                      ? player.name
                      : selectedId
                        ? 'Seçili oyuncuyu buraya koy'
                        : `${player.name} — kaldırmak için dokun`
                  }
                >
                  <span className="token-ring" style={{ borderColor: ratingColor(avg) }} />
                  <span className="token-avg" style={{ color: ratingColor(avg) }}>
                    {formatRating(avg)}
                  </span>
                  <span className="token-name">{player.name}</span>
                  <span className="token-role">{pos.role}</span>
                </button>
              ) : (
                <div className="slot-empty">
                  <span className="slot-role">{pos.role}</span>
                  <span className="slot-hint">
                    {readOnly ? 'Boş' : selectedId ? 'Koy' : 'Boş'}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
