import { Verdict } from '../page'

interface VerdictDisplayProps {
  verdict: Verdict
}

export default function VerdictDisplay({ verdict }: VerdictDisplayProps) {
  const getVerdictColor = (verdict: string) => {
    if (verdict.includes('무죄') || verdict.includes('정당') || verdict.includes('합리')) {
      return 'text-green-600'
    } else if (verdict.includes('유죄') || verdict.includes('부당') || verdict.includes('잘못')) {
      return 'text-red-600'
    } else {
      return 'text-blue-600'
    }
  }

  const getVerdictIcon = (verdict: string) => {
    if (verdict.includes('무죄') || verdict.includes('정당') || verdict.includes('합리')) {
      return '✅'
    } else if (verdict.includes('유죄') || verdict.includes('부당') || verdict.includes('잘못')) {
      return '❌'
    } else {
      return '⚖️'
    }
  }

  return (
    <div className="verdict-card">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-court-brown mb-2">
          🏛️ 최종 판결
        </h2>
        <p className="text-gray-500">
          {verdict.timestamp.toLocaleString('ko-KR')}
        </p>
      </div>

      <div className="space-y-6">
        {/* 사건 요약 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-2">📋 사건 요약</h3>
          <p className="text-gray-600 leading-relaxed">{verdict.case}</p>
        </div>

        {/* 최종 판결 */}
        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-lol-gold to-yellow-400 rounded-full p-1 mb-4">
            <div className="bg-white rounded-full p-4">
              <span className="text-4xl">{getVerdictIcon(verdict.verdict)}</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2">최종 판결</h3>
          <p className={`text-xl font-semibold ${getVerdictColor(verdict.verdict)}`}>
            {verdict.verdict}
          </p>
        </div>

        {/* 판결 근거 */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">🔍 판결 근거</h3>
          <p className="text-blue-700 leading-relaxed whitespace-pre-line">
            {verdict.reasoning}
          </p>
        </div>

        {/* 처벌 (있는 경우) */}
        {verdict.punishment && (
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">⚡ 처벌</h3>
            <p className="text-red-700 leading-relaxed">
              {verdict.punishment}
            </p>
          </div>
        )}

        {/* 분석 신뢰도 */}
        {verdict.confidence && (
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">📊 분석 신뢰도</h3>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${verdict.confidence * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-green-700">
                {Math.round(verdict.confidence * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* 판결 요인 */}
        {verdict.factors && verdict.factors.length > 0 && (
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-800 mb-2">🔍 판결 요인</h3>
            <div className="flex flex-wrap gap-2">
              {verdict.factors.map((factor, index) => (
                <span 
                  key={index}
                  className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {factor}
                </span>
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

        {/* 개선 권고사항 */}
        {verdict.recommendations && verdict.recommendations.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">💡 개선 권고사항</h3>
            <ul className="space-y-2">
              {verdict.recommendations.map((recommendation, index) => (
                <li key={index} className="text-blue-700 text-sm flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 법원 문구 */}
        <div className="text-center text-gray-500 text-sm border-t pt-4">
          <p>⚖️ 롤법원 - 공정한 판결을 위한 최고의 법원</p>
          <p className="mt-1">이 판결은 AI가 객관적으로 분석한 결과입니다.</p>
        </div>
      </div>
    </div>
  )
}
