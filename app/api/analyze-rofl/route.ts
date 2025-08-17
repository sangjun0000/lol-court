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
  
  const participants = generateParticipants()
  const totalKills = Math.floor(baseDuration / 60) * 2
  const totalDeaths = Math.floor(baseDuration / 60) * 2
  const totalAssists = Math.floor(baseDuration / 60) * 3
  const objectives = {
    dragons: Math.floor(baseDuration / 300),
    barons: Math.floor(baseDuration / 600),
    towers: Math.floor(baseDuration / 200)
  }
  const teamfights = Math.floor(baseDuration / 180)
  const highlights = generateHighlights(baseDuration)

  return {
    fileName,
    fileSize,
    duration: baseDuration,
    gameMode: 'CLASSIC',
    mapId: 11, // Summoner's Rift
    participants,
    events: generateGameEvents(baseDuration),
    analysis: {
      totalKills,
      totalDeaths,
      totalAssists,
      objectives,
      teamfights,
      highlights,
      gameSummary: {
        duration: baseDuration,
        winner: Math.random() > 0.5 ? 100 : 200,
        gameType: 'CLASSIC',
        mapName: '소환사의 협곡'
      },
      teamAnalysis: {
        blueTeam: {
          totalKills: Math.floor(totalKills * 0.6),
          totalDeaths: Math.floor(totalDeaths * 0.4),
          totalAssists: Math.floor(totalAssists * 0.6),
          objectives: Math.floor((objectives.dragons + objectives.barons + objectives.towers) * 0.6),
          teamfightWins: Math.floor(teamfights * 0.6),
          evaluation: '블루팀은 초반 라인전에서 우위를 점했으며, 오브젝트 통제와 팀파이트에서 안정적인 플레이를 보여주었습니다.',
          strengths: ['초반 라인전 우위', '오브젝트 통제력', '팀워크'],
          weaknesses: ['후반 집중력 부족', '개별 플레이어 실수']
        },
        redTeam: {
          totalKills: Math.floor(totalKills * 0.4),
          totalDeaths: Math.floor(totalDeaths * 0.6),
          totalAssists: Math.floor(totalAssists * 0.4),
          objectives: Math.floor((objectives.dragons + objectives.barons + objectives.towers) * 0.4),
          teamfightWins: Math.floor(teamfights * 0.4),
          evaluation: '레드팀은 초반에 어려움을 겪었지만, 후반에 반격을 시도했으나 오브젝트 통제에서 밀렸습니다.',
          strengths: ['후반 집중력', '개별 플레이어 기량'],
          weaknesses: ['초반 라인전', '팀워크 부족', '오브젝트 통제력']
        }
      },
      metaAnalysis: {
        gamePhase: baseDuration > 1800 ? '장기전 - 후반 오브젝트 중심' : '중단기전 - 팀파이트 중심',
        keyMoments: [
          '첫 드래곤 스틸 시도',
          '중반 바론 오브젝트 전투',
          '후반 결정적 팀파이트',
          '최종 넥서스 돌파'
        ],
        turningPoints: [
          '15분경 첫 드래곤 전투에서 블루팀 승리',
          '25분경 바론 전투에서 레드팀 반격',
          '35분경 결정적 팀파이트에서 블루팀 승리'
        ],
        recommendations: [
          '레드팀: 초반 라인전 개선 필요',
          '블루팀: 후반 집중력 유지 필요',
          '전체: 오브젝트 타이밍 최적화',
          '팀워크 및 소통 개선 권장'
        ]
      }
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
  
  const participants = Array.from({ length: 10 }, (_, i) => {
    const kills = Math.floor(Math.random() * 10)
    const deaths = Math.floor(Math.random() * 8)
    const assists = Math.floor(Math.random() * 15)
    const cs = Math.floor(Math.random() * 300) + 100
    const level = Math.floor(Math.random() * 6) + 14
    
    // 점수 계산 (KDA, CS, 레벨 기반)
    const kdaScore = kills > 0 ? (kills + assists) / Math.max(deaths, 1) : 0
    const csScore = Math.min(cs / 300, 1) * 100
    const levelScore = (level / 18) * 100
    const totalScore = Math.round((kdaScore * 50 + csScore * 30 + levelScore * 20) / 100)
    
    return {
      id: i + 1,
      champion: champions[Math.floor(Math.random() * champions.length)],
      team: i < 5 ? 100 : 200,
      kills,
      deaths,
      assists,
      cs,
      level,
      rank: 0, // 나중에 계산
      evaluation: generatePlayerEvaluation(kills, deaths, assists, cs, level),
      score: Math.max(1, Math.min(100, totalScore))
    }
  })
  
  // 순위 계산
  const sortedByScore = [...participants].sort((a, b) => b.score - a.score)
  sortedByScore.forEach((player, index) => {
    player.rank = index + 1
  })
  
  return participants
}

function generatePlayerEvaluation(kills: number, deaths: number, assists: number, cs: number, level: number) {
  const kda = kills > 0 ? (kills + assists) / Math.max(deaths, 1) : 0
  
  if (kda > 5 && cs > 250) {
    return '완벽한 캐리 플레이를 보여주었으며, 팀의 승리에 크게 기여했습니다.'
  } else if (kda > 3 && cs > 200) {
    return '안정적인 플레이를 보여주었으며, 팀에 긍정적인 영향을 주었습니다.'
  } else if (kda > 1.5 && cs > 150) {
    return '평균적인 성과를 보여주었으며, 개선의 여지가 있습니다.'
  } else if (deaths > kills * 2) {
    return '과도한 데스로 인해 팀에 부담을 주었으며, 플레이 스타일 개선이 필요합니다.'
  } else {
    return '기본적인 역할은 수행했으나, 더 나은 성과를 위해 노력이 필요합니다.'
  }
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
