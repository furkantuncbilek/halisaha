import { loadImage } from './image'
import { FORMATIONS, formatRating, normalizeSlot } from './formations'
import { getPlayerAvg } from './storage'

function drawRoundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function drawPitch(ctx, x, y, w, h) {
  const stripe = w / 12
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#1b6b36' : '#124a25'
    ctx.fillRect(x + i * stripe, y, stripe + 1, h)
  }
  ctx.strokeStyle = 'rgba(240,244,232,0.55)'
  ctx.lineWidth = 3
  ctx.strokeRect(x + w * 0.04, y + h * 0.04, w * 0.92, h * 0.92)

  ctx.beginPath()
  ctx.moveTo(x + w * 0.04, y + h * 0.5)
  ctx.lineTo(x + w * 0.96, y + h * 0.5)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(x + w * 0.5, y + h * 0.5, w * 0.12, 0, Math.PI * 2)
  ctx.stroke()

  const boxW = w * 0.5
  const boxH = h * 0.14
  ctx.strokeRect(x + (w - boxW) / 2, y + h * 0.04, boxW, boxH)
  ctx.strokeRect(x + (w - boxW) / 2, y + h * 0.96 - boxH, boxW, boxH)
}

async function drawPlayerToken(ctx, px, py, player, avg, side, size) {
  const accent = side === 'home' ? '#b8f53a' : '#5ec8ff'
  const fill = side === 'home' ? '#1a5c2e' : '#1a4a66'

  ctx.beginPath()
  ctx.arc(px, py, size / 2, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = accent
  ctx.stroke()

  if (player.photo) {
    const img = await loadImage(player.photo)
    if (img) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(px, py, size / 2 - 3, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(img, px - size / 2 + 3, py - size / 2 + 3, size - 6, size - 6)
      ctx.restore()
    }
  } else {
    const rating = formatRating(avg)
    if (rating !== '—') {
      ctx.fillStyle = '#f0f4e8'
      ctx.font = `700 ${Math.round(size * 0.32)}px Teko, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(rating, px, py + 1)
    }
  }

  const label = player.name.length > 12 ? `${player.name.slice(0, 11)}…` : player.name
  ctx.font = `700 ${Math.round(size * 0.22)}px "Plus Jakarta Sans", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const tw = ctx.measureText(label).width + 14
  const ly = py + size / 2 + 14
  drawRoundRect(ctx, px - tw / 2, ly - 10, tw, 20, 10)
  ctx.fillStyle = 'rgba(7,20,12,0.88)'
  ctx.fill()
  ctx.fillStyle = '#f0f4e8'
  ctx.fillText(label, px, ly)
}

export async function renderSquadCard({ home, away, matches }) {
  const W = 900
  const H = 1380
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#0a1f12')
  grad.addColorStop(1, '#07140c')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#b8f53a'
  ctx.font = '700 64px Teko, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('SAHA', 48, 70)
  ctx.fillStyle = 'rgba(240,244,232,0.55)'
  ctx.font = '600 20px "Plus Jakarta Sans", sans-serif'
  ctx.fillText('Halı saha kadro', 48, 102)

  const midY = 165
  const homeLogo = await loadImage(home.logo)
  const awayLogo = await loadImage(away.logo)

  if (homeLogo) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(90, midY, 34, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(homeLogo, 56, midY - 34, 68, 68)
    ctx.restore()
    ctx.beginPath()
    ctx.arc(90, midY, 34, 0, Math.PI * 2)
    ctx.strokeStyle = '#b8f53a'
    ctx.lineWidth = 2
    ctx.stroke()
  }
  if (awayLogo) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(W - 90, midY, 34, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(awayLogo, W - 124, midY - 34, 68, 68)
    ctx.restore()
    ctx.beginPath()
    ctx.arc(W - 90, midY, 34, 0, Math.PI * 2)
    ctx.strokeStyle = '#5ec8ff'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  ctx.font = '700 40px Teko, sans-serif'
  ctx.fillStyle = '#b8f53a'
  ctx.textAlign = 'right'
  ctx.fillText(home.name, W / 2 - 48, midY + 12)
  ctx.fillStyle = '#5ec8ff'
  ctx.textAlign = 'left'
  ctx.fillText(away.name, W / 2 + 48, midY + 12)

  drawRoundRect(ctx, W / 2 - 24, midY - 16, 48, 30, 15)
  ctx.fillStyle = 'rgba(240,244,232,0.92)'
  ctx.fill()
  ctx.fillStyle = '#07140c'
  ctx.font = '800 15px "Plus Jakarta Sans", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('VS', W / 2, midY)

  const pitchX = 40
  const pitchY = 230
  const pitchW = W - 80
  const pitchH = 1000

  ctx.save()
  drawRoundRect(ctx, pitchX, pitchY, pitchW, pitchH, 24)
  ctx.clip()
  drawPitch(ctx, pitchX, pitchY, pitchW, pitchH)

  const tokenSize = 62

  async function drawTeam(team, side) {
    const formation = FORMATIONS[team.formation] || FORMATIONS['5v5-2-1-1']
    const byId = Object.fromEntries(team.players.map((p) => [p.id, p]))
    for (const pos of formation.positions) {
      const entry = normalizeSlot(team.lineup?.[pos.id], pos, side)
      if (!entry?.playerId) continue
      const player = byId[entry.playerId]
      if (!player) continue
      const px = pitchX + (entry.x / 100) * pitchW
      const py = pitchY + (entry.y / 100) * pitchH
      await drawPlayerToken(ctx, px, py, player, getPlayerAvg(player.id, matches), side, tokenSize)
    }
  }

  await drawTeam(away, 'away')
  await drawTeam(home, 'home')
  ctx.restore()

  drawRoundRect(ctx, pitchX, pitchY, pitchW, pitchH, 24)
  ctx.strokeStyle = 'rgba(184,245,58,0.3)'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = 'rgba(240,244,232,0.45)'
  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('saha · kadro · reyting', W / 2, H - 40)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve({ blob, canvas }), 'image/png')
  })
}

export async function shareSquadToWhatsApp(state) {
  const { blob } = await renderSquadCard({
    home: state.home,
    away: state.away,
    matches: state.matches,
  })
  const safe = (n) => String(n || 'takim').replace(/[^\wğüşıöçĞÜŞİÖÇ\- ]+/gi, '').trim() || 'takim'
  const file = new File([blob], `saha-${safe(state.home.name)}-vs-${safe(state.away.name)}.png`, {
    type: 'image/png',
  })
  const text = `${state.home.name} vs ${state.away.name} — SAHA kadro`

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: 'SAHA Kadro', text })
    return 'shared'
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)

  window.open(
    `https://wa.me/?text=${encodeURIComponent(`${text}\n(Kadro görseli indirildi — WhatsApp'a ekle)`)}`,
    '_blank'
  )
  return 'download'
}
