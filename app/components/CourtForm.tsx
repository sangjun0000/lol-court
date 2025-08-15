'use client'

import { useState } from 'react'

interface CourtFormProps {
  onSubmit: (caseDescription: string) => void
  isLoading: boolean
}

export default function CourtForm({ onSubmit, isLoading }: CourtFormProps) {
  const [caseDescription, setCaseDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (caseDescription.trim()) {
      onSubmit(caseDescription.trim())
    }
  }

  const exampleCases = [
    "리 신이 탑 라인에 갱을 왔는데 다리우스가 도망가서 갱이 실패했습니다. 리 신이 다리우스를 비난하는 것이 맞나요?",
    "야스오가 CS를 잘 먹고 있었는데 카직스가 계속 와서 CS를 뺏어갔습니다. 야스오가 화를 내는 것이 정당한가요?",
    "이즈리얼이 쓰레쉬에게 계속 명령을 하고 쓰레쉬가 불만을 표시했습니다. 누구의 잘못인가요?",
    "트런들이 계속 죽어서 상대팀이 너무 강해졌는데, 그 팀원을 비난하는 것이 맞나요?",
    "렉사이가 드래곤을 놓쳤는데 베인이 도움을 주지 않았습니다. 누구의 책임인가요?"
  ]

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8">
      <h2 className="text-3xl font-bold text-court-brown mb-6 text-center">
        📋 사건 접수
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="case" className="block text-lg font-semibold text-gray-700 mb-3">
            게임 상황을 자세히 설명해주세요:
          </label>
          <textarea
            id="case"
            value={caseDescription}
            onChange={(e) => setCaseDescription(e.target.value)}
            placeholder="예: 정글러가 탑 라인에 갱을 왔는데 탑 라이너가 도망가서 갱이 실패했습니다. 정글러가 탑 라이너를 비난하는 것이 맞나요?"
            className="input-field h-32 resize-none"
            required
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-2">💡 예시 사건들:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {exampleCases.map((example, index) => (
              <li key={index} className="cursor-pointer hover:text-lol-blue" 
                  onClick={() => setCaseDescription(example)}>
                • {example}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          disabled={isLoading || !caseDescription.trim()}
          className="court-button w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              판결 심의 중...
            </span>
          ) : (
            '⚖️ 판결 요청하기'
          )}
        </button>
      </form>
    </div>
  )
}
