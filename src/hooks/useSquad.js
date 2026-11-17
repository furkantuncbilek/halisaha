import { useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULT_FORMATIONATION, createEmptyLineup } from '../utils/formations'
import {
  createMatch,
  createPlayer,
  decodeShare,
  encodeShare,
  loadState,
  saveState,
} from '../utils/storage'

const defaultState = () => ({
  teamName: 'Ekibimiz',
  formation: DEFAULT_FORMATIONATION,
  players: [],
  lineup: createEmptyLineup(DEFAULT_FORMATIONATION),
  matches: [],
})

export function useSquad() {
  const [state, setState] = useState(() => {
    const shared = new URLSearchParams(window.location.search).get('s')
    if (shared) {
      const decoded = decodeShare(shared)
      if (decoded) {
        return {
          ...defaultState(),
          ...decoded,
          lineup: decoded.lineup || createEmptyLineup(decoded.formation || DEFAULT_FORMATIONATION),
          readOnly: true,
          fromShare: true,
        }
      }
    }
    return { ...defaultState(), ...loadState(), readOnly: false, fromShare: false }
  })

  useEffect(() => {
    if (state.readOnly) return
    const { readOnly, fromShare, ...persist } = state
    saveState(persist)
  }, [state])

  const setTeamName = useCallback((teamName) => {
    setState((s) => ({ ...s, teamName }))
  }, [])

  const setFormation = useCallback((formation) => {
    setState((s) => {
      const nextLineup = createEmptyLineup(formation)
      Object.keys(nextLineup).forEach((slot) => {
        if (s.lineup[slot]) nextLineup[slot] = s.lineup[slot]
      })
      return { ...s, formation, lineup: nextLineup }
    })
  }, [])

  const addPlayer = useCallback((name) => {
    if (!name?.trim()) return
    setState((s) => ({
      ...s,
      players: [...s.players, createPlayer(name)],
    }))
  }, [])

  const removePlayer = useCallback((playerId) => {
    setState((s) => {
      const lineup = { ...s.lineup }
      Object.keys(lineup).forEach((k) => {
        if (lineup[k] === playerId) lineup[k] = null
      })
      return {
        ...s,
        players: s.players.filter((p) => p.id !== playerId),
        lineup,
        matches: s.matches.map((m) => {
          const ratings = { ...m.ratings }
          delete ratings[playerId]
          return { ...m, ratings }
        }),
      }
    })
  }, [])

  const renamePlayer = useCallback((playerId, name) => {
    setState((s) => ({
      ...s,
      players: s.players.map((p) =>
        p.id === playerId ? { ...p, name: name.trim() || p.name } : p
      ),
    }))
  }, [])

  const assignSlot = useCallback((slotId, playerId) => {
    setState((s) => {
      const lineup = { ...s.lineup }
      Object.keys(lineup).forEach((k) => {
        if (lineup[k] === playerId) lineup[k] = null
      })
      lineup[slotId] = playerId
      return { ...s, lineup }
    })
  }, [])

  const clearSlot = useCallback((slotId) => {
    setState((s) => ({
      ...s,
      lineup: { ...s.lineup, [slotId]: null },
    }))
  }, [])

  const addMatch = useCallback((label) => {
    setState((s) => ({
      ...s,
      matches: [
        ...s.matches,
        createMatch(label, s.players.map((p) => p.id)),
      ],
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
      const next = {
        teamName: s.teamName,
        formation: s.formation,
        players: s.players,
        lineup: s.lineup,
        matches: s.matches,
        readOnly: false,
        fromShare: false,
      }
      window.history.replaceState({}, '', window.location.pathname)
      return next
    })
  }, [])

  const resetAll = useCallback(() => {
    if (!window.confirm('Tüm kadro ve maçlar silinsin mi?')) return
    window.history.replaceState({}, '', window.location.pathname)
    setState({ ...defaultState(), readOnly: false, fromShare: false })
  }, [])

  const shareUrl = useMemo(() => {
    const code = encodeShare(state)
    return `${window.location.origin}${window.location.pathname}?s=${code}`
  }, [state])

  const bench = useMemo(() => {
    const onPitch = new Set(Object.values(state.lineup).filter(Boolean))
    return state.players.filter((p) => !onPitch.has(p.id))
  }, [state.players, state.lineup])

  return {
    state,
    bench,
    shareUrl,
    setTeamName,
    setFormation,
    addPlayer,
    removePlayer,
    renamePlayer,
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
