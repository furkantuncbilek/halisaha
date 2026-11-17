/** Formasyonlar — y: kendi kalesinden hücuma (0=kale, 100=orta saha civarı) */
export const FORMATIONS = {
  '5v5-2-1-1': {
    label: '5v5 · 2-1-1',
    slots: 5,
    positions: [
      { id: 'gk', role: 'KL', x: 50, y: 4 },
      { id: 'dl', role: 'DS', x: 28, y: 32 },
      { id: 'dr', role: 'DS', x: 72, y: 32 },
      { id: 'cm', role: 'OS', x: 50, y: 62 },
      { id: 'st', role: 'FV', x: 50, y: 94 },
    ],
  },
  '5v5-1-2-1': {
    label: '5v5 · 1-2-1',
    slots: 5,
    positions: [
      { id: 'gk', role: 'KL', x: 50, y: 4 },
      { id: 'cb', role: 'STP', x: 50, y: 32 },
      { id: 'ml', role: 'OS', x: 28, y: 64 },
      { id: 'mr', role: 'OS', x: 72, y: 64 },
      { id: 'st', role: 'FV', x: 50, y: 94 },
    ],
  },
  '6v6-2-2-1': {
    label: '6v6 · 2-2-1',
    slots: 6,
    positions: [
      { id: 'gk', role: 'KL', x: 50, y: 3 },
      { id: 'dl', role: 'DS', x: 28, y: 28 },
      { id: 'dr', role: 'DS', x: 72, y: 28 },
      { id: 'ml', role: 'OS', x: 32, y: 58 },
      { id: 'mr', role: 'OS', x: 68, y: 58 },
      { id: 'st', role: 'FV', x: 50, y: 94 },
    ],
  },
  '7v7-2-3-1': {
    label: '7v7 · 2-3-1',
    slots: 7,
    positions: [
      { id: 'gk', role: 'KL', x: 50, y: 3 },
      { id: 'dl', role: 'DS', x: 30, y: 26 },
      { id: 'dr', role: 'DS', x: 70, y: 26 },
      { id: 'ml', role: 'OS', x: 22, y: 56 },
      { id: 'mc', role: 'OS', x: 50, y: 54 },
      { id: 'mr', role: 'OS', x: 78, y: 56 },
      { id: 'st', role: 'FV', x: 50, y: 94 },
    ],
  },
  '7v7-3-2-1': {
    label: '7v7 · 3-2-1',
    slots: 7,
    positions: [
      { id: 'gk', role: 'KL', x: 50, y: 3 },
      { id: 'dl', role: 'DS', x: 22, y: 26 },
      { id: 'dc', role: 'STP', x: 50, y: 24 },
      { id: 'dr', role: 'DS', x: 78, y: 26 },
      { id: 'ml', role: 'OS', x: 35, y: 58 },
      { id: 'mr', role: 'OS', x: 65, y: 58 },
      { id: 'st', role: 'FV', x: 50, y: 94 },
    ],
  },
}

export const DEFAULT_FORMATIONATION = '5v5-2-1-1'
export const TEAM_KEYS = ['home', 'away']

export function createEmptyLineup(formationKey) {
  const formation = FORMATIONS[formationKey] || FORMATIONS[DEFAULT_FORMATIONATION]
  const lineup = {}
  formation.positions.forEach((pos) => {
    lineup[pos.id] = null
  })
  return lineup
}

/**
 * Ev (alt kale): KL en altta, FV orta sahaya yakın.
 * Deplasman (üst kale): KL en üstte, FV orta sahaya yakın.
 */
export function mapPitchPosition(pos, side) {
  const depth = pos.y * 0.46
  if (side === 'home') {
    return { x: pos.x, y: 98 - depth }
  }
  return { x: 100 - pos.x, y: 2 + depth }
}

export function normalizeSlot(lineupSlot, formationPos, side) {
  if (!lineupSlot) return null
  if (typeof lineupSlot === 'string') {
    const mapped = mapPitchPosition(formationPos, side)
    return { playerId: lineupSlot, x: mapped.x, y: mapped.y }
  }
  return lineupSlot
}

export function getSlotPlayerId(lineupSlot) {
  if (!lineupSlot) return null
  if (typeof lineupSlot === 'string') return lineupSlot
  return lineupSlot.playerId || null
}

/** Dizilişteki oyuncuları formasyon varsayılanına yeniden oturt */
export function realignLineup(lineup, formationKey, side) {
  const formation = FORMATIONS[formationKey] || FORMATIONS[DEFAULT_FORMATIONATION]
  const next = createEmptyLineup(formationKey)
  formation.positions.forEach((pos) => {
    const playerId = getSlotPlayerId(lineup?.[pos.id])
    if (!playerId) return
    const mapped = mapPitchPosition(pos, side)
    next[pos.id] = { playerId, x: mapped.x, y: mapped.y }
  })
  return next
}

export function createTeam(name, formation = DEFAULT_FORMATIONATION) {
  return {
    name,
    logo: null,
    formation,
    players: [],
    lineup: createEmptyLineup(formation),
  }
}

export function clampPitch(x, y) {
  return {
    x: Math.min(94, Math.max(6, x)),
    y: Math.min(94, Math.max(6, y)),
  }
}

export function ratingColor(rating) {
  if (rating == null || rating === '') return 'var(--chalk-dim)'
  const r = Number(rating)
  if (r >= 8.5) return '#b8f53a'
  if (r >= 7.5) return '#7dd87a'
  if (r >= 6.5) return '#f0d060'
  if (r >= 5.5) return '#f0a040'
  return '#e85d5d'
}

export function formatRating(rating) {
  if (rating == null || rating === '') return '—'
  return Number(rating).toFixed(1)
}

export function teamAccent(side) {
  return side === 'home' ? 'home' : 'away'
}
