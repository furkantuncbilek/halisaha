import { FORMATIONS, formatRating, mapPitchPosition, ratingColor } from '../utils/formations'
import { getPlayerAvg } from '../utils/storage'

function TeamSlots({
  side,
  formationKey,
  lineup,
  players,
  matches,
  readOnly,
  selectedId,
  selectedSide,
  onAssign,
  onClear,
  onSelectPlayer,
}) {
  const formation = FORMATIONS[formationKey]
  const byId = Object.fromEntries(players.map((p) => [p.id, p]))
  const canPlace = selectedId && selectedSide === side

  return formation.positions.map((pos) => {
    const mapped = mapPitchPosition(pos, side)
    const playerId = lineup[pos.id]
    const player = playerId ? byId[playerId] : null
    const avg = player ? getPlayerAvg(player.id, matches) : null
    const isTarget = !player && canPlace

    return (
      <div
        key={`${side}-${pos.id}`}
        className={`slot slot--${side} ${player ? 'slot--filled' : 'slot--empty'} ${isTarget ? 'slot--target' : ''}`}
        style={{ left: `${mapped.x}%`, top: `${mapped.y}%` }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const id = e.dataTransfer.getData('text/player-id') || selectedId
          const from = e.dataTransfer.getData('text/team-side') || selectedSide
          if (id && from === side && !readOnly) onAssign(side, pos.id, id)
        }}
        onClick={() => {
          if (!player && canPlace && !readOnly) onAssign(side, pos.id, selectedId)
        }}
      >
        {player ? (
          <button
            type="button"
            className={`token token--${side} ${selectedId === player.id ? 'token--selected' : ''}`}
            draggable={!readOnly}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/player-id', player.id)
              e.dataTransfer.setData('text/team-side', side)
              onSelectPlayer?.(side, player.id)
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (readOnly) return
              if (canPlace && selectedId !== player.id) {
                onAssign(side, pos.id, selectedId)
                return
              }
              onClear(side, pos.id)
            }}
            title={player.name}
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
            <span className="slot-hint">{readOnly ? 'Boş' : canPlace ? 'Koy' : 'Boş'}</span>
          </div>
        )}
      </div>
    )
  })
}

export default function Pitch({
  home,
  away,
  matches,
  readOnly,
  selectedId,
  selectedSide,
  onAssign,
  onClear,
  onSelectPlayer,
}) {
  return (
    <div className="pitch-wrap">
      <div className="pitch-labels">
        <span className="pitch-label pitch-label--away">{away.name}</span>
        <span className="pitch-label pitch-label--home">{home.name}</span>
      </div>
      <div className="pitch" role="img" aria-label="İki takımlı halı saha dizilişi">
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

        <TeamSlots
          side="away"
          formationKey={away.formation}
          lineup={away.lineup}
          players={away.players}
          matches={matches}
          readOnly={readOnly}
          selectedId={selectedId}
          selectedSide={selectedSide}
          onAssign={onAssign}
          onClear={onClear}
          onSelectPlayer={onSelectPlayer}
        />
        <TeamSlots
          side="home"
          formationKey={home.formation}
          lineup={home.lineup}
          players={home.players}
          matches={matches}
          readOnly={readOnly}
          selectedId={selectedId}
          selectedSide={selectedSide}
          onAssign={onAssign}
          onClear={onClear}
          onSelectPlayer={onSelectPlayer}
        />
      </div>
    </div>
  )
}
