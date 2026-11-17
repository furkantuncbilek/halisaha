import { useState } from 'react'
import { shareSquadToWhatsApp } from '../utils/exportCard'

export default function ShareBar({
  shareUrl,
  state,
  readOnly,
  fromShare,
  onClone,
  onReset,
}) {
  const [copied, setCopied] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [shareMsg, setShareMsg] = useState('')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Linki kopyala:', shareUrl)
    }
  }

  const shareWhatsApp = async () => {
    setSharing(true)
    setShareMsg('')
    try {
      const result = await shareSquadToWhatsApp(state)
      setShareMsg(result === 'shared' ? 'WhatsApp’a gönderildi' : 'Görsel indirildi')
      setTimeout(() => setShareMsg(''), 2500)
    } catch (err) {
      console.error(err)
      setShareMsg('Paylaşım başarısız')
      setTimeout(() => setShareMsg(''), 2500)
    } finally {
      setSharing(false)
    }
  }

  if (fromShare && readOnly) {
    return (
      <div className="share-banner">
        <p>Paylaşılan kadroyu görüntülüyorsun.</p>
        <div className="share-row" style={{ margin: 0 }}>
          <button type="button" className="btn btn-accent" onClick={onClone}>
            Kendi paneline kopyala
          </button>
          <button
            type="button"
            className="btn btn-wa"
            disabled={sharing}
            onClick={shareWhatsApp}
          >
            {sharing ? 'Hazırlanıyor…' : 'WhatsApp görsel'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="share-row">
      <button
        type="button"
        className="btn btn-wa"
        disabled={sharing}
        onClick={shareWhatsApp}
      >
        {sharing ? 'Görsel hazırlanıyor…' : 'WhatsApp ile paylaş'}
      </button>
      <button type="button" className="btn btn-accent" onClick={copy}>
        {copied ? 'Link kopyalandı ✓' : 'Link kopyala'}
      </button>
      <button type="button" className="btn btn-ghost" onClick={onReset}>
        Sıfırla
      </button>
      {shareMsg && <span className="share-toast">{shareMsg}</span>}
    </div>
  )
}
