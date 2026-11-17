import LZString from 'lz-string'
import {
  DEFAULT_FORMATIONATION,
  FORMATIONS,
  createEmptyLineup,
  createTeam,
  getSlotPlayerId,
  mapPitchPosition,
  normalizeSlot,
  realignLineup,
} from './formations'

const STORAGE_KEY = 'saha-squad-v4'
const LEGACY_KEYS = ['saha-squad-v3', 'saha-squad-v2', 'saha-squad-v1']

export function defaultState() {
  return {
    home: createTeam('Ev'),
    away: createTeam('Deplasman'),
    matches: [],
  }
}

function normalizeTeam(team, side, fallbackName, { realign = false } = {}) {
  const formation = team?.formation || DEFAULT_FORMATIONATION
  const name =
    !team?.name || team.name === 'Ev Sahibi' || team.name === 'Ekibimiz'
      ? fallbackName
      : team.name

  let lineup = team?.lineup || createEmptyLineup(formation)
  if (realign) {
    lineup = realignLineup(lineup, formation, side)
  } else {
    // Eski string slotları {playerId,x,y} formatına çevir; özel konumları koru
    const formationDef = FORMATIONS[formation] || FORMATIONS[DEFAULT_FORMATIONATION]
    const next = createEmptyLineup(formation)
    formationDef.positions.forEach((pos) => {
      const entry = normalizeSlot(lineup?.[pos.id], pos, side)
      if (!entry?.playerId) return
      next[pos.id] = entry
    })
    // Orphan slots from older formations: keep if still have player
    Object.keys(lineup || {}).forEach((slotId) => {
      if (next[slotId] !== undefined) return
      const pid = getSlotPlayerId(lineup[slotId])
      if (!pid) return
      const mapped = mapPitchPosition({ x: 50, y: 50, id: slotId }, side)
      const raw = lineup[slotId]
      next[slotId] =
        typeof raw === 'object' && raw
          ? { playerId: pid, x: raw.x ?? mapped.x, y: raw.y ?? mapped.y }
          : { playerId: pid, x: mapped.x, y: mapped.y }
    })
    lineup = next
  }

  return {
    logo: team?.logo ?? null,
    ...team,
    name,
    formation,
    players: (team?.players || []).map((p) => ({
      ...p,
      photo: p.photo ?? null,
    })),
    lineup,
  }
}

function migrateLegacy(legacy, { realign = true } = {}) {
  if (!legacy) return null
  if (legacy.home && legacy.away) {
    return {
      home: normalizeTeam(legacy.home, 'home', 'Ev', { realign }),
      away: normalizeTeam(legacy.away, 'away', 'Deplasman', { realign }),
      matches: legacy.matches || [],
    }
  }
  if (!legacy.players && !legacy.teamName) return null
  return {
    home: normalizeTeam(
      {
        name: legacy.teamName || 'Ev',
        formation: legacy.formation || DEFAULT_FORMATIONATION,
        players: legacy.players || [],
        lineup: legacy.lineup || createEmptyLineup(legacy.formation || DEFAULT_FORMATIONATION),
      },
      'home',
      'Ev',
      { realign }
    ),
    away: createTeam('Deplasman', legacy.formation || DEFAULT_FORMATIONATION),
    matches: legacy.matches || [],
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      // Aynı sürüm: konumları koru
      const parsed = JSON.parse(raw)
      return migrateLegacy(parsed, { realign: false }) || parsed
    }
    for (const key of LEGACY_KEYS) {
      const legacy = localStorage.getItem(key)
      if (legacy) {
        const migrated = migrateLegacy(JSON.parse(legacy), { realign: true })
        if (migrated) {
          // Yeni anahtara taşı
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
        }
        return migrated
      }
    }
    return null
  } catch {
    return null
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
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
    return migrateLegacy(JSON.parse(json), { realign: false })
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
