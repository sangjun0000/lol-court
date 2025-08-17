import { NextRequest, NextResponse } from 'next/server'
import { MatchData } from '@/app/components/MatchHistorySearch'

// 롤 API 키 (환경변수에서 가져옴)
const RIOT_API_KEY = process.env.RIOT_API_KEY || 'RGAPI-1e6d8794-f7cd-4bd2-b8fd-d798ccd9b7f0'

export async function POST(request: NextRequest) {
  try {
    const { summonerName, region } = await request.json()
    
    console.log('전적검색 요청:', { summonerName, region, apiKey: RIOT_API_KEY ? '설정됨' : '설정안됨' })

    if (!summonerName) {
      return NextResponse.json(
        { error: '소환사명이 필요합니다.' },
        { status: 400 }
      )
    }

    if (!RIOT_API_KEY) {
      return NextResponse.json(
        { error: 'Riot API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    // 지역별 엔드포인트 매핑 (Riot API v4/v5 규칙에 맞게 수정)
    const getRegionEndpoint = (region: string) => {
      const regionMap: { [key: string]: string } = {
        'kr': 'kr',
        'na1': 'na1',
        'euw1': 'euw1',
        'eun1': 'eun1',
        'jp1': 'jp1',
        'br1': 'br1',
        'la1': 'la1',
        'la2': 'la2',
        'oc1': 'oc1',
        'tr1': 'tr1',
        'ru': 'ru',
        'ph2': 'ph2',
        'sg2': 'sg2',
        'th2': 'th2',
        'tw2': 'tw2',
        'vn2': 'vn2'
      }
      return regionMap[region] || 'kr'
    }

    // 매치 API 엔드포인트 매핑 (v5 API는 지역별로 다름)
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

    const regionEndpoint = getRegionEndpoint(region)
    const matchEndpoint = getMatchEndpoint(region)

    console.log('API 엔드포인트:', { regionEndpoint, matchEndpoint })

    // 1. 소환사 정보 가져오기
    const summonerUrl = `https://${regionEndpoint}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`
    console.log('소환사 API 호출:', summonerUrl)
    
    const summonerResponse = await fetch(summonerUrl, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    })

    console.log('소환사 API 응답:', { status: summonerResponse.status, ok: summonerResponse.ok })

    if (!summonerResponse.ok) {
      if (summonerResponse.status === 404) {
        return NextResponse.json(
          { error: '소환사를 찾을 수 없습니다. 소환사명을 다시 확인해주세요.' },
          { status: 404 }
        )
      }
      if (summonerResponse.status === 403) {
        return NextResponse.json(
          { error: 'API 키가 유효하지 않습니다. 관리자에게 문의해주세요.' },
          { status: 403 }
        )
      }
      if (summonerResponse.status === 429) {
        return NextResponse.json(
          { error: 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' },
          { status: 429 }
        )
      }
      throw new Error(`소환사 정보를 가져오는데 실패했습니다. (${summonerResponse.status})`)
    }

    const summoner = await summonerResponse.json()

    // 2. 최근 게임 기록 가져오기
    const matchHistoryResponse = await fetch(
      `https://${matchEndpoint}.api.riotgames.com/lol/match/v5/matches/by-puuid/${summoner.puuid}/ids?start=0&count=10`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY
        }
      }
    )

    if (!matchHistoryResponse.ok) {
      if (matchHistoryResponse.status === 404) {
        return NextResponse.json(
          { error: '게임 기록을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }
      if (matchHistoryResponse.status === 403) {
        return NextResponse.json(
          { error: 'API 키가 유효하지 않습니다. 관리자에게 문의해주세요.' },
          { status: 403 }
        )
      }
      if (matchHistoryResponse.status === 429) {
        return NextResponse.json(
          { error: 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' },
          { status: 429 }
        )
      }
      throw new Error(`게임 기록을 가져오는데 실패했습니다. (${matchHistoryResponse.status})`)
    }

    const matchIds = await matchHistoryResponse.json()

    // 3. 각 게임의 상세 정보 가져오기
    const matches: MatchData[] = []

    for (const matchId of matchIds) {
      try {
        const matchResponse = await fetch(
          `https://${matchEndpoint}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
          {
            headers: {
              'X-Riot-Token': RIOT_API_KEY
            }
          }
        )

        if (!matchResponse.ok) {
          console.error(`게임 ${matchId} 정보를 가져오는데 실패했습니다.`)
          continue
        }

        const matchData = await matchResponse.json()

        // 현재 플레이어의 정보 찾기
        const playerParticipant = matchData.info.participants.find(
          (p: any) => p.puuid === summoner.puuid
        )

        if (!playerParticipant) {
          continue
        }

        // 주요 이벤트 분석 (킬, 데스, 어시스트, 오브젝트 등)
        const highlights = analyzeMatchHighlights(matchData, playerParticipant)

        const match: MatchData = {
          matchId: matchId,
          gameMode: matchData.info.gameMode,
          gameDuration: matchData.info.gameDuration,
          gameDate: new Date(matchData.info.gameCreation).toISOString(),
          champion: playerParticipant.championName,
          kills: playerParticipant.kills,
          deaths: playerParticipant.deaths,
          assists: playerParticipant.assists,
          win: playerParticipant.win,
          highlights: highlights
        }

        matches.push(match)

        // API 호출 제한을 위한 딜레이
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`게임 ${matchId} 처리 중 오류:`, error)
        continue
      }
    }

    return NextResponse.json({ matches })

  } catch (error) {
    console.error('전적 검색 오류:', error)
    return NextResponse.json(
      { error: '전적을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 게임 하이라이트 분석
function analyzeMatchHighlights(matchData: any, player: any): { startTime: number, endTime: number, description: string }[] {
  const highlights: { startTime: number, endTime: number, description: string }[] = []
  const gameDuration = matchData.info.gameDuration

  // 주요 이벤트들 분석
  const events = matchData.info.events || []
  
  // 킬 관련 이벤트
  const killEvents = events.filter((event: any) => 
    event.type === 'CHAMPION_KILL' && 
    (event.killerId === player.participantId || 
     event.assistingParticipantIds?.includes(player.participantId))
  )

  // 오브젝트 관련 이벤트
  const objectiveEvents = events.filter((event: any) => 
    event.type === 'ELITE_MONSTER_KILL' || event.type === 'BUILDING_KILL'
  )

  // 팀파이트 구간 찾기 (연속된 킬 이벤트)
  let teamfightStart = -1
  let teamfightEnd = -1
  let consecutiveKills = 0

  for (let i = 0; i < events.length; i++) {
    const event = events[i]
    if (event.type === 'CHAMPION_KILL') {
      if (teamfightStart === -1) {
        teamfightStart = event.timestamp / 1000
      }
      consecutiveKills++
      teamfightEnd = event.timestamp / 1000
    } else if (teamfightStart !== -1 && consecutiveKills >= 3) {
      // 3킬 이상의 연속 킬을 팀파이트로 간주
      highlights.push({
        startTime: Math.max(0, teamfightStart - 30), // 30초 전부터
        endTime: Math.min(gameDuration, teamfightEnd + 30), // 30초 후까지
        description: `${consecutiveKills}킬 연속 팀파이트`
      })
      teamfightStart = -1
      consecutiveKills = 0
    } else if (teamfightStart !== -1 && event.timestamp / 1000 - teamfightEnd > 60) {
      // 1분 이상 간격이면 팀파이트 종료
      if (consecutiveKills >= 2) {
        highlights.push({
          startTime: Math.max(0, teamfightStart - 30),
          endTime: Math.min(gameDuration, teamfightEnd + 30),
          description: `${consecutiveKills}킬 연속 전투`
        })
      }
      teamfightStart = -1
      consecutiveKills = 0
    }
  }

  // 드래곤/바론 구간
  const dragonEvents = objectiveEvents.filter((event: any) => 
    event.monsterType === 'DRAGON' || event.monsterType === 'BARON_NASHOR'
  )

  dragonEvents.forEach((event: any) => {
    highlights.push({
      startTime: Math.max(0, (event.timestamp / 1000) - 60),
      endTime: Math.min(gameDuration, (event.timestamp / 1000) + 60),
      description: `${event.monsterType === 'DRAGON' ? '드래곤' : '바론'} 오브젝트`
    })
  })

  // 첫 킬 구간
  const firstKill = killEvents[0]
  if (firstKill) {
    highlights.push({
      startTime: Math.max(0, (firstKill.timestamp / 1000) - 30),
      endTime: Math.min(gameDuration, (firstKill.timestamp / 1000) + 30),
      description: '첫 킬 구간'
    })
  }

  // 게임 종료 구간 (마지막 3분)
  if (gameDuration > 180) {
    highlights.push({
      startTime: Math.max(0, gameDuration - 180),
      endTime: gameDuration,
      description: '게임 종료 구간'
    })
  }

  return highlights.slice(0, 5) // 최대 5개 하이라이트만 반환
}
