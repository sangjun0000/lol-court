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
  // 빠른 영상 생성 (1초 이내)
  const canvas = new OffscreenCanvas(1280, 720)
  const ctx = canvas.getContext('2d')!
  
  // MediaRecorder를 사용하여 영상 녹화
  const stream = canvas.captureStream(30) // 30fps
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9'
  })
  
  const chunks: Blob[] = []
  
  return new Promise((resolve) => {
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      resolve(blob)
    }
    
    mediaRecorder.start()
    
    // 빠른 게임 맵 애니메이션 생성 (5초로 단축)
    let frame = 0
    const totalFrames = 150 // 5초 (30fps)
    
    const animate = () => {
      // 맵 배경 그리기
      ctx.fillStyle = '#2d5a27' // 소환사의 협곡 녹색
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 미니맵 그리기
      ctx.fillStyle = '#1a3d1a'
      ctx.fillRect(10, 10, 200, 200)
      
      // 챔피언들 그리기 (더미 데이터)
      const champions = [
        { name: '이즈리얼', x: 200 + Math.sin(frame * 0.2) * 100, y: 200 + Math.cos(frame * 0.2) * 100, color: '#ff6b6b' },
        { name: '세라핀', x: 400 + Math.sin(frame * 0.3) * 80, y: 300 + Math.cos(frame * 0.3) * 80, color: '#4ecdc4' },
        { name: '리신', x: 600 + Math.sin(frame * 0.4) * 120, y: 400 + Math.cos(frame * 0.4) * 120, color: '#45b7d1' }
      ]
      
      champions.forEach(champ => {
        // 챔피언 원 그리기
        ctx.fillStyle = champ.color
        ctx.beginPath()
        ctx.arc(champ.x, champ.y, 15, 0, 2 * Math.PI)
        ctx.fill()
        
        // 챔피언 이름
        ctx.fillStyle = 'white'
        ctx.font = 'bold 14px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(champ.name, champ.x, champ.y - 25)
        
        // 체력바
        ctx.fillStyle = '#2ecc71'
        ctx.fillRect(champ.x - 20, champ.y + 20, 40, 5)
      })
      
      // 시간 표시
      ctx.fillStyle = 'white'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'left'
      const time = Math.floor(frame / 30)
      ctx.fillText(`${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`, 20, 50)
      
      // 게임 이벤트 표시 (더 자주)
      if (frame % 30 === 0) { // 1초마다
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.font = '16px Arial'
        ctx.fillText('⚔️ 팀파이트!', canvas.width - 200, 50)
      }
      
      frame++
      
      if (frame < totalFrames) {
        requestAnimationFrame(animate)
      } else {
        mediaRecorder.stop()
      }
    }
    
    animate()
  })
}
