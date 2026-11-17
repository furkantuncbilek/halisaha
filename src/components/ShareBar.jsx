import { useState } from 'react'

export default function ShareBar({ shareUrl, readOnly, fromShare, onClone, onReset }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Linki kopyala:', shareUrl)
    }
  }

  if (fromShare && readOnly) {
    return (
      <div className="share-banner">
        <p>Paylaşılan kadroyu görüntülüyorsun.</p>
        <button type="button" className="btn btn-accent" onClick={onClone}>
          Kendi paneline kopyala
        </button>
      </div>
    )
  }

  return (
    <div className="share-row">
      <button type="button" className="btn btn-accent" onClick={copy}>
        {copied ? 'Kopyalandı ✓' : 'Paylaşım linki kopyala'}
      </button>
      <button type="button" className="btn btn-ghost" onClick={onReset}>
        Sıfırla
      </button>
    </div>
  )
}
