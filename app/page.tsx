'use client'

import { useState } from 'react'
import Head from 'next/head'
import VideoUpload, { VideoUploadData } from './components/VideoUpload'

import VerdictDisplay from './components/VerdictDisplay'
import Header from './components/Header'
import { HeaderAd, SidebarAd, InlineAd, FooterAd } from './components/AdBanner'

export interface Verdict {
  case: string
  verdict: string
  reasoning: string
  punishment?: string
  timestamp: Date
  confidence?: number
  factors?: string[]
  recommendations?: string[]
  characterAnalysis?: {
    primaryFault: string
    secondaryFault?: string
    faultComparison: string
  }
  reinforcementLearning?: {
    optimalAction: string
    expectedReward: number
    playerReward: number
    fault: number
  }
  videoAnalysis?: {
    analysisType: string
    targetCharacters: string[]
    timeRange: {
      start: number
      end: number
      duration: number
    }
    framesAnalyzed: number
  }
}

export default function Home() {
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'upload'>('upload')

  const handleVideoUpload = async (data: VideoUploadData) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('video', data.videoFile)
      formData.append('analysisType', data.analysisType)
      formData.append('targetCharacters', JSON.stringify(data.targetCharacters))
      formData.append('startTime', data.startTime.toString())
      formData.append('endTime', data.endTime.toString())
      if (data.customDescription) {
        formData.append('customDescription', data.customDescription)
      }

      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('영상 분석에 실패했습니다.')
      }

      const responseData = await response.json()
      setVerdict({
        case: `영상 업로드 분석: ${data.analysisType} 상황`,
        verdict: responseData.verdict,
        reasoning: responseData.reasoning,
        punishment: responseData.punishment,
        timestamp: new Date(),
        confidence: responseData.confidence,
        factors: responseData.factors,
        recommendations: responseData.recommendations,
        characterAnalysis: responseData.characterAnalysis,
        reinforcementLearning: responseData.reinforcementLearning,
        videoAnalysis: {
          analysisType: 'video-upload',
          targetCharacters: data.targetCharacters,
          timeRange: {
            start: data.startTime,
            end: data.endTime,
            duration: data.endTime - data.startTime
          },
          framesAnalyzed: 0
        }
      })
    } catch (error) {
      console.error('영상 업로드 분석 오류:', error)
      alert('영상 분석 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <>
      <Head>
        {/* 구조화된 데이터 - FAQ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "롤문철이란 무엇인가요?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "롤문철은 리그 오브 레전드 게임에서 발생하는 분쟁을 AI가 공정하게 판결하는 시스템입니다. 롤법원이라고도 불립니다."
                  }
                },
                {
                  "@type": "Question",
                  "name": "롤법원에서 어떻게 판결을 받나요?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "게임 영상을 업로드하고 분석하고 싶은 구간을 선택한 후, 상황을 설명하면 AI가 객관적인 판결을 내려드립니다."
                  }
                },
                {
                  "@type": "Question",
                  "name": "롤문철 사이트는 어디인가요?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "롤법원(롤문철)은 AI 기반 롤 게임 판결 시스템으로, 게임 분쟁을 공정하게 해결해드립니다."
                  }
                }
              ]
            })
          }}
        />
        
        {/* 구조화된 데이터 - 웹사이트 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "롤법원",
              "alternateName": "롤문철",
              "url": "https://lol-court-judge.vercel.app",
              "description": "AI 기반 롤 게임 판결 시스템 - 롤문철, 롤법원",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://lol-court-judge.vercel.app",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </Head>
      
      <main className="min-h-screen bg-gradient-to-br from-court-brown via-lol-gold to-yellow-400">
        {/* 헤더 광고 */}
        <HeaderAd />
      
      <div className="container mx-auto px-4 py-8">
        <Header />
        
        {/* 탭 선택 */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            <button
              className="px-6 py-3 rounded-md font-medium transition-colors bg-lol-gold text-white shadow-md"
            >
              🎬 직접 영상 올리기
            </button>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex gap-6">
          {/* 사이드바 광고 */}
          <SidebarAd />
          
          {/* 메인 콘텐츠 */}
          <div className="flex-1">
            {/* 폼 영역 */}
            <div className="max-w-4xl mx-auto mb-8">
              <VideoUpload onSubmit={handleVideoUpload} isLoading={isLoading} />
            </div>

            {/* 인라인 광고 */}
            <InlineAd />

            {/* 판결 결과 */}
            {verdict && (
              <VerdictDisplay verdict={verdict} />
            )}

            {/* 사용법 안내 */}
            <div className="max-w-4xl mx-auto mt-12">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-court-brown mb-4">
                  💡 롤법원 사용법
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">🎬 직접 영상 올리기</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 드래그 앤 드롭으로 영상 업로드</li>
                      <li>• 실시간 미리보기 및 구간 선택</li>
                      <li>• 분석하고 싶은 상황을 자세히 설명하세요</li>
                      <li>• AI가 영상을 직접 분석합니다</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">📁 ROFL 파일 분석</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• ROFL 파일을 업로드하세요</li>
                      <li>• 게임 데이터를 자동으로 분석합니다</li>
                      <li>• 분석하고 싶은 상황을 자세히 설명하세요</li>
                      <li>• AI가 게임 데이터를 기반으로 판결합니다</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 광고 */}
      <FooterAd />
      </main>
    </>
  )
}
