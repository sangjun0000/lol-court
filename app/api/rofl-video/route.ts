import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 간단하고 안정적인 영상 생성
    const videoBlob = await generateSimpleVideo()
    
    return new NextResponse(videoBlob, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
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

async function generateSimpleVideo(): Promise<Blob> {
  // 간단한 색상 변화 영상 (5초)
  const duration = 5
  const fps = 10 // 낮은 fps로 안정성 확보
  const totalFrames = duration * fps
  
  // 작은 해상도로 안정성 확보
  const frameWidth = 160
  const frameHeight = 120
  const bytesPerPixel = 3 // RGB
  const frameSize = frameWidth * frameHeight * bytesPerPixel
  
  // 전체 영상 데이터 크기
  const totalSize = totalFrames * frameSize + 512 // 작은 헤더
  
  const videoData = new Uint8Array(totalSize)
  let offset = 0
  
  // 간단한 MP4 헤더
  const mp4Header = new Uint8Array([
    0x00, 0x00, 0x00, 0x18, // Box size
    0x66, 0x74, 0x79, 0x70, // 'ftyp'
    0x6D, 0x70, 0x34, 0x32, // 'mp42'
    0x00, 0x00, 0x00, 0x00, // Minor version
    0x6D, 0x70, 0x34, 0x32, // 'mp42'
    0x69, 0x73, 0x6F, 0x6D  // 'isom'
  ])
  
  videoData.set(mp4Header, offset)
  offset += mp4Header.length
  
  // 각 프레임 생성 (간단한 색상 변화)
  for (let frame = 0; frame < totalFrames; frame++) {
    const time = frame / fps
    
    // 간단한 색상 계산
    const red = Math.floor(128 + 127 * Math.sin(time * 2))
    const green = Math.floor(128 + 127 * Math.sin(time * 2 + 2))
    const blue = Math.floor(128 + 127 * Math.sin(time * 2 + 4))
    
    // 프레임 데이터 생성 (단순한 단색)
    for (let y = 0; y < frameHeight; y++) {
      for (let x = 0; x < frameWidth; x++) {
        const pixelOffset = offset + (y * frameWidth + x) * 3
        
        videoData[pixelOffset] = red
        videoData[pixelOffset + 1] = green
        videoData[pixelOffset + 2] = blue
      }
    }
    
    offset += frameSize
  }
  
  return new Blob([videoData], { type: 'video/mp4' })
}
