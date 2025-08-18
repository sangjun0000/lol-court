'use client'

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
  gameContext?: {
    totalKills: number
    totalDeaths: number
    totalAssists: number
    gameDuration: number
    participants: number
    mentionedChampions: string[]
    relevantPlayers: any[]
  }
  responsibilityAnalysis?: string
}

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
            {getVerdictIcon(verdict.verdict)} 법원 판결문
          </h2>
          <span className="text-sm text-gray-500">
            판결일시: {verdict.timestamp.toLocaleString()}
          </span>
        </div>
        
        <div className="mb-4">
          <p className={`text-lg font-semibold ${getVerdictColor(verdict.verdict)}`}>
            {verdict.verdict}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">📋 판결 이유</h3>
          <p className="text-gray-700 leading-relaxed">{verdict.reasoning}</p>
        </div>

        {verdict.punishment && (
          <div className="bg-red-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-red-800 mb-2">⚖️ 법원 제재</h3>
            <p className="text-red-700">{verdict.punishment}</p>
          </div>
        )}
      </div>

      {/* 강화학습 분석 결과 */}
      {verdict.reinforcementLearning && (
        <div className="verdict-card bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-xl font-bold text-blue-800 mb-4">
            🤖 AI 판사 심리 분석
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-blue-700 mb-2">AI 심리 분석</h4>
              <p className="text-blue-800 font-medium">{verdict.reinforcementLearning}</p>
            </div>
          </div>
          
          <div className="bg-blue-100 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">📊 심리 분석 설명</h4>
            <p className="text-blue-700 text-sm">
              AI 판사가 각 행동의 적절성을 분석하여 최적의 판단을 도출했습니다. 
              플레이어의 행동과 표준 행동 간의 차이를 통해 책임의 정도를 수치화했습니다.
            </p>
          </div>
        </div>
      )}

      {/* 신뢰도 */}
      {verdict.confidence && (
        <div className="verdict-card">
          <h3 className="font-semibold text-gray-800 mb-2">🎯 법원 판결 신뢰도</h3>
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
          <h3 className="font-semibold text-gray-800 mb-3">🔍 법원 심리 고려사항</h3>
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
          <h3 className="font-semibold text-gray-800 mb-3">💡 법원 권고사항</h3>
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

      {/* 게임 컨텍스트 정보 */}
      {verdict.gameContext && (
        <div className="verdict-card bg-gradient-to-r from-green-50 to-emerald-50">
          <h3 className="text-xl font-bold text-green-800 mb-4">
            🎮 게임 컨텍스트 정보
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-green-700 mb-2">게임 통계</h4>
              <p className="text-green-800 font-medium">
                총 킬: {verdict.gameContext.totalKills} | 
                총 데스: {verdict.gameContext.totalDeaths} | 
                총 어시스트: {verdict.gameContext.totalAssists}
              </p>
              <p className="text-green-800 font-medium">
                게임 시간: {Math.floor(verdict.gameContext.gameDuration / 60)}분 | 
                참가자: {verdict.gameContext.participants}명
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-green-700 mb-2">관련 챔피언</h4>
              <p className="text-green-800 font-medium">
                {verdict.gameContext.mentionedChampions.join(', ') || '없음'}
              </p>
            </div>
          </div>
          
          {verdict.gameContext.relevantPlayers.length > 0 && (
            <div className="bg-white rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-green-700 mb-2">관련 플레이어 성과</h4>
              <div className="space-y-2">
                {verdict.gameContext.relevantPlayers.map((player, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium text-green-800">{player.champion}</span>
                    <span className="text-sm text-gray-600">
                      KDA: {player.kills}/{player.deaths}/{player.assists} | 
                      CS: {player.cs} | 
                      점수: {player.score}점 (순위: {player.rank}위)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 책임도 분석 */}
      {verdict.responsibilityAnalysis && (
        <div className="bg-orange-50 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 mb-2">🎯 책임도 분석</h3>
          <div className="space-y-3">
            <p className="text-orange-800 text-sm whitespace-pre-line">
              {verdict.responsibilityAnalysis}
            </p>
          </div>
        </div>
      )}

      {/* 캐릭터별 책임 분석 */}
      {verdict.characterAnalysis && (
        <div className="bg-orange-50 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 mb-2">🎯 피고별 책임 분석</h3>
          <div className="space-y-3">
            <p className="text-orange-800 text-sm">
              {verdict.characterAnalysis}
            </p>
          </div>
        </div>
      )}

      {/* 영상 분석 정보 */}
      {verdict.videoAnalysis && (
        <div className="verdict-card bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="text-xl font-bold text-purple-800 mb-4">
            🎬 증거 자료 분석 정보
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-purple-700 mb-2">심리 유형</h4>
              <p className="text-purple-800 font-medium">{verdict.videoAnalysis.analysisType}</p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-purple-700 mb-2">심리 구간</h4>
              <p className="text-purple-800 font-medium">
                {formatTime(verdict.videoAnalysis.timeRange.start)} ~ {formatTime(verdict.videoAnalysis.timeRange.end)}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-purple-700 mb-2">심리된 증거</h4>
              <p className="text-purple-800 font-medium">{verdict.videoAnalysis.framesAnalyzed}개</p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-purple-700 mb-2">소송 당사자</h4>
              <p className="text-purple-800 font-medium">{verdict.videoAnalysis.targetCharacters.join(', ')}</p>
            </div>
          </div>
          
          <div className="bg-purple-100 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-2">📊 심리 상세</h4>
            <p className="text-purple-700 text-sm">
              AI 판사가 증거 자료의 {verdict.videoAnalysis.framesAnalyzed}개 요소를 심리하여 
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
