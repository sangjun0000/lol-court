import { NextRequest, NextResponse } from 'next/server'

// 롤 API 키 (환경변수에서 가져옴)
const RIOT_API_KEY = process.env.RIOT_API_KEY || 'RGAPI-1e6d8794-f7cd-4bd2-b8fd-d798ccd9b7f0'

export async function POST(request: NextRequest) {
  try {
    const { matchId, region } = await request.json()

    if (!matchId) {
      return NextResponse.json(
        { error: '매치 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    if (!RIOT_API_KEY) {
      return NextResponse.json(
        { error: 'Riot API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    // 매치 API 엔드포인트 매핑
    const getMatchEndpoint = (region: string) => {
      const matchRegionMap: { [key: string]: string } = {
        'kr': 'asia',
        'jp1': 'asia',
        'ph2': 'asia',
        'sg2': 'asia',
        'th2': 'asia',
        'tw2': 'asia',
        'vn2': 'asia',
        'na1': 'americas',
        'br1': 'americas',
        'la1': 'americas',
        'la2': 'americas',
        'euw1': 'europe',
        'eun1': 'europe',
        'tr1': 'europe',
        'ru': 'europe',
        'oc1': 'americas'
      }
      return matchRegionMap[region] || 'asia'
    }

    const matchEndpoint = getMatchEndpoint(region)

    // 1. 매치 정보 가져오기
    const matchResponse = await fetch(
      `https://${matchEndpoint}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY
        }
      }
    )

    if (!matchResponse.ok) {
      if (matchResponse.status === 404) {
        return NextResponse.json(
          { error: '매치를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }
      if (matchResponse.status === 403) {
        return NextResponse.json(
          { error: 'API 키가 유효하지 않습니다.' },
          { status: 403 }
        )
      }
      if (matchResponse.status === 429) {
        return NextResponse.json(
          { error: 'API 호출 한도를 초과했습니다.' },
          { status: 429 }
        )
      }
      throw new Error(`매치 정보를 가져오는데 실패했습니다. (${matchResponse.status})`)
    }

    const matchData = await matchResponse.json()

    // 2. ROFL 파일 생성 (더미 데이터)
    // 실제로는 Riot API에서 ROFL 파일을 직접 제공하지 않으므로
    // 매치 데이터를 기반으로 더미 ROFL 파일을 생성합니다.
    const roflData = generateDummyRoflFile(matchData, matchId)

    // 3. ROFL 파일을 Blob으로 변환하여 반환
    const blob = new Blob([roflData], { type: 'application/octet-stream' })

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${matchId}.rofl"`,
      },
    })

  } catch (error) {
    console.error('ROFL 다운로드 오류:', error)
    return NextResponse.json(
      { error: 'ROFL 파일 다운로드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 더미 ROFL 파일 생성 함수
function generateDummyRoflFile(matchData: any, matchId: string): string {
  // ROFL 파일은 바이너리 형식이므로 간단한 텍스트 기반 더미 파일을 생성
  const roflContent = {
    matchId: matchId,
    gameCreation: matchData.info.gameCreation,
    gameDuration: matchData.info.gameDuration,
    gameMode: matchData.info.gameMode,
    participants: matchData.info.participants.map((p: any) => ({
      summonerName: p.summonerName,
      championName: p.championName,
      teamId: p.teamId,
      kills: p.kills,
      deaths: p.deaths,
      assists: p.assists
    })),
    // ROFL 파일 시그니처 추가
    signature: 'ROFL',
    version: '1.0',
    timestamp: Date.now()
  }

  // JSON을 문자열로 변환하고 ROFL 파일 형식으로 인코딩
  return JSON.stringify(roflContent, null, 2)
}
