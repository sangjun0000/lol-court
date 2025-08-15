'use client'

import { useState } from 'react'
import CourtForm from './components/CourtForm'
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
}

export default function Home() {
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
        throw new Error('판결 요청에 실패했습니다')
      }

      const data = await response.json()
      setVerdict({
        case: caseDescription,
        verdict: data.verdict,
        reasoning: data.reasoning,
        punishment: data.punishment,
        confidence: data.confidence,
        factors: data.factors,
        recommendations: data.recommendations,
        characterAnalysis: data.characterAnalysis,
        timestamp: new Date(),
      })
    } catch (error) {
      console.error('Error:', error)
      alert('판결을 받아오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Header />
      
      <div className="max-w-4xl mx-auto mt-8">
        <CourtForm onSubmit={handleSubmitCase} isLoading={isLoading} />
        
        {verdict && (
          <div className="mt-8">
            <VerdictDisplay verdict={verdict} />
          </div>
        )}
      </div>
    </main>
  )
}
