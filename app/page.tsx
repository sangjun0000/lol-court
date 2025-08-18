'use client'

import { useState } from 'react'
import Header from './components/Header'
import VideoUpload from './components/VideoUpload'
import VerdictDisplay from './components/VerdictDisplay'
import GameEvaluation from './components/GameEvaluation'

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

export default function Home() {
  const [gameData, setGameData] = useState<any>(null)
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [showGameEvaluation, setShowGameEvaluation] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleVideoUpload = async (uploadedGameData: any) => {
    setGameData(uploadedGameData)
    setShowGameEvaluation(true)
  }

  const handleVerdictRequest = async (caseDescription: string) => {
    if (!gameData) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/judge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseDescription,
          gameData
        })
      })

      if (!response.ok) {
        throw new Error('판결 처리 중 오류가 발생했습니다.')
      }

      const judgeData = await response.json()
      setVerdict(judgeData)

    } catch (error) {
      console.error('판결 오류:', error)
      alert('판결 처리 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <Header />

        <main className="space-y-8">
          {!gameData ? (
            <VideoUpload onAnalysisComplete={handleVideoUpload} />
          ) : (
            <div className="space-y-8">
              {showGameEvaluation && (
                <GameEvaluation 
                  gameData={gameData} 
                  onVerdictRequest={handleVerdictRequest}
                  isLoading={isLoading}
                />
              )}
              
              {verdict && (
                <VerdictDisplay verdict={verdict} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

