'use client'

interface Verdict {
  verdict: string
  reasoning: string
  punishment: string
  confidence: number
  factors: string[]
  recommendations: string[]
  characterAnalysis: string
  reinforcementLearning: string
  gameContext: string
  responsibilityAnalysis: string
}

interface VerdictDisplayProps {
  verdict: Verdict
}

export default function VerdictDisplay({ verdict }: VerdictDisplayProps) {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        ⚖️ 법원 판결문
      </h3>

      <div className="space-y-6">
        {/* 최종 판결 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">최종 판결</h4>
          <p className="text-lg font-bold text-blue-900">{verdict.verdict}</p>
        </div>

        {/* 판결 이유 */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">판결 이유</h4>
          <p className="text-gray-700">{verdict.reasoning}</p>
        </div>

        {/* 처벌 */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">처벌</h4>
          <p className="text-gray-700">{verdict.punishment}</p>
        </div>

        {/* 판결 요인 */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">판결 요인</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {verdict.factors.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        </div>

        {/* 권고사항 */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">권고사항</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {verdict.recommendations.map((recommendation, index) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
        </div>

        {/* 게임 컨텍스트 */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">게임 컨텍스트 정보</h4>
          <p className="text-gray-700">{verdict.gameContext}</p>
        </div>

        {/* 책임도 분석 */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">책임도 분석</h4>
          <p className="text-gray-700 whitespace-pre-line">{verdict.responsibilityAnalysis}</p>
        </div>

        {/* AI 판사 심리 분석 */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">AI 판사 심리 분석</h4>
          <p className="text-gray-700">{verdict.reinforcementLearning}</p>
        </div>

        {/* 피고별 책임 분석 */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">피고별 책임 분석</h4>
          <p className="text-gray-700 whitespace-pre-line">{verdict.characterAnalysis}</p>
        </div>

        {/* 신뢰도 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">판결 신뢰도</h4>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${verdict.confidence * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(verdict.confidence * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
