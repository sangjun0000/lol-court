import { NextRequest, NextResponse } from 'next/server'
import { LolCourtAnalyzer } from '@/app/lib/verdictAnalyzer'

export async function POST(request: NextRequest) {
  try {
    const { caseDescription, gameData } = await request.json()

    if (!caseDescription) {
      return NextResponse.json(
        { error: '소송 사유가 필요합니다.' },
        { status: 400 }
      )
    }

    // 자체 판결 시스템 사용
    const analyzer = new LolCourtAnalyzer()
    const analysis = analyzer.analyzeCase(caseDescription, gameData)

    return NextResponse.json({
      success: true,
      ...analysis
    })

  } catch (error) {
    console.error('판결 처리 오류:', error)
    return NextResponse.json(
      { error: '판결 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
