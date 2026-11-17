/** Formasyonlar — y: kendi kalesinden ortaya (0–100), x: sol–sağ */
export const FORMATIONS = {
  '5v5-2-1-1': {
    label: '5v5 · 2-1-1',
    slots: 5,
    positions: [
      { id: 'gk', role: 'KL', x: 50, y: 8 },
      { id: 'dl', role: 'DS', x: 28, y: 38 },
      { id: 'dr', role: 'DS', x: 72, y: 38 },
      { id: 'cm', role: 'OS', x: 50, y: 62 },
      { id: 'st', role: 'FV', x: 50, y: 88 },
    ],
  },
  '5v5-1-2-1': {
    label: '5v5 · 1-2-1',
    slots: 5,
    positions: [
      { id: 'gk', role: 'KL', x: 50, y: 8 },
      { id: 'cb', role: 'STP', x: 50, y: 38 },
      { id: 'ml', role: 'OS', x: 28, y: 62 },
      { id: 'mr', role: 'OS', x: 72, y: 62 },
      { id: 'st', role: 'FV', x: 50, y: 88 },
    ],
  },
  '6v6-2-2-1': {
    label: '6v6 · 2-2-1',
    slots: 6,
    positions: [
      { id: 'gk', role: 'KL', x: 50, y: 6 },
      { id: 'dl', role: 'DS', x: 28, y: 32 },
      { id: 'dr', role: 'DS', x: 72, y: 32 },
      { id: 'ml', role: 'OS', x: 32, y: 58 },
      { id: 'mr', role: 'OS', x: 68, y: 58 },
      { id: 'st', role: 'FV', x: 50, y: 88 },
    ],
  },
  '7v7-2-3-1': {
    label: '7v7 · 2-3-1',
    slots: 7,
    positions: [
      { id: 'gk', role: 'KL', x: 50, y: 5 },
      { id: 'dl', role: 'DS', x: 30, y: 30 },
      { id: 'dr', role: 'DS', x: 70, y: 30 },
      { id: 'ml', role: 'OS', x: 22, y: 58 },
      { id: 'mc', role: 'OS', x: 50, y: 55 },
      { id: 'mr', role: 'OS', x: 78, y: 58 },
      { id: 'st', role: 'FV', x: 50, y: 88 },
    ],
  },
  '7v7-3-2-1': {
    label: '7v7 · 3-2-1',
    slots: 7,
    positions: [
      { id: 'gk', role: 'KL', x: 50, y: 5 },
      { id: 'dl', role: 'DS', x: 22, y: 30 },
      { id: 'dc', role: 'STP', x: 50, y: 28 },
      { id: 'dr', role: 'DS', x: 78, y: 30 },
      { id: 'ml', role: 'OS', x: 35, y: 58 },
      { id: 'mr', role: 'OS', x: 65, y: 58 },
      { id: 'st', role: 'FV', x: 50, y: 88 },
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

/** Ev sahibi: alt yarı. Deplasman: üst yarı (ayna). */
export function mapPitchPosition(pos, side) {
  const half = pos.y * 0.46
  if (side === 'home') {
    return { x: pos.x, y: 52 + half }
  }
  return { x: 100 - pos.x, y: 48 - half }
}

export function createTeam(name, formation = DEFAULT_FORMATIONATION) {
  return {
    name,
    formation,
    players: [],
    lineup: createEmptyLineup(formation),
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
