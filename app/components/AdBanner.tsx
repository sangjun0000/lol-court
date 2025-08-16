'use client'

import { useEffect, useState } from 'react'

interface AdBannerProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'banner' | 'sidebar'
  className?: string
  style?: React.CSSProperties
}

export default function AdBanner({ adSlot, adFormat = 'auto', className = '', style = {} }: AdBannerProps) {
  const [showAds, setShowAds] = useState(false)

  useEffect(() => {
    // 환경 변수에서 광고 설정 가져오기
    const shouldShowAds = process.env.NEXT_PUBLIC_SHOW_ADS === 'true'
    
    setShowAds(shouldShowAds)

    // Google AdSense 로드
    if (typeof window !== 'undefined' && (window as any).adsbygoogle && shouldShowAds) {
      try {
        (window as any).adsbygoogle.push({})
      } catch (error) {
        console.error('AdSense 오류:', error)
      }
    }
  }, [])

  const getAdStyle = () => {
    switch (adFormat) {
      case 'rectangle':
        return { width: '300px', height: '250px' }
      case 'banner':
        return { width: '728px', height: '90px' }
      case 'sidebar':
        return { width: '160px', height: '600px' }
      default:
        return { width: '100%', height: 'auto' }
    }
  }

  // 광고가 비활성화된 경우 빈 div 반환
  if (!showAds) {
    return (
      <div 
        className={`ad-placeholder ${className}`}
        style={{ 
          ...getAdStyle(), 
          ...style,
          backgroundColor: '#f8f9fa',
          border: '1px dashed #dee2e6',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6c757d',
          fontSize: '12px'
        }}
      >
        광고 영역
      </div>
    )
  }

  return (
    <div 
      className={`ad-banner ${className}`}
      style={{ ...getAdStyle(), ...style }}
    >
      {/* Google AdSense 광고 */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-9980072159270854"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
      
      {/* 광고 로드 실패 시 대체 콘텐츠 */}
      <div className="ad-fallback" style={{ 
        display: 'none',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#6c757d'
      }}>
        <p className="text-sm">광고 로드 중...</p>
      </div>
    </div>
  )
}

// 광고 영역별 컴포넌트들
export function HeaderAd() {
  return (
    <div className="w-full bg-white border-b border-gray-200 py-2">
      <div className="container mx-auto flex justify-center">
        <AdBanner 
          adSlot="header-ad-slot"
          adFormat="banner"
          className="max-w-4xl"
        />
      </div>
    </div>
  )
}

export function SidebarAd() {
  return (
    <div className="hidden lg:block w-48">
      <div className="sticky top-4">
        <AdBanner 
          adSlot="sidebar-ad-slot"
          adFormat="sidebar"
          className="mb-4"
        />
      </div>
    </div>
  )
}

export function InlineAd() {
  return (
    <div className="w-full bg-gray-50 py-4 my-6">
      <div className="container mx-auto flex justify-center">
        <AdBanner 
          adSlot="inline-ad-slot"
          adFormat="rectangle"
        />
      </div>
    </div>
  )
}

export function FooterAd() {
  return (
    <div className="w-full bg-white border-t border-gray-200 py-4">
      <div className="container mx-auto flex justify-center">
        <AdBanner 
          adSlot="footer-ad-slot"
          adFormat="banner"
          className="max-w-4xl"
        />
      </div>
    </div>
  )
}
