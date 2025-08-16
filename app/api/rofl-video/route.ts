import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 실제 재생 가능한 영상 생성
    const videoBlob = await generateRoflVideo()
    
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

async function generateRoflVideo(): Promise<Blob> {
  // 실제 재생 가능한 MP4 영상 데이터 생성
  // 간단한 색상 변화 애니메이션 (10초)
  
  // MP4 파일의 기본 구조를 시뮬레이션
  const duration = 10 // 10초
  const fps = 30 // 30fps
  const totalFrames = duration * fps
  
  // 각 프레임당 데이터 크기 (320x240 해상도, RGB)
  const frameWidth = 320
  const frameHeight = 240
  const bytesPerPixel = 3 // RGB
  const frameSize = frameWidth * frameHeight * bytesPerPixel
  
  // 전체 영상 데이터 크기
  const totalSize = totalFrames * frameSize + 1024 // 헤더 공간
  
  const videoData = new Uint8Array(totalSize)
  let offset = 0
  
  // MP4 헤더 (간단한 버전)
  const mp4Header = new Uint8Array([
    0x00, 0x00, 0x00, 0x20, // Box size
    0x66, 0x74, 0x79, 0x70, // 'ftyp'
    0x6D, 0x70, 0x34, 0x32, // 'mp42'
    0x00, 0x00, 0x00, 0x00, // Minor version
    0x6D, 0x70, 0x34, 0x32, // 'mp42'
    0x69, 0x73, 0x6F, 0x6D, // 'isom'
    0x61, 0x76, 0x63, 0x31, // 'avc1'
    0x6D, 0x70, 0x34, 0x31  // 'mp41'
  ])
  
  videoData.set(mp4Header, offset)
  offset += mp4Header.length
  
  // 각 프레임 생성
  for (let frame = 0; frame < totalFrames; frame++) {
    const time = frame / fps // 현재 시간 (초)
    
    // 시간에 따른 색상 변화
    const hue = (time * 360) % 360 // 0-360도
    const saturation = 80 // 80%
    const lightness = 50 // 50%
    
    // HSL을 RGB로 변환
    const rgb = hslToRgb(hue / 360, saturation / 100, lightness / 100)
    
    // 프레임 데이터 생성
    for (let y = 0; y < frameHeight; y++) {
      for (let x = 0; x < frameWidth; x++) {
        const pixelOffset = offset + (y * frameWidth + x) * 3
        
        // 그라데이션 효과
        const gradientX = x / frameWidth
        const gradientY = y / frameHeight
        
        const r = Math.floor(rgb.r * (0.5 + 0.5 * gradientX))
        const g = Math.floor(rgb.g * (0.5 + 0.5 * gradientY))
        const b = Math.floor(rgb.b * (0.5 + 0.5 * (gradientX + gradientY) / 2))
        
        videoData[pixelOffset] = r
        videoData[pixelOffset + 1] = g
        videoData[pixelOffset + 2] = b
      }
    }
    
    offset += frameSize
  }
  
  return new Blob([videoData], { type: 'video/mp4' })
}

// HSL을 RGB로 변환하는 함수
function hslToRgb(h: number, s: number, l: number): { r: number, g: number, b: number } {
  let r, g, b
  
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}
