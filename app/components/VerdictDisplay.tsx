'use client'

import { Verdict } from '@/app/page'

interface VerdictDisplayProps {
  verdict: Verdict
}

export default function VerdictDisplay({ verdict }: VerdictDisplayProps) {
  const getVerdictColor = (verdict: string) => {
    if (verdict.includes('올바른') || verdict.includes('무죄')) return 'text-green-600'
    if (verdict.includes('개선') || verdict.includes('부분')) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getVerdictIcon = (verdict: string) => {
    if (verdict.includes('올바른') || verdict.includes('무죄')) return '✅'
    if (verdict.includes('개선') || verdict.includes('부분')) return '⚠️'
    return '❌'
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 메인 판결 카드 */}
      <div className="verdict-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-court-brown">
            {getVerdictIcon(verdict.verdict)} 판결
          </h2>
          <span className="text-sm text-gray-500">
            {verdict.timestamp.toLocaleString()}
          </span>
        </div>
        
        <div className="mb-4">
          <p className={`text-lg font-semibold ${getVerdictColor(verdict.verdict)}`}>
            {verdict.verdict}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">📋 판결 근거</h3>
          <p className="text-gray-700 leading-relaxed">{verdict.reasoning}</p>
        </div>

        {verdict.punishment && (
          <div className="bg-red-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-red-800 mb-2">⚖️ 제재 사항</h3>
            <p className="text-red-700">{verdict.punishment}</p>
          </div>
        )}
      </div>

      {/* 강화학습 분석 결과 */}
      {verdict.reinforcementLearning && (
        <div className="verdict-card bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-xl font-bold text-blue-800 mb-4">
            🤖 강화학습 분석 결과
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-blue-700 mb-2">최적 행동</h4>
              <p className="text-blue-800 font-medium">{verdict.reinforcementLearning.optimalAction}</p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-blue-700 mb-2">예상 보상</h4>
              <p className="text-blue-800 font-medium">{verdict.reinforcementLearning.expectedReward.toFixed(1)}</p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-blue-700 mb-2">플레이어 보상</h4>
              <p className="text-blue-800 font-medium">{verdict.reinforcementLearning.playerReward.toFixed(1)}</p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-blue-700 mb-2">잘못 정도</h4>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${verdict.reinforcementLearning.fault * 100}%` }}
                  ></div>
                </div>
                <span className="text-blue-800 font-medium">
                  {(verdict.reinforcementLearning.fault * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-100 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">📊 분석 설명</h4>
            <p className="text-blue-700 text-sm">
              강화학습 시스템이 각 행동의 보상값을 계산하여 최적의 선택을 도출했습니다. 
              플레이어의 행동과 최적 행동 간의 차이를 통해 잘못의 정도를 수치화했습니다.
            </p>
          </div>
        </div>
      )}

      {/* 신뢰도 */}
      {verdict.confidence && (
        <div className="verdict-card">
          <h3 className="font-semibold text-gray-800 mb-2">🎯 판결 신뢰도</h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-lol-gold h-3 rounded-full transition-all duration-300"
                style={{ width: `${verdict.confidence * 100}%` }}
              ></div>
            </div>
            <span className="text-gray-700 font-medium">
              {(verdict.confidence * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* 고려 요소 */}
      {verdict.factors && verdict.factors.length > 0 && (
        <div className="verdict-card">
          <h3 className="font-semibold text-gray-800 mb-3">🔍 고려한 요소</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {verdict.factors.map((factor, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-lol-gold">•</span>
                <span className="text-gray-700">{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 개선 제안 */}
      {verdict.recommendations && verdict.recommendations.length > 0 && (
        <div className="verdict-card">
          <h3 className="font-semibold text-gray-800 mb-3">💡 개선 제안</h3>
          <div className="space-y-2">
            {verdict.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-lol-gold mt-1">💡</span>
                <span className="text-gray-700">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 캐릭터별 책임 분석 */}
      {verdict.characterAnalysis && (
        <div className="bg-orange-50 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 mb-2">🎯 캐릭터별 책임 분석</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-orange-700 font-medium">주요 책임자:</span>
              <span className="text-orange-800 font-bold">{verdict.characterAnalysis.primaryFault}</span>
            </div>
            {verdict.characterAnalysis.secondaryFault && (
              <div className="flex items-center justify-between">
                <span className="text-orange-700 font-medium">보조 책임자:</span>
                <span className="text-orange-800 font-semibold">{verdict.characterAnalysis.secondaryFault}</span>
              </div>
            )}
            <div className="bg-orange-100 rounded-lg p-3 mt-3">
              <p className="text-orange-800 text-sm leading-relaxed">
                <strong>판결 근거:</strong> {verdict.characterAnalysis.faultComparison}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 영상 분석 정보 */}
      {verdict.videoAnalysis && (
        <div className="verdict-card bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="text-xl font-bold text-purple-800 mb-4">
            🎬 영상 분석 정보
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-purple-700 mb-2">분석 유형</h4>
              <p className="text-purple-800 font-medium">{verdict.videoAnalysis.analysisType}</p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-purple-700 mb-2">분석 구간</h4>
              <p className="text-purple-800 font-medium">
                {formatTime(verdict.videoAnalysis.timeRange.start)} ~ {formatTime(verdict.videoAnalysis.timeRange.end)}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-purple-700 mb-2">분석된 프레임</h4>
              <p className="text-purple-800 font-medium">{verdict.videoAnalysis.framesAnalyzed}개</p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-purple-700 mb-2">판결 대상</h4>
              <p className="text-purple-800 font-medium">{verdict.videoAnalysis.targetCharacters.join(', ')}</p>
            </div>
          </div>
          
          <div className="bg-purple-100 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-2">📊 분석 상세</h4>
            <p className="text-purple-700 text-sm">
              AI가 영상의 {verdict.videoAnalysis.framesAnalyzed}개 프레임을 분석하여 
              {formatTime(verdict.videoAnalysis.timeRange.duration)} 구간의 게임 상황을 판단했습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// 시간 포맷팅 함수
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
