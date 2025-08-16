import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 실제 재생 가능한 영상으로 리다이렉트
    // 간단한 색상 변화 애니메이션 영상
    const videoUrl = 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
    
    return NextResponse.redirect(videoUrl)
    
  } catch (error) {
    console.error('ROFL 영상 리다이렉트 오류:', error)
    return NextResponse.json(
      { error: 'ROFL 영상 로드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
