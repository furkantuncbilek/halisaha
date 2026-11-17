import { useCallback, useEffect, useMemo, useState } from 'react'
import { createEmptyLineup } from '../utils/formations'
import {
  allPlayerIds,
  createMatch,
  createPlayer,
  decodeShare,
  defaultState,
  encodeShare,
  loadState,
  saveState,
} from '../utils/storage'

function normalizeLoaded(raw) {
  const base = defaultState()
  if (!raw) return { ...base, readOnly: false, fromShare: false }
  return {
    home: { ...base.home, ...raw.home },
    away: { ...base.away, ...raw.away },
    matches: raw.matches || [],
    readOnly: false,
    fromShare: false,
  }
}

export function useSquad() {
  const [state, setState] = useState(() => {
    const shared = new URLSearchParams(window.location.search).get('s')
    if (shared) {
      const decoded = decodeShare(shared)
      if (decoded) {
        return {
          ...normalizeLoaded(decoded),
          readOnly: true,
          fromShare: true,
        }
      }
    }
    return normalizeLoaded(loadState())
  })

  useEffect(() => {
    if (state.readOnly) return
    const { readOnly, fromShare, ...persist } = state
    saveState(persist)
  }, [state])

  const setTeamName = useCallback((side, name) => {
    setState((s) => ({
      ...s,
      [side]: { ...s[side], name },
    }))
  }, [])

  const setFormation = useCallback((side, formation) => {
    setState((s) => {
      const nextLineup = createEmptyLineup(formation)
      Object.keys(nextLineup).forEach((slot) => {
        if (s[side].lineup[slot]) nextLineup[slot] = s[side].lineup[slot]
      })
      return {
        ...s,
        [side]: { ...s[side], formation, lineup: nextLineup },
      }
    })
  }, [])

  const addPlayer = useCallback((side, name) => {
    if (!name?.trim()) return
    setState((s) => ({
      ...s,
      [side]: {
        ...s[side],
        players: [...s[side].players, createPlayer(name)],
      },
    }))
  }, [])

  const removePlayer = useCallback((side, playerId) => {
    setState((s) => {
      const lineup = { ...s[side].lineup }
      Object.keys(lineup).forEach((k) => {
        if (lineup[k] === playerId) lineup[k] = null
      })
      return {
        ...s,
        [side]: {
          ...s[side],
          players: s[side].players.filter((p) => p.id !== playerId),
          lineup,
        },
        matches: s.matches.map((m) => {
          const ratings = { ...m.ratings }
          delete ratings[playerId]
          return { ...m, ratings }
        }),
      }
    })
  }, [])

  const assignSlot = useCallback((side, slotId, playerId) => {
    setState((s) => {
      // Oyuncu yalnızca kendi takımında olabilir
      const belongsHome = s.home.players.some((p) => p.id === playerId)
      const belongsAway = s.away.players.some((p) => p.id === playerId)
      const actualSide = belongsHome ? 'home' : belongsAway ? 'away' : side
      if (actualSide !== side) return s

      const lineup = { ...s[actualSide].lineup }
      Object.keys(lineup).forEach((k) => {
        if (lineup[k] === playerId) lineup[k] = null
      })
      lineup[slotId] = playerId
      return {
        ...s,
        [actualSide]: { ...s[actualSide], lineup },
      }
    })
  }, [])

  const clearSlot = useCallback((side, slotId) => {
    setState((s) => ({
      ...s,
      [side]: {
        ...s[side],
        lineup: { ...s[side].lineup, [slotId]: null },
      },
    }))
  }, [])

  const addMatch = useCallback((label) => {
    setState((s) => ({
      ...s,
      matches: [...s.matches, createMatch(label, allPlayerIds(s))],
    }))
  }, [])

  const removeMatch = useCallback((matchId) => {
    setState((s) => ({
      ...s,
      matches: s.matches.filter((m) => m.id !== matchId),
    }))
  }, [])

  const setRating = useCallback((matchId, playerId, rating) => {
    setState((s) => ({
      ...s,
      matches: s.matches.map((m) => {
        if (m.id !== matchId) return m
        let value = rating
        if (value === '' || value == null) value = null
        else {
          value = Math.min(10, Math.max(0, Number(value)))
          if (Number.isNaN(value)) value = null
        }
        return { ...m, ratings: { ...m.ratings, [playerId]: value } }
      }),
    }))
  }, [])

  const updateMatchMeta = useCallback((matchId, patch) => {
    setState((s) => ({
      ...s,
      matches: s.matches.map((m) => (m.id === matchId ? { ...m, ...patch } : m)),
    }))
  }, [])

  const cloneShared = useCallback(() => {
    setState((s) => {
      window.history.replaceState({}, '', window.location.pathname)
      return {
        home: s.home,
        away: s.away,
        matches: s.matches,
        readOnly: false,
        fromShare: false,
      }
    })
  }, [])

  const resetAll = useCallback(() => {
    if (!window.confirm('Her iki takım ve tüm maçlar silinsin mi?')) return
    window.history.replaceState({}, '', window.location.pathname)
    setState({ ...defaultState(), readOnly: false, fromShare: false })
  }, [])

  const shareUrl = useMemo(() => {
    const code = encodeShare(state)
    return `${window.location.origin}${window.location.pathname}?s=${code}`
  }, [state])

  const bench = useCallback(
    (side) => {
      const onPitch = new Set(Object.values(state[side].lineup).filter(Boolean))
      return state[side].players.filter((p) => !onPitch.has(p.id))
    },
    [state]
  )

  return {
    state,
    bench,
    shareUrl,
    setTeamName,
    setFormation,
    addPlayer,
    removePlayer,
    assignSlot,
    clearSlot,
    addMatch,
    removeMatch,
    setRating,
    updateMatchMeta,
    cloneShared,
    resetAll,
  }
}
