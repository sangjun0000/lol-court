import { NextRequest, NextResponse } from 'next/server'
import { LolAIJudge } from '@/app/lib/aiJudge'
import { LoLReinforcementLearning } from '@/app/lib/reinforcementLearning'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const videoFile = formData.get('video') as File
    const analysisType = formData.get('analysisType') as string
    const targetCharacters = JSON.parse(formData.get('targetCharacters') as string)
    const startTime = parseFloat(formData.get('startTime') as string)
    const endTime = parseFloat(formData.get('endTime') as string)
    const customDescription = formData.get('customDescription') as string

    if (!videoFile) {
      return NextResponse.json(
        { error: '영상 파일이 필요합니다.' },
        { status: 400 }
      )
    }

    // 파일 크기 제한 (100MB)
    if (videoFile.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: '영상 파일 크기는 100MB를 초과할 수 없습니다.' },
        { status: 400 }
      )
    }

    // AI 판사 초기화
    const aiJudge = process.env.OPENAI_API_KEY 
      ? new LolAIJudge(process.env.OPENAI_API_KEY)
      : null

    if (!aiJudge) {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    // 영상에서 프레임 추출
    const frames = await extractFramesFromVideo(videoFile, startTime, endTime)
    
    // 강화학습 시스템 초기화
    const rlSystem = new LoLReinforcementLearning()

    // 분석 유형에 따른 상황 설명 생성
    const situationDescription = generateSituationDescription(
      analysisType,
      targetCharacters,
      customDescription
    )

    // 게임 상태 추출 (영상에서 추출하거나 기본값 사용)
    const gameState = {
      gameTime: startTime,
      playerLevel: 10,
      teamGold: 15000,
      enemyGold: 14000,
      objectives: [],
      teamFights: 0,
      vision: 0.5,
      pressure: 0.5
    }

    // 강화학습 분석
    const rlAnalysis = rlSystem.generateAIVerdict(
      situationDescription,
      'unknown_action', // 영상에서 추출 필요
      gameState
    )

    // AI 영상 분석
    const aiVerdict = await aiJudge.analyzeVideo(frames)

    // 결과 통합
    const finalVerdict = {
      ...aiVerdict,
      reinforcementLearning: {
        optimalAction: rlAnalysis.optimalAction,
        expectedReward: rlAnalysis.expectedReward,
        playerReward: rlAnalysis.playerReward,
        fault: rlAnalysis.fault
      },
      videoAnalysis: {
        analysisType,
        targetCharacters,
        timeRange: {
          start: startTime,
          end: endTime,
          duration: endTime - startTime
        },
        framesAnalyzed: frames.length
      }
    }

    return NextResponse.json(finalVerdict)

  } catch (error) {
    console.error('영상 분석 오류:', error)
    return NextResponse.json(
      { error: '영상 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    )
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
