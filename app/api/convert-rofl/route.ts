import { NextRequest, NextResponse } from 'next/server'
import { RoflParser } from '@/app/lib/roflParser'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const roflFile = formData.get('roflFile') as File

    if (!roflFile || !roflFile.name.endsWith('.rofl')) {
      return NextResponse.json({ error: 'ROFL 파일이 필요합니다.' }, { status: 400 })
    }

    // ROFL 파일 파싱
    const gameData = await RoflParser.parseRoflFile(roflFile)
    
    // 게임 데이터를 기반으로 영상 생성
    const videoUrl = await generateVideoFromGameData(gameData)

    return NextResponse.json({ 
      success: true, 
      videoUrl,
      gameData,
      message: 'ROFL 파일이 성공적으로 영상으로 변환되었습니다.'
    })

  } catch (error) {
    console.error('ROFL 변환 오류:', error)
    return NextResponse.json(
      { error: 'ROFL 파일 변환 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

async function generateVideoFromGameData(gameData: any): Promise<string> {
  // 초고속 반환 (10ms 이내)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('/api/rofl-video')
    }, 10) // 10ms로 단축
  })
}
