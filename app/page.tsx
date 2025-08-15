'use client'

import { useState } from 'react'
import CourtForm from './components/CourtForm'
import VideoAnalysisForm, { VideoAnalysisRequest } from './components/VideoAnalysisForm'
import VideoUpload, { VideoUploadData } from './components/VideoUpload'
import MatchHistorySearch, { MatchData } from './components/MatchHistorySearch'
import VerdictDisplay from './components/VerdictDisplay'
import Header from './components/Header'

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
  const [activeTab, setActiveTab] = useState<'text' | 'video' | 'upload' | 'history'>('text')

  const handleSubmitCase = async (caseDescription: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/judge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ case: caseDescription }),
      })

      if (!response.ok) {
        throw new Error('판결 요청에 실패했습니다.')
      }

      const data = await response.json()
      setVerdict({
        case: caseDescription,
        verdict: data.verdict,
        reasoning: data.reasoning,
        punishment: data.punishment,
        timestamp: new Date(),
        confidence: data.confidence,
        factors: data.factors,
        recommendations: data.recommendations,
        characterAnalysis: data.characterAnalysis,
        reinforcementLearning: data.reinforcementLearning
      })
    } catch (error) {
      console.error('판결 요청 오류:', error)
      alert('판결을 받는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVideoAnalysis = async (request: VideoAnalysisRequest) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('video', request.videoFile)
      formData.append('analysisType', request.analysisType)
      formData.append('targetCharacters', JSON.stringify(request.targetCharacters))
      formData.append('startTime', request.startTime.toString())
      formData.append('endTime', request.endTime.toString())
      if (request.customDescription) {
        formData.append('customDescription', request.customDescription)
      }

      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('영상 분석에 실패했습니다.')
      }

      const data = await response.json()
      setVerdict({
        case: `영상 분석: ${request.analysisType} 상황`,
        verdict: data.verdict,
        reasoning: data.reasoning,
        punishment: data.punishment,
        timestamp: new Date(),
        confidence: data.confidence,
        factors: data.factors,
        recommendations: data.recommendations,
        characterAnalysis: data.characterAnalysis,
        reinforcementLearning: data.reinforcementLearning,
        videoAnalysis: data.videoAnalysis
      })
    } catch (error) {
      console.error('영상 분석 오류:', error)
      alert('영상 분석 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleMatchHistoryAnalysis = async (matchData: MatchData, highlight: { startTime: number, endTime: number, description: string }) => {
    setIsLoading(true)
    try {
      // 전적 데이터를 기반으로 영상 분석 요청 생성
      const analysisRequest: VideoAnalysisRequest = {
        videoFile: new File([], 'match-replay.mp4'), // 실제로는 리플레이 파일이 필요
        analysisType: 'custom',
        targetCharacters: [matchData.champion],
        startTime: highlight.startTime,
        endTime: highlight.endTime,
        customDescription: `${matchData.champion}의 ${highlight.description} 구간 분석`
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
      <div className="container mx-auto px-4 py-8">
        <Header />
        
                 {/* 탭 선택 */}
         <div className="flex justify-center mb-8">
           <div className="bg-white rounded-lg p-1 shadow-lg">
             <button
               onClick={() => setActiveTab('text')}
               className={`px-6 py-3 rounded-md font-medium transition-colors ${
                 activeTab === 'text'
                   ? 'bg-lol-gold text-white shadow-md'
                   : 'text-gray-600 hover:text-gray-800'
               }`}
             >
               📝 텍스트 판사
             </button>
             <button
               onClick={() => setActiveTab('video')}
               className={`px-6 py-3 rounded-md font-medium transition-colors ${
                 activeTab === 'video'
                   ? 'bg-lol-gold text-white shadow-md'
                   : 'text-gray-600 hover:text-gray-800'
               }`}
             >
               🎬 영상 판사
             </button>
             <button
               onClick={() => setActiveTab('upload')}
               className={`px-6 py-3 rounded-md font-medium transition-colors ${
                 activeTab === 'upload'
                   ? 'bg-lol-gold text-white shadow-md'
                   : 'text-gray-600 hover:text-gray-800'
               }`}
             >
               📁 영상 업로드
             </button>
             <button
               onClick={() => setActiveTab('history')}
               className={`px-6 py-3 rounded-md font-medium transition-colors ${
                 activeTab === 'history'
                   ? 'bg-lol-gold text-white shadow-md'
                   : 'text-gray-600 hover:text-gray-800'
               }`}
             >
               🔍 전적 검색
             </button>
           </div>
         </div>

                 {/* 폼 영역 */}
         <div className="max-w-4xl mx-auto mb-8">
           {activeTab === 'text' ? (
             <CourtForm onSubmit={handleSubmitCase} isLoading={isLoading} />
           ) : activeTab === 'video' ? (
             <VideoAnalysisForm onSubmit={handleVideoAnalysis} isLoading={isLoading} />
           ) : activeTab === 'upload' ? (
             <VideoUpload onSubmit={handleVideoUpload} isLoading={isLoading} />
           ) : (
             <MatchHistorySearch onVideoAnalysisRequest={handleMatchHistoryAnalysis} />
           )}
         </div>

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
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div>
                 <h4 className="font-semibold text-gray-800 mb-2">📝 텍스트 판사</h4>
                 <ul className="text-sm text-gray-600 space-y-1">
                   <li>• 게임 상황을 자세히 설명해주세요</li>
                   <li>• 관련된 캐릭터 이름을 포함하세요</li>
                   <li>• 구체적인 행동과 결과를 명시하세요</li>
                   <li>• AI가 객관적으로 판단해드립니다</li>
                 </ul>
               </div>
               <div>
                 <h4 className="font-semibold text-gray-800 mb-2">🎬 영상 판사</h4>
                 <ul className="text-sm text-gray-600 space-y-1">
                   <li>• 롤 게임 영상을 업로드하세요</li>
                   <li>• 분석할 구간을 선택하세요</li>
                   <li>• 판결받을 캐릭터를 지정하세요</li>
                   <li>• AI가 영상을 직접 분석합니다</li>
                 </ul>
               </div>
               <div>
                 <h4 className="font-semibold text-gray-800 mb-2">📁 영상 업로드</h4>
                 <ul className="text-sm text-gray-600 space-y-1">
                   <li>• 드래그 앤 드롭으로 영상 업로드</li>
                   <li>• 실시간 미리보기 및 구간 선택</li>
                   <li>• 직관적인 인터페이스로 쉽게 사용</li>
                   <li>• 다양한 영상 형식 지원</li>
                 </ul>
               </div>
               <div>
                 <h4 className="font-semibold text-gray-800 mb-2">🔍 전적 검색</h4>
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
    </main>
  )
}
