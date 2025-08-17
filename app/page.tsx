'use client'

import { useState } from 'react'
import VideoUpload, { VideoUploadData } from './components/VideoUpload'
import VerdictDisplay from './components/VerdictDisplay'
import GameEvaluation from './components/GameEvaluation'
import Header from './components/Header'
import { HeaderAd, SidebarAd, InlineAd, FooterAd } from './components/AdBanner'

interface Verdict {
  case: string
  verdict: string
  reasoning: string
  punishment: string
  timestamp: Date
  confidence: number
  factors: string[]
  recommendations: string[]
  characterAnalysis: string
  reinforcementLearning: string
  videoAnalysis: {
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
  const [gameEvaluation, setGameEvaluation] = useState<any>(null)
  const [showGameEvaluation, setShowGameEvaluation] = useState(false)

  const handleVideoUpload = async (data: VideoUploadData) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('videoFile', data.videoFile)
      formData.append('analysisType', data.analysisType)
      formData.append('targetCharacters', JSON.stringify(data.targetCharacters))
      formData.append('startTime', data.startTime.toString())
      formData.append('endTime', data.endTime.toString())
      formData.append('customDescription', data.customDescription)

      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('분석 요청에 실패했습니다.')
      }

      const responseData = await response.json()
      
      if (data.videoFile.name.endsWith('.rofl')) {
        setGameEvaluation(responseData.gameAnalysis)
        setShowGameEvaluation(true)
      }
      
      setVerdict({
        case: `ROFL 파일 분석: ${data.analysisType} 상황`,
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
          analysisType: 'rofl-analysis',
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
    <div className="min-h-screen bg-gradient-to-br from-court-brown via-lol-gold to-yellow-400">
      <HeaderAd />
      
      <div className="container mx-auto px-4 py-8">
        <Header />
        
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            <button className="px-6 py-3 rounded-md font-medium transition-colors bg-lol-gold text-white shadow-md">
              🎬 직접 영상 올리기
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <SidebarAd />
          
          <div className="flex-1">
            <div className="max-w-4xl mx-auto mb-8">
              <VideoUpload onSubmit={handleVideoUpload} isLoading={isLoading} />
            </div>

            <InlineAd />

            {verdict && (
              <VerdictDisplay verdict={verdict} />
            )}
            
            {showGameEvaluation && gameEvaluation && (
              <div className="mt-8">
                <GameEvaluation 
                  players={gameEvaluation.participants}
                  gameAnalysis={gameEvaluation}
                  isVisible={showGameEvaluation}
                />
              </div>
            )}

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

      <FooterAd />
    </div>
  )
}
