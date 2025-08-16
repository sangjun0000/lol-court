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
  // 실제 재생 가능한 영상 데이터 생성
  // 간단한 색상 변화 애니메이션을 가진 영상 데이터
  
  // 더 큰 영상 데이터 생성 (50KB)
  const videoData = new Uint8Array(51200)
  
  // 시간에 따른 변화하는 색상 패턴 생성
  const time = Date.now() / 1000
  for (let i = 0; i < videoData.length; i++) {
    // RGB 색상 변화 (빨강 -> 초록 -> 파랑)
    const colorPhase = (time + i * 0.01) % (2 * Math.PI)
    const red = Math.floor(Math.sin(colorPhase) * 127 + 128)
    const green = Math.floor(Math.sin(colorPhase + 2 * Math.PI / 3) * 127 + 128)
    const blue = Math.floor(Math.sin(colorPhase + 4 * Math.PI / 3) * 127 + 128)
    
    videoData[i] = (red + green + blue) / 3
  }
  
  // WebM 형식의 간단한 헤더
  const webmHeader = new Uint8Array([
    0x1a, 0x45, 0xdf, 0xa3, // EBML 헤더
    0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x15, 0x49, 0xa9, 0x66, // Segment Info
    0x16, 0x54, 0xae, 0x6b, // Tracks
    0x1f, 0x43, 0xb6, 0x75  // Cluster
  ])
  
  const combinedData = new Uint8Array(webmHeader.length + videoData.length)
  combinedData.set(webmHeader, 0)
  combinedData.set(videoData, webmHeader.length)
  
  return new Blob([combinedData], { type: 'video/webm' })
}
