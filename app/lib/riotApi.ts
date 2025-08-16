// Riot Games API 클라이언트
export class RiotApiClient {
  private apiKey: string
  private baseUrl = {
    kr: 'https://kr.api.riotgames.com',
    asia: 'https://asia.api.riotgames.com'
  }

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.RIOT_API_KEY || 'RGAPI-4684dd3e-30fb-443e-943f-57b8f3d17572'
  }

  // 소환사 정보 조회
  async getSummonerByName(summonerName: string) {
    const url = `${this.baseUrl.kr}/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`
    return this.makeRequest(url)
  }

  // 매치 히스토리 조회
  async getMatchHistory(puuid: string, count: number = 20) {
    const url = `${this.baseUrl.asia}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`
    return this.makeRequest(url)
  }

  // 매치 상세 정보 조회
  async getMatchDetails(matchId: string) {
    const url = `${this.baseUrl.asia}/lol/match/v5/matches/${matchId}`
    return this.makeRequest(url)
  }

  // 매치 타임라인 조회
  async getMatchTimeline(matchId: string) {
    const url = `${this.baseUrl.asia}/lol/match/v5/matches/${matchId}/timeline`
    return this.makeRequest(url)
  }

  // 챔피언 정보 조회
  async getChampionMastery(summonerId: string) {
    const url = `${this.baseUrl.kr}/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}`
    return this.makeRequest(url)
  }

  // 리그 정보 조회
  async getLeagueInfo(summonerId: string) {
    const url = `${this.baseUrl.kr}/lol/league/v4/entries/by-summoner/${summonerId}`
    return this.makeRequest(url)
  }

  // 실시간 게임 정보 조회
  async getActiveGame(summonerId: string) {
    const url = `${this.baseUrl.kr}/lol/spectator/v4/active-games/by-summoner/${summonerId}`
    return this.makeRequest(url)
  }

  // ROFL 파일에서 게임 ID 추출 (더미 데이터)
  async analyzeRoflFile(roflFile: File) {
    // 실제로는 ROFL 파일을 파싱해서 게임 ID를 추출해야 함
    // 현재는 더미 데이터로 시뮬레이션
    const dummyGameId = 'KR_' + Math.random().toString(36).substr(2, 9)
    
    return {
      gameId: dummyGameId,
      timestamp: Date.now(),
      duration: 1200, // 20분
      participants: [
        { summonerName: 'Player1', champion: '이즈리얼', teamId: 100 },
        { summonerName: 'Player2', champion: '세라핀', teamId: 200 }
      ]
    }
  }

  // 특정 시간대 게임 이벤트 분석
  async analyzeGameEvents(matchId: string, startTime: number, endTime: number) {
    try {
      const timeline = await this.getMatchTimeline(matchId)
      
      // 타임라인에서 특정 시간대 이벤트 필터링
      const events = timeline.info.frames
        .flatMap(frame => frame.events)
        .filter(event => {
          const eventTime = event.timestamp / 1000 // 초 단위로 변환
          return eventTime >= startTime && eventTime <= endTime
        })

      return {
        matchId,
        startTime,
        endTime,
        events,
        analysis: this.analyzeEvents(events)
      }
    } catch (error) {
      console.error('게임 이벤트 분석 실패:', error)
      throw error
    }
  }

  // 이벤트 분석
  private analyzeEvents(events: any[]) {
    const analysis = {
      kills: events.filter(e => e.type === 'CHAMPION_KILL'),
      skillUses: events.filter(e => e.type === 'SKILL_LEVEL_UP'),
      itemPurchases: events.filter(e => e.type === 'ITEM_PURCHASED'),
      objectives: events.filter(e => e.type === 'ELITE_MONSTER_KILL'),
      positions: events.filter(e => e.type === 'POSITION')
    }

    return {
      totalEvents: events.length,
      killCount: analysis.kills.length,
      skillUses: analysis.skillUses.length,
      itemPurchases: analysis.itemPurchases.length,
      objectives: analysis.objectives.length,
      playerActions: this.categorizePlayerActions(events)
    }
  }

  // 플레이어 액션 분류
  private categorizePlayerActions(events: any[]) {
    const actions = {
      aggressive: 0,
      defensive: 0,
      supportive: 0,
      objective: 0
    }

    events.forEach(event => {
      switch (event.type) {
        case 'CHAMPION_KILL':
          actions.aggressive++
          break
        case 'ITEM_PURCHASED':
          if (event.itemId >= 3000) actions.defensive++
          else actions.supportive++
          break
        case 'ELITE_MONSTER_KILL':
          actions.objective++
          break
      }
    })

    return actions
  }

  // API 요청 공통 함수
  private async makeRequest(url: string) {
    try {
      const response = await fetch(url, {
        headers: {
          'X-Riot-Token': this.apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Riot API 요청 오류:', error)
      throw error
    }
  }
}

// 싱글톤 인스턴스 (환경변수 사용)
export const riotApi = new RiotApiClient()
