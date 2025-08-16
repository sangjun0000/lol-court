'use client'

import { useState } from 'react'
import VideoUpload, { VideoUploadData } from './components/VideoUpload'
import MatchHistorySearch, { MatchData } from './components/MatchHistorySearch'
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
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload')

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

  const handleMatchHistoryAnalysis = async (matchData: MatchData, highlight: { startTime: number, endTime: number, description: string }, customDescription: string) => {
    setIsLoading(true)
    try {
      // 전적 데이터를 기반으로 영상 분석 요청 생성
      const analysisRequest: VideoUploadData = {
        videoFile: new File([], 'match-replay.mp4'), // 실제로는 리플레이 파일이 필요
        analysisType: 'custom',
        targetCharacters: [matchData.champion],
        startTime: highlight.startTime,
        endTime: highlight.endTime,
        customDescription: customDescription
      }

      // 영상 분석 API 호출
      const formData = new FormData()
      formData.append('video', analysisRequest.videoFile)
      formData.append('analysisType', analysisRequest.analysisType)
      formData.append('targetCharacters', JSON.stringify(analysisRequest.targetCharacters))
      formData.append('startTime', analysisRequest.startTime.toString())
      formData.append('endTime', analysisRequest.endTime.toString())
      if (analysisRequest.customDescription) {
        formData.append('customDescription', analysisRequest.customDescription)
      }

      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('전적 분석에 실패했습니다.')
      }

      const data = await response.json()
      setVerdict({
        case: `전적 분석: ${matchData.champion} - ${highlight.description}`,
        verdict: data.verdict,
        reasoning: data.reasoning,
        punishment: data.punishment,
        timestamp: new Date(),
        confidence: data.confidence,
        factors: data.factors,
        recommendations: data.recommendations,
        characterAnalysis: data.characterAnalysis,
        reinforcementLearning: data.reinforcementLearning,
        videoAnalysis: {
          analysisType: 'match-history',
          targetCharacters: [matchData.champion],
          timeRange: {
            start: highlight.startTime,
            end: highlight.endTime,
            duration: highlight.endTime - highlight.startTime
          },
          framesAnalyzed: 0
        }
      })
    } catch (error) {
      console.error('전적 분석 오류:', error)
      alert('전적 분석 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-court-brown via-lol-gold to-yellow-400">
      {/* 헤더 광고 */}
      <HeaderAd />
      
      <div className="container mx-auto px-4 py-8">
        <Header />
        
        {/* 탭 선택 */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-lol-gold text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🎬 직접 영상 올리기
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-lol-gold text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🔍 전적에서 영상찾기
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
              {activeTab === 'upload' ? (
                <VideoUpload onSubmit={handleVideoUpload} isLoading={isLoading} />
              ) : (
                <MatchHistorySearch onVideoAnalysisRequest={handleMatchHistoryAnalysis} />
              )}
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
                    <h4 className="font-semibold text-gray-800 mb-2">🔍 전적에서 영상찾기</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 소환사명으로 전적을 검색하세요</li>
                      <li>• 최근 게임 기록을 확인하세요</li>
                      <li>• 주요 구간을 자동으로 찾아드립니다</li>
                      <li>• 원클릭으로 분석 요청이 가능합니다</li>
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
  )
}
