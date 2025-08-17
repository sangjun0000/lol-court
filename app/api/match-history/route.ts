import { NextRequest, NextResponse } from 'next/server'
import { MatchData } from '@/app/components/MatchHistorySearch'

// 롤 API 키 (환경변수에서 가져옴)
const RIOT_API_KEY = process.env.RIOT_API_KEY || 'RGAPI-7a9b7937-4452-45c0-a7ee-83249b5a1171'

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

    // 새로운 방식: ACCOUNT-V1 사용 (by-name 대신)
    // 1. 먼저 account 정보로 puuid 얻기 (여러 태그라인 시도)
    const possibleTags = ['KR1', 'KR2', 'KR3', 'KR4', 'KR5', 'KR6', 'KR7', 'KR8', 'KR9', 'KR0']
    let puuid = null
    let accountData = null

    for (const tag of possibleTags) {
      try {
        const accountUrl = `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(summonerName)}/${tag}`
        console.log(`Account API 호출 시도 (${tag}):`, accountUrl)
        
        const accountResponse = await fetch(accountUrl, {
          headers: {
            'X-Riot-Token': RIOT_API_KEY,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Charset': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': 'https://developer.riotgames.com',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })

        console.log(`Account API 응답 (${tag}):`, { status: accountResponse.status, ok: accountResponse.ok })

        if (accountResponse.ok) {
          accountData = await accountResponse.json()
          puuid = accountData.puuid
          console.log(`성공! PUUID 획득 (${tag}):`, puuid)
          break
        } else if (accountResponse.status === 404) {
          console.log(`태그 ${tag}에서 소환사를 찾을 수 없음`)
          continue
        } else if (accountResponse.status === 403) {
          return NextResponse.json(
            { error: 'API 키가 유효하지 않습니다. 관리자에게 문의해주세요.' },
            { status: 403 }
          )
        } else if (accountResponse.status === 429) {
          return NextResponse.json(
            { error: 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' },
            { status: 429 }
          )
        }
      } catch (error) {
        console.log(`태그 ${tag} 시도 중 오류:`, error)
        continue
      }
    }

    if (!puuid) {
      return NextResponse.json(
        { error: '소환사를 찾을 수 없습니다. 소환사명과 태그를 다시 확인해주세요.' },
        { status: 404 }
      )
    }

    // 2. puuid로 summoner 정보 가져오기
    const summonerUrl = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`
    console.log('Summoner API 호출:', summonerUrl)
    
    const summonerResponse = await fetch(summonerUrl, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Charset': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://developer.riotgames.com',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    console.log('Summoner API 응답:', { status: summonerResponse.status, ok: summonerResponse.ok })

    if (!summonerResponse.ok) {
      throw new Error(`소환사 정보를 가져오는데 실패했습니다. (${summonerResponse.status})`)
    }

    const summoner = await summonerResponse.json()

    // 3. 최근 게임 기록 가져오기 (MATCH-V5)
    const matchHistoryResponse = await fetch(
      `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Charset': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Origin': 'https://developer.riotgames.com',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
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

    // 4. 각 게임의 상세 정보 가져오기
    const matches: MatchData[] = []

    for (const matchId of matchIds) {
      try {
        const matchResponse = await fetch(
          `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}`,
          {
            headers: {
              'X-Riot-Token': RIOT_API_KEY,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
              'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
              'Accept-Charset': 'application/x-www-form-urlencoded; charset=UTF-8',
              'Origin': 'https://developer.riotgames.com',
              'Content-Type': 'application/json',
              'Accept': 'application/json'
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
          (p: any) => p.puuid === puuid
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
