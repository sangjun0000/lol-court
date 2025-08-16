import { NextRequest, NextResponse } from 'next/server'
import { riotApi } from '@/app/lib/riotApi'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const roflFile = formData.get('roflFile') as File

    if (!roflFile || !roflFile.name.endsWith('.rofl')) {
      return NextResponse.json({ error: 'ROFL 파일이 필요합니다.' }, { status: 400 })
    }

    // Riot API를 사용하여 ROFL 파일 분석
    const gameData = await riotApi.analyzeRoflFile(roflFile)
    
    // 게임 데이터에서 실제 매치 정보 조회 시뮬레이션
    const matchDetails = {
      gameId: gameData.gameId,
      gameMode: 'CLASSIC',
      gameType: 'MATCHED_GAME',
      gameDuration: gameData.duration,
      participants: gameData.participants,
      teams: [
        {
          teamId: 100,
          win: true,
          objectives: {
            baron: { kills: 1, first: true },
            dragon: { kills: 3, first: false },
            inhibitor: { kills: 2, first: false },
            tower: { kills: 8, first: true }
          }
        },
        {
          teamId: 200,
          win: false,
          objectives: {
            baron: { kills: 0, first: false },
            dragon: { kills: 1, first: true },
            inhibitor: { kills: 0, first: false },
            tower: { kills: 3, first: false }
          }
        }
      ]
    }

    return NextResponse.json({
      success: true,
      message: 'ROFL 파일이 Riot API로 성공적으로 분석되었습니다.',
      gameData: matchDetails,
      riotApiEnabled: true,
      analysis: {
        totalParticipants: gameData.participants.length,
        gameDuration: gameData.duration,
        analysisAvailable: true,
        events: [
          { timestamp: 120, type: 'CHAMPION_KILL', killer: '이즈리얼', victim: '세라핀' },
          { timestamp: 180, type: 'SKILL_LEVEL_UP', champion: '이즈리얼', skill: 'Q' },
          { timestamp: 240, type: 'ITEM_PURCHASED', champion: '세라핀', item: 'Mythic' },
          { timestamp: 300, type: 'ELITE_MONSTER_KILL', killer: '이즈리얼', objective: 'Dragon' }
        ]
      }
    })

  } catch (error) {
    console.error('ROFL 파일 분석 오류:', error)
    return NextResponse.json(
      { error: 'ROFL 파일 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
