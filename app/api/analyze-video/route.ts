import { NextRequest, NextResponse } from 'next/server'
import { LolAIJudge } from '@/app/lib/aiJudge'
import { LoLReinforcementLearning } from '@/app/lib/reinforcementLearning'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const videoFile = formData.get('videoFile') as File
    const startTime = parseFloat(formData.get('startTime') as string)
    const endTime = parseFloat(formData.get('endTime') as string)
    const customDescription = formData.get('customDescription') as string
    const targetCharacters = JSON.parse(formData.get('targetCharacters') as string)

    if (!videoFile) {
      return NextResponse.json({ error: '영상 파일이 필요합니다.' }, { status: 400 })
    }

    // ROFL 파일 처리
    if (videoFile.name.endsWith('.rofl')) {
      return await handleRoflFile(videoFile, customDescription, targetCharacters)
    }

    // 일반 영상 파일 처리
    return await handleVideoFile(videoFile, startTime, endTime, customDescription, targetCharacters)
  } catch (error) {
    console.error('영상 분석 오류:', error)
    return NextResponse.json({ error: '영상 분석 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

async function handleRoflFile(videoFile: File, customDescription: string, targetCharacters: string[]) {
  try {
    // ROFL 파일을 임시로 저장
    const roflBuffer = await videoFile.arrayBuffer()
    
    // ROFL 파일 정보 추출 (실제로는 더 복잡한 파싱 필요)
    const roflInfo = await extractRoflInfo(roflBuffer)
    
    // AI 판사에게 ROFL 데이터 기반 분석 요청
    const aiJudge = new LolAIJudge()
    const verdict = await aiJudge.judgeRoflReplay({
      roflData: roflBuffer,
      roflInfo,
      customDescription,
      targetCharacters
    })

    return NextResponse.json({ verdict })
  } catch (error) {
    console.error('ROFL 파일 처리 오류:', error)
    return NextResponse.json({ 
      error: 'ROFL 파일 처리 중 오류가 발생했습니다. 영상 파일로 변환 후 다시 시도해주세요.' 
    }, { status: 500 })
  }
}

async function handleVideoFile(videoFile: File, startTime: number, endTime: number, customDescription: string, targetCharacters: string[]) {
  try {
    // 기존 영상 처리 로직
    const aiJudge = new LolAIJudge()
    const verdict = await aiJudge.judgeVideo({
      videoFile,
      startTime,
      endTime,
      customDescription,
      targetCharacters
    })

    return NextResponse.json({ verdict })
  } catch (error) {
    console.error('영상 파일 처리 오류:', error)
    return NextResponse.json({ error: '영상 분석 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

async function extractRoflInfo(buffer: ArrayBuffer) {
  // ROFL 파일 헤더 정보 추출 (실제 구현 필요)
  const view = new DataView(buffer)
  
  // 기본적인 ROFL 파일 정보 추출
  return {
    gameVersion: 'Unknown',
    gameDuration: 0,
    players: [],
    events: []
  }
}

// 영상에서 프레임 추출
async function extractFramesFromVideo(
  videoFile: File, 
  startTime: number, 
  endTime: number
): Promise<string[]> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const frames: string[] = []
      const frameInterval = 2 // 2초마다 프레임 추출
      
      for (let time = startTime; time <= endTime; time += frameInterval) {
        video.currentTime = time
        video.onseeked = () => {
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            const frameData = canvas.toDataURL('image/jpeg', 0.8)
            frames.push(frameData)
            
            if (time + frameInterval > endTime) {
              resolve(frames)
            }
          }
        }
      }
    }
    
    video.src = URL.createObjectURL(videoFile)
  })
}

// 분석 유형에 따른 상황 설명 생성
function generateSituationDescription(
  analysisType: string,
  targetCharacters: string[],
  customDescription?: string
): string {
  const characterList = targetCharacters.join(', ')
  
  switch (analysisType) {
    case 'teamfight':
      return `팀파이트 상황에서 ${characterList}의 판단을 분석합니다.`
    case 'gank':
      return `갱킹 상황에서 ${characterList}의 판단을 분석합니다.`
    case 'objective':
      return `오브젝트 상황에서 ${characterList}의 판단을 분석합니다.`
    case 'laning':
      return `라인전 상황에서 ${characterList}의 판단을 분석합니다.`
    case 'custom':
      return customDescription || `커스텀 상황에서 ${characterList}의 판단을 분석합니다.`
    default:
      return `${characterList}의 게임 플레이를 분석합니다.`
  }
}
