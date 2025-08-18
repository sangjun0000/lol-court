'use client'

import { useState } from 'react'

interface GameEvaluationProps {
  gameData: any
  onVerdictRequest: (caseDescription: string) => void
  isLoading: boolean
}

export default function GameEvaluation({ gameData, onVerdictRequest, isLoading }: GameEvaluationProps) {
  const [caseDescription, setCaseDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (caseDescription.trim()) {
      onVerdictRequest(caseDescription)
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        게임 분석 결과 및 판결 요청
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 게임 통계 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">게임 통계</h4>
          <div className="space-y-2 text-sm">
            <p>게임 시간: {Math.floor(gameData.duration / 60)}분</p>
            <p>총 킬: {gameData.analysis.totalKills}</p>
            <p>총 데스: {gameData.analysis.totalDeaths}</p>
            <p>총 어시스트: {gameData.analysis.totalAssists}</p>
            <p>드래곤: {gameData.analysis.objectives.dragons}개</p>
            <p>바론: {gameData.analysis.objectives.barons}개</p>
            <p>타워: {gameData.analysis.objectives.towers}개</p>
          </div>
        </div>

        {/* 플레이어 순위 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">플레이어 순위</h4>
          <div className="space-y-2">
            {gameData.participants.slice(0, 5).map((player: any) => (
              <div key={player.id} className="flex justify-between text-sm">
                <span>{player.rank}위: {player.champion}</span>
                <span className="text-gray-600">점수: {player.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 판결 요청 폼 */}
      <div className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              소송 사유 진술 *
            </label>
            <textarea
              value={caseDescription}
              onChange={(e) => setCaseDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="예시: 이즈리얼과 세라핀 중 누구의 잘못이 더 큰지 판결해주세요. 이즈리얼이 세라핀의 궁극기를 피하지 못해서 팀파이트에서 패배했습니다."
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !caseDescription.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? '⚖️ 판결 심의 중...' : '⚖️ 법원 판결 시작'}
          </button>
        </form>
      </div>
    </div>
  )
}
