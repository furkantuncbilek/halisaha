import { FORMATIONS, formatRating, ratingColor } from '../utils/formations'
import { getPlayerAvg } from '../utils/storage'

export default function Pitch({
  formationKey,
  lineup,
  players,
  matches,
  readOnly,
  onAssign,
  onClear,
  draggingId,
  onDragStartPlayer,
}) {
  const formation = FORMATIONS[formationKey]
  const byId = Object.fromEntries(players.map((p) => [p.id, p]))

  const handleDrop = (e, slotId) => {
    e.preventDefault()
    const playerId = e.dataTransfer.getData('text/player-id') || draggingId
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

          return (
            <div
              key={pos.id}
              className={`slot ${player ? 'slot--filled' : 'slot--empty'}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, pos.id)}
            >
              {player ? (
                <button
                  type="button"
                  className="token"
                  draggable={!readOnly}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/player-id', player.id)
                    onDragStartPlayer?.(player.id)
                  }}
                  onClick={() => !readOnly && onClear(pos.id)}
                  title={readOnly ? player.name : `${player.name} — kaldırmak için dokun`}
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
                  <span className="slot-hint">{readOnly ? 'Boş' : 'Bırak'}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
