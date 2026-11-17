import LZString from 'lz-string'

const STORAGE_KEY = 'saha-squad-v1'

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* quota */
  }
}

export function encodeShare(state) {
  const payload = {
    teamName: state.teamName,
    formation: state.formation,
    players: state.players,
    lineup: state.lineup,
    matches: state.matches,
  }
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload))
}

export function decodeShare(code) {
  try {
    const json = LZString.decompressFromEncodedURIComponent(code)
    if (!json) return null
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function createPlayer(name) {
  return {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    createdAt: Date.now(),
  }
}

export function createMatch(label, playerIds) {
  const ratings = {}
  playerIds.forEach((id) => {
    ratings[id] = null
  })
  return {
    id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    label: label.trim() || `Maç ${new Date().toLocaleDateString('tr-TR')}`,
    date: new Date().toISOString().slice(0, 10),
    ratings,
  }
}

export function getPlayerAvg(playerId, matches) {
  const vals = matches
    .map((m) => m.ratings?.[playerId])
    .filter((r) => r != null && r !== '')
    .map(Number)
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export function getPlayerForm(playerId, matches, lastN = 5) {
  return matches
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({
      match: m.label,
      date: m.date,
      rating: m.ratings?.[playerId] != null && m.ratings[playerId] !== ''
        ? Number(m.ratings[playerId])
        : null,
    }))
    .filter((x) => x.rating != null)
    .slice(-lastN)
}
