import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // ROFL 파일의 본질을 설명하는 응답
    return NextResponse.json({
      success: true,
      message: 'ROFL 파일 변환 완료',
      explanation: {
        title: 'ROFL 파일의 특성',
        content: 'ROFL 파일은 실제 영상이 아닌 게임 데이터입니다. 실제 게임 영상을 보려면 League of Legends 클라이언트에서 리플레이를 재생하고 녹화해야 합니다.',
        alternatives: [
          '1. League of Legends 클라이언트에서 ROFL 파일을 열어 리플레이 재생',
          '2. 리플레이 재생 중 화면 녹화',
          '3. 녹화된 영상을 이 사이트에 업로드하여 분석'
        ]
      },
      videoUrl: null, // 실제 영상 URL은 없음
      isDataFile: true
    })
    
  } catch (error) {
    console.error('ROFL 파일 처리 오류:', error)
    return NextResponse.json(
      { error: 'ROFL 파일 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
