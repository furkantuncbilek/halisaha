import { useRef, useState } from 'react'
import {
  FORMATIONS,
  formatRating,
  mapPitchPosition,
  normalizeSlot,
  ratingColor,
} from '../utils/formations'
import { getPlayerAvg } from '../utils/storage'

function TeamSlots({
  side,
  team,
  matches,
  readOnly,
  selectedId,
  selectedSide,
  pitchRef,
  dragPos,
  setDragPos,
  onAssign,
  onClear,
  onMove,
  onSelectPlayer,
}) {
  const formation = FORMATIONS[team.formation]
  const byId = Object.fromEntries(team.players.map((p) => [p.id, p]))
  const canPlace = selectedId && selectedSide === side
  const metaRef = useRef({ active: false, moved: false, slotId: null, startX: 0, startY: 0 })

  const clientToPercent = (clientX, clientY) => {
    const el = pitchRef.current
    if (!el) return { x: 50, y: 50 }
    const rect = el.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    }
  }

  return formation.positions.map((pos) => {
    const entry = normalizeSlot(team.lineup[pos.id], pos, side)
    const defaultPos = mapPitchPosition(pos, side)
    const playerId = entry?.playerId || null
    const player = playerId ? byId[playerId] : null
    const dragging =
      dragPos && dragPos.side === side && dragPos.slotId === pos.id
    const x = dragging ? dragPos.x : entry?.x ?? defaultPos.x
    const y = dragging ? dragPos.y : entry?.y ?? defaultPos.y
    const avg = player ? getPlayerAvg(player.id, matches) : null
    const isTarget = !player && canPlace

    return (
      <div
        key={`${side}-${pos.id}`}
        className={`slot slot--${side} ${player ? 'slot--filled' : 'slot--empty'} ${isTarget ? 'slot--target' : ''} ${dragging ? 'slot--dragging' : ''}`}
        style={{ left: `${x}%`, top: `${y}%` }}
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
            style={{ touchAction: 'none' }}
            onPointerDown={(e) => {
              if (readOnly) return
              e.preventDefault()
              e.currentTarget.setPointerCapture(e.pointerId)
              metaRef.current = {
                active: true,
                moved: false,
                slotId: pos.id,
                startX: e.clientX,
                startY: e.clientY,
              }
              onSelectPlayer?.(side, player.id)
            }}
            onPointerMove={(e) => {
              if (!metaRef.current.active || metaRef.current.slotId !== pos.id) return
              const dx = Math.abs(e.clientX - metaRef.current.startX)
              const dy = Math.abs(e.clientY - metaRef.current.startY)
              if (dx > 5 || dy > 5) metaRef.current.moved = true
              if (!metaRef.current.moved) return
              const pct = clientToPercent(e.clientX, e.clientY)
              setDragPos({ side, slotId: pos.id, x: pct.x, y: pct.y })
            }}
            onPointerUp={(e) => {
              if (!metaRef.current.active || metaRef.current.slotId !== pos.id) return
              const moved = metaRef.current.moved
              metaRef.current = { active: false, moved: false, slotId: null, startX: 0, startY: 0 }
              try {
                e.currentTarget.releasePointerCapture(e.pointerId)
              } catch {
                /* ignore */
              }
              if (moved) {
                const pct = clientToPercent(e.clientX, e.clientY)
                onMove(side, pos.id, pct.x, pct.y)
                setDragPos(null)
                return
              }
              setDragPos(null)
              if (canPlace && selectedId !== player.id) {
                onAssign(side, pos.id, selectedId)
              } else {
                onClear(side, pos.id)
              }
            }}
            onPointerCancel={() => {
              metaRef.current = { active: false, moved: false, slotId: null, startX: 0, startY: 0 }
              setDragPos(null)
            }}
            title={player.name}
          >
            <span
              className={`token-ring ${player.photo ? 'token-ring--photo' : ''}`}
              style={{
                borderColor: ratingColor(avg),
                backgroundImage: player.photo ? `url(${player.photo})` : undefined,
              }}
            />
            {!player.photo && (
              <span className="token-avg" style={{ color: ratingColor(avg) }}>
                {formatRating(avg)}
              </span>
            )}
            {player.photo && avg != null && (
              <span className="token-badge" style={{ background: ratingColor(avg) }}>
                {formatRating(avg)}
              </span>
            )}
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
  onMove,
  onSelectPlayer,
}) {
  const pitchRef = useRef(null)
  const [dragPos, setDragPos] = useState(null)

  return (
    <div className="pitch-wrap" id="saha-pitch-card">
      <div className="pitch-labels">
        <span className="pitch-label pitch-label--away">
          {away.logo && <img src={away.logo} alt="" className="pitch-logo" />}
          {away.name}
        </span>
        <span className="pitch-label pitch-label--home">
          {home.logo && <img src={home.logo} alt="" className="pitch-logo" />}
          {home.name}
        </span>
      </div>
      <div
        className="pitch"
        ref={pitchRef}
        role="img"
        aria-label="İki takımlı halı saha dizilişi"
      >
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
          team={away}
          matches={matches}
          readOnly={readOnly}
          selectedId={selectedId}
          selectedSide={selectedSide}
          pitchRef={pitchRef}
          dragPos={dragPos}
          setDragPos={setDragPos}
          onAssign={onAssign}
          onClear={onClear}
          onMove={onMove}
          onSelectPlayer={onSelectPlayer}
        />
        <TeamSlots
          side="home"
          team={home}
          matches={matches}
          readOnly={readOnly}
          selectedId={selectedId}
          selectedSide={selectedSide}
          pitchRef={pitchRef}
          dragPos={dragPos}
          setDragPos={setDragPos}
          onAssign={onAssign}
          onClear={onClear}
          onMove={onMove}
          onSelectPlayer={onSelectPlayer}
        />
      </div>
    </div>
  )
}
