import LZString from 'lz-string'
import {
  DEFAULT_FORMATIONATION,
  createEmptyLineup,
  createTeam,
  realignLineup,
} from './formations'

const STORAGE_KEY = 'saha-squad-v3'
const LEGACY_KEYS = ['saha-squad-v2', 'saha-squad-v1']

export function defaultState() {
  return {
    home: createTeam('Ev'),
    away: createTeam('Deplasman'),
    matches: [],
  }
}

function fixTeam(team, side, fallbackName) {
  const formation = team?.formation || DEFAULT_FORMATIONATION
  const name =
    !team?.name || team.name === 'Ev Sahibi' || team.name === 'Ekibimiz'
      ? fallbackName
      : team.name
  return {
    logo: team?.logo ?? null,
    ...team,
    name,
    formation,
    players: team?.players || [],
    lineup: realignLineup(team?.lineup, formation, side),
  }
}

function migrateLegacy(legacy) {
  if (!legacy) return null
  if (legacy.home && legacy.away) {
    return {
      home: fixTeam(legacy.home, 'home', 'Ev'),
      away: fixTeam(legacy.away, 'away', 'Deplasman'),
      matches: legacy.matches || [],
    }
  }
  if (!legacy.players && !legacy.teamName) return null
  return {
    home: fixTeam(
      {
        name: legacy.teamName || 'Ev',
        formation: legacy.formation || DEFAULT_FORMATIONATION,
        players: legacy.players || [],
        lineup: legacy.lineup || createEmptyLineup(legacy.formation || DEFAULT_FORMATIONATION),
      },
      'home',
      'Ev'
    ),
    away: createTeam('Deplasman', legacy.formation || DEFAULT_FORMATIONATION),
    matches: legacy.matches || [],
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return migrateLegacy(parsed) || parsed
    }
    for (const key of LEGACY_KEYS) {
      const legacy = localStorage.getItem(key)
      if (legacy) return migrateLegacy(JSON.parse(legacy))
    }
    return null
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
  const payload = stripPhotos({
    home: state.home,
    away: state.away,
    matches: state.matches,
  })
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload))
}

export function decodeShare(code) {
  try {
    const json = LZString.decompressFromEncodedURIComponent(code)
    if (!json) return null
    return migrateLegacy(JSON.parse(json))
  } catch {
    return null
  }
}

export function createPlayer(name) {
  return {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    photo: null,
    createdAt: Date.now(),
  }
}

/** Paylaşım linkini şişirmemek için fotoğrafları çıkar */
export function stripPhotos(state) {
  return {
    home: {
      ...state.home,
      logo: null,
      players: (state.home.players || []).map(({ photo, ...p }) => ({ ...p, photo: null })),
    },
    away: {
      ...state.away,
      logo: null,
      players: (state.away.players || []).map(({ photo, ...p }) => ({ ...p, photo: null })),
    },
    matches: state.matches,
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

export function allPlayerIds(state) {
  return [...(state.home?.players || []), ...(state.away?.players || [])].map((p) => p.id)
}

export function allPlayers(state) {
  return [
    ...(state.home?.players || []).map((p) => ({ ...p, team: 'home' })),
    ...(state.away?.players || []).map((p) => ({ ...p, team: 'away' })),
  ]
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
      rating:
        m.ratings?.[playerId] != null && m.ratings[playerId] !== ''
          ? Number(m.ratings[playerId])
          : null,
    }))
    .filter((x) => x.rating != null)
    .slice(-lastN)
}

export function getTeamAvg(players, matches) {
  const avgs = players
    .map((p) => getPlayerAvg(p.id, matches))
    .filter((v) => v != null)
  if (!avgs.length) return null
  return avgs.reduce((a, b) => a + b, 0) / avgs.length
}
