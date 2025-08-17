import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const roflFile = formData.get('roflFile') as File

    if (!roflFile) {
      return NextResponse.json(
        { error: 'ROFL 파일이 필요합니다.' },
        { status: 400 }
      )
    }

    if (!roflFile.name.endsWith('.rofl')) {
      return NextResponse.json(
        { error: 'ROFL 파일만 업로드 가능합니다.' },
        { status: 400 }
      )
    }

    // ROFL 파일 분석 시뮬레이션
    // 실제로는 ROFL 파일을 파싱하여 게임 데이터를 추출해야 합니다
    const gameData = await analyzeRoflFile(roflFile)

    return NextResponse.json({
      success: true,
      gameData,
      gameDuration: gameData.duration,
      message: 'ROFL 파일 분석이 완료되었습니다.'
    })

  } catch (error) {
    console.error('ROFL 분석 오류:', error)
    return NextResponse.json(
      { error: 'ROFL 파일 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

async function analyzeRoflFile(file: File) {
  // 실제 ROFL 파일 분석 로직
  // 현재는 시뮬레이션 데이터를 반환합니다
  
  const fileSize = file.size
  const fileName = file.name
  
  // 파일 크기와 이름을 기반으로 게임 데이터 시뮬레이션
  const baseDuration = Math.max(600, Math.min(2400, fileSize / 1000)) // 10-40분
  
  return {
    fileName,
    fileSize,
    duration: baseDuration,
    gameMode: 'CLASSIC',
    mapId: 11, // Summoner's Rift
    participants: generateParticipants(),
    events: generateGameEvents(baseDuration),
    analysis: {
      totalKills: Math.floor(baseDuration / 60) * 2,
      totalDeaths: Math.floor(baseDuration / 60) * 2,
      totalAssists: Math.floor(baseDuration / 60) * 3,
      objectives: {
        dragons: Math.floor(baseDuration / 300),
        barons: Math.floor(baseDuration / 600),
        towers: Math.floor(baseDuration / 200)
      },
      teamfights: Math.floor(baseDuration / 180),
      highlights: generateHighlights(baseDuration)
    }
  }
}

function generateParticipants() {
  const champions = [
    '이즈리얼', '세라핀', '리신', '다리우스', '트런들', '야스오', '진', '카이사',
    '루시안', '베인', '케이틀린', '애쉬', '징크스', '트리스타나', '드레이븐',
    '미스 포츈', '카직스', '렉사이', '엘리스', '누누', '람머스', '아무무',
    '피들스틱', '갱플랭크', '가렌', '나서스', '말파이트', '오른', '쉔', '케넨'
  ]
  
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    champion: champions[Math.floor(Math.random() * champions.length)],
    team: i < 5 ? 100 : 200,
    kills: Math.floor(Math.random() * 10),
    deaths: Math.floor(Math.random() * 8),
    assists: Math.floor(Math.random() * 15),
    cs: Math.floor(Math.random() * 300) + 100,
    level: Math.floor(Math.random() * 6) + 14
  }))
}

function generateGameEvents(duration: number) {
  const events = []
  const eventTypes = ['CHAMPION_KILL', 'ELITE_MONSTER_KILL', 'BUILDING_KILL', 'WARD_PLACED', 'WARD_KILL']
  
  for (let i = 0; i < duration / 30; i++) { // 30초마다 이벤트
    events.push({
      timestamp: i * 30000,
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      participantId: Math.floor(Math.random() * 10) + 1
    })
  }
  
  return events
}

function generateHighlights(duration: number) {
  const highlights = []
  const highlightTypes = [
    '팀파이트', '오브젝트 스틸', '역전 킬', '퍼펙트 게임', '캐리 플레이',
    '드래곤 스틸', '바론 스틸', '타워 다이브', '백도어', '에이스'
  ]
  
  for (let i = 0; i < 5; i++) {
    highlights.push({
      time: Math.floor(Math.random() * duration),
      type: highlightTypes[Math.floor(Math.random() * highlightTypes.length)],
      description: `${highlightTypes[Math.floor(Math.random() * highlightTypes.length)]} 구간`,
      participants: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => Math.floor(Math.random() * 10) + 1)
    })
  }
  
  return highlights.sort((a, b) => a.time - b.time)
}
