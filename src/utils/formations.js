/** Halı saha formasyonları — pozisyonlar % (x, y) olarak saha üzerinde */
export const FORMATIONS = {
  '5v5-2-1-1': {
    label: '5v5 · 2-1-1',
    slots: 5,
    positions: [
      { id: 'gk', role: 'KL', x: 50, y: 88 },
      { id: 'dl', role: 'DS', x: 28, y: 68 },
      { id: 'dr', role: 'DS', x: 72, y: 68 },
      { id: 'cm', role: 'OS', x: 50, y: 48 },
      { id: 'st', role: 'FV', x: 50, y: 22 },
    ],
  },
  '5v5-1-2-1': {
    label: '5v5 · 1-2-1',
    slots: 5,
    positions: [
      { id: 'gk', role: 'KL', x: 50, y: 88 },
      { id: 'cb', role: 'STP', x: 50, y: 68 },
      { id: 'ml', role: 'OS', x: 28, y: 45 },
      { id: 'mr', role: 'OS', x: 72, y: 45 },
      { id: 'st', role: 'FV', x: 50, y: 22 },
    ],
  },
  '6v6-2-2-1': {
    label: '6v6 · 2-2-1',
    slots: 6,
    positions: [
      { id: 'gk', role: 'KL', x: 50, y: 90 },
      { id: 'dl', role: 'DS', x: 28, y: 70 },
      { id: 'dr', role: 'DS', x: 72, y: 70 },
      { id: 'ml', role: 'OS', x: 32, y: 45 },
      { id: 'mr', role: 'OS', x: 68, y: 45 },
      { id: 'st', role: 'FV', x: 50, y: 20 },
    ],
  },
  '7v7-2-3-1': {
    label: '7v7 · 2-3-1',
    slots: 7,
    positions: [
      { id: 'gk', role: 'KL', x: 50, y: 92 },
      { id: 'dl', role: 'DS', x: 30, y: 72 },
      { id: 'dr', role: 'DS', x: 70, y: 72 },
      { id: 'ml', role: 'OS', x: 22, y: 48 },
      { id: 'mc', role: 'OS', x: 50, y: 48 },
      { id: 'mr', role: 'OS', x: 78, y: 48 },
      { id: 'st', role: 'FV', x: 50, y: 20 },
    ],
  },
  '7v7-3-2-1': {
    label: '7v7 · 3-2-1',
    slots: 7,
    positions: [
      { id: 'gk', role: 'KL', x: 50, y: 92 },
      { id: 'dl', role: 'DS', x: 22, y: 70 },
      { id: 'dc', role: 'STP', x: 50, y: 72 },
      { id: 'dr', role: 'DS', x: 78, y: 70 },
      { id: 'ml', role: 'OS', x: 35, y: 45 },
      { id: 'mr', role: 'OS', x: 65, y: 45 },
      { id: 'st', role: 'FV', x: 50, y: 20 },
    ],
  },
}

export const DEFAULT_FORMATIONATION = '5v5-2-1-1'

export function createEmptyLineup(formationKey) {
  const formation = FORMATIONS[formationKey] || FORMATIONS[DEFAULT_FORMATIONATION]
  const lineup = {}
  formation.positions.forEach((pos) => {
    lineup[pos.id] = null
  })
  return lineup
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
