'use client'

import { useState } from 'react'

interface GameEvaluationProps {
  gameData: any
  caseDescription: string
  onVerdictRequest: () => void
  isLoading: boolean
}

export default function GameEvaluation({ gameData, caseDescription, onVerdictRequest, isLoading }: GameEvaluationProps) {
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

      {/* 소송 사유 표시 */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">소송 사유</h4>
        <p className="text-blue-700">{caseDescription}</p>
      </div>

      {/* 판결 시작 버튼 */}
      <div className="mt-6">
        <button
          onClick={onVerdictRequest}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? '⚖️ 판결 심의 중...' : '⚖️ 법원 판결 시작'}
        </button>
      </div>
    </div>
  )
}
