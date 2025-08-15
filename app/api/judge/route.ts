import { NextRequest, NextResponse } from 'next/server'
import { LolCourtAnalyzer } from '@/app/lib/verdictAnalyzer'

// 고급 롤문철 분석기 인스턴스
const analyzer = new LolCourtAnalyzer()

export async function POST(request: NextRequest) {
  try {
    const { case: caseDescription } = await request.json()

    if (!caseDescription) {
      return NextResponse.json(
        { error: '사건 설명이 필요합니다.' },
        { status: 400 }
      )
    }

    // 실제 OpenAI API 키가 있다면 여기서 OpenAI API를 호출
    // const openai = new OpenAI({
    //   apiKey: process.env.OPENAI_API_KEY,
    // })
    
    // const completion = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: [
    //     {
    //       role: "system",
    //       content: `당신은 리그 오브 레전드 게임 상황을 판단하는 AI 판사입니다. 
    //       주어진 게임 상황을 분석하여 공정하고 객관적인 판결을 내려주세요.
    //       
    //       판결 형식:
    //       - verdict: 간단한 판결 결과 (예: "무죄", "유죄", "정당한 행동" 등)
    //       - reasoning: 상세한 판결 근거 (2-3문장)
    //       - punishment: 처벌이 필요한 경우에만 포함 (선택사항)
    //       
    //       한국어로 응답해주세요.`
    //     },
    //     {
    //       role: "user",
    //       content: caseDescription
    //     }
    //   ],
    // })

    // 고급 롤문철 분석 시스템 사용
    const analysis = analyzer.analyzeCase(caseDescription)
    
    return NextResponse.json({
      verdict: analysis.verdict,
      reasoning: analysis.reasoning,
      punishment: analysis.punishment,
      confidence: analysis.confidence,
      factors: analysis.factors,
      recommendations: analysis.recommendations,
      characterAnalysis: analysis.characterAnalysis
    })

  } catch (error) {
    console.error('판결 API 오류:', error)
    return NextResponse.json(
      { error: '판결 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
