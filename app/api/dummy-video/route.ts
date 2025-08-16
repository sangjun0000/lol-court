import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // 실제로는 정적 영상 파일을 제공하거나, 
  // ROFL에서 변환된 영상 파일을 스트리밍해야 함
  
  // 현재는 테스트용으로 빈 응답을 반환
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Length': '0'
    }
  })
}
