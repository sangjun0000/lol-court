import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '롤법원 - AI 기반 롤문철 | 롤 게임 판결 시스템',
  description: '리그 오브 레전드 게임 상황에 대한 AI 판결 시스템. 롤문철, 롤법원으로 검색하세요. 게임 분쟁을 AI가 공정하게 판결합니다.',
  keywords: '롤문철, 롤법원, 롤, 리그오브레전드, AI판결, 게임분석, 롤게임, 롤판결, 롤문철사이트, 롤법원사이트, 롤분쟁, 롤AI, 롤판사',
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
    title: '롤법원 - AI 기반 롤문철 | 롤 게임 판결 시스템',
    description: '리그 오브 레전드 게임 상황에 대한 AI 판결 시스템. 롤문철, 롤법원으로 검색하세요. 게임 분쟁을 AI가 공정하게 판결합니다.',
    type: 'website',
    locale: 'ko_KR',
    url: 'https://lol-court-judge.vercel.app',
    siteName: '롤법원',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '롤법원 - AI 기반 롤문철',
      },
    ],
  },
  verification: {
    google: 'google-site-verification-code', // Google Search Console에서 받은 코드
  },
  other: {
    'google-adsense-account': 'ca-pub-9980072159270854',
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
        {/* Google AdSense 계정 메타태그 */}
        <meta name="google-adsense-account" content="ca-pub-9980072159270854" />
        
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
