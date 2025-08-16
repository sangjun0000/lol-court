import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '롤법원 - AI 기반 롤문철',
  description: '리그 오브 레전드 게임 상황에 대한 AI 판결 시스템',
  keywords: '롤, 리그오브레전드, 롤문철, AI판결, 게임분석, 롤법원',
  authors: [{ name: '롤법원 개발팀' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: '롤법원 - AI 기반 롤문철',
    description: '리그 오브 레전드 게임 상황에 대한 AI 판결 시스템',
    type: 'website',
    locale: 'ko_KR',
    url: 'https://lol-court-4c82ikgz6-sangjun0000s-projects.vercel.app',
    siteName: '롤법원',
  },
  verification: {
    google: 'google-site-verification-code', // Google Search Console에서 받은 코드
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const analyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
  const showAds = process.env.NEXT_PUBLIC_SHOW_ADS === 'true'

  return (
    <html lang="ko">
      <head>
        {/* Google AdSense */}
        {showAds && (
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9980072159270854"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        
        {/* Google Analytics (선택사항) */}
        {analyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${analyticsId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
          {children}
        </div>
      </body>
    </html>
  )
}
