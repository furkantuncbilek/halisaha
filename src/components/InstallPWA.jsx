import { useEffect, useState } from 'react'

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export default function InstallPWA() {
  const [deferred, setDeferred] = useState(null)
  const [hidden, setHidden] = useState(() => {
    return isStandalone() || localStorage.getItem('saha-pwa-hide') === '1'
  })
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    if (isStandalone()) return undefined
    const onPrompt = (e) => {
      e.preventDefault()
      setDeferred(e)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (hidden) return null

  const dismiss = () => {
    localStorage.setItem('saha-pwa-hide', '1')
    setHidden(true)
  }

  const install = async () => {
    if (deferred) {
      deferred.prompt()
      const result = await deferred.userChoice
      setDeferred(null)
      if (result.outcome === 'accepted') setHidden(true)
      return
    }
    if (isIos()) {
      setIosHint(true)
      return
    }
    setIosHint(true)
  }

  return (
    <div className="install-banner">
      <div>
        <strong>SAHA’yı ana ekrana ekle</strong>
        <p>
          Uygulama gibi açılsın; kadro ve reytingler bu telefonda kalsın.
        </p>
        {iosHint && (
          <p className="install-ios">
            Safari’de Paylaş → <em>Ana Ekrana Ekle</em>
          </p>
        )}
      </div>
      <div className="install-actions">
        <button type="button" className="btn btn-accent" onClick={install}>
          {deferred ? 'Yükle' : isIos() ? 'Nasıl eklenir?' : 'Yükle / Ekle'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={dismiss}>
          Sonra
        </button>
      </div>
    </div>
  )
}
