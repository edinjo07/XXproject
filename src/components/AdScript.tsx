import Script from 'next/script'

interface AdScriptProps {
  publisherId?: string
}

export function AdScript({ publisherId = 'ca-pub-XXXXXXXXXXXXXXXX' }: AdScriptProps) {
  // Only load in production or when explicitly enabled
  const isEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true'

  if (!isEnabled) {
    return null
  }

  return (
    <>
      {/* Google AdSense Script */}
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </>
  )
}
