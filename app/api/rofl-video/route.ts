import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 실제로는 ROFL 파일에서 추출한 게임 데이터를 기반으로 
    // Canvas API를 사용하여 동적으로 영상을 생성해야 합니다
    
    // 현재는 테스트용으로 간단한 애니메이션 영상 생성
    const videoBlob = await generateRoflVideo()
    
    return new NextResponse(videoBlob, {
      status: 200,
      headers: {
        'Content-Type': 'video/webm',
        'Content-Length': videoBlob.size.toString(),
        'Cache-Control': 'public, max-age=3600'
      }
    })
    
  } catch (error) {
    console.error('ROFL 영상 생성 오류:', error)
    return NextResponse.json(
      { error: 'ROFL 영상 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

async function generateRoflVideo(): Promise<Blob> {
  // 서버 사이드에서는 간단한 더미 영상 생성
  // OffscreenCanvas는 서버에서 사용할 수 없으므로 더미 데이터만 반환
  
  // 간단한 더미 영상 Blob 생성 (1KB)
  const dummyVideoData = new Uint8Array(1024)
  
  // 더미 데이터에 간단한 패턴 생성
  for (let i = 0; i < dummyVideoData.length; i++) {
    dummyVideoData[i] = Math.floor(Math.random() * 256)
  }
  
  return new Blob([dummyVideoData], { type: 'video/webm' })
}
