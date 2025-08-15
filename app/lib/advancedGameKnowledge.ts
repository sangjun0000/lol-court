export interface ChampionData {
  name: string
  role: string
  powerSpikes: number[] // 레벨별 파워스파이크
  keyAbilities: string[]
  counters: string[]
  synergies: string[]
  itemPriorities: string[]
  skillOrder: string[]
}

export interface GameState {
  // 시간 정보
  gameTime: number // 게임 시작 후 경과 시간(초)
  
  // 라인별 정보
  lanes: {
    top: LaneState
    mid: LaneState
    bot: LaneState
    jungle: JungleState
  }
  
  // 오브젝티브 정보
  objectives: {
    dragon: ObjectiveState
    baron: ObjectiveState
    towers: TowerState[]
  }
  
  // 팀 정보
  teams: {
    blue: TeamState
    red: TeamState
  }
}

export interface LaneState {
  champion: string
  level: number
  cs: number
  gold: number
  items: string[]
  spells: {
    flash: boolean
    teleport: boolean
    heal: boolean
    ignite: boolean
    cleanse: boolean
    ghost: boolean
  }
  health: number // 0-100
  mana: number // 0-100
  position: 'pushed' | 'frozen' | 'under_tower'
  vision: {
    hasWard: boolean
    wardLocation?: string
    enemyWardLocation?: string
  }
  skillCooldowns: {
    [skill: string]: number // 남은 쿨타임(초)
  }
}

export interface JungleState {
  champion: string
  level: number
  cs: number
  gold: number
  items: string[]
  spells: {
    flash: boolean
    smite: boolean
    ghost: boolean
  }
  health: number
  mana: number
  position: string // 정글 위치
  camps: {
    [campName: string]: boolean // 클리어 여부
  }
  gankAttempts: number
  successfulGanks: number
}

export interface ObjectiveState {
  alive: boolean
  spawnTime: number
  health: number
  contested: boolean
  teamControl: 'blue' | 'red' | 'neutral'
}

export interface TowerState {
  lane: string
  tier: 1 | 2 | 3
  health: number
  destroyed: boolean
}

export interface TeamState {
  totalGold: number
  totalKills: number
  totalDeaths: number
  totalAssists: number
  dragonKills: number
  baronKills: number
  towerKills: number
  visionScore: number
}

export class AdvancedGameKnowledge {
  private champions: ChampionData[] = [
    {
      name: '리 신',
      role: 'jungle',
      powerSpikes: [3, 6, 11],
      keyAbilities: ['Q', 'W', 'E'],
      counters: ['람머스', '누누'],
      synergies: ['야스오', '말파이트'],
      itemPriorities: ['Warrior', 'Black Cleaver', 'Guardian Angel'],
      skillOrder: ['Q', 'W', 'E', 'Q', 'Q', 'R']
    },
    {
      name: '다리우스',
      role: 'top',
      powerSpikes: [1, 6, 11],
      keyAbilities: ['Q', 'E', 'R'],
      counters: ['케넨', '퀸'],
      synergies: ['리 신', '카직스'],
      itemPriorities: ['Trinity Force', 'Dead Man\'s Plate', 'Spirit Visage'],
      skillOrder: ['Q', 'W', 'E', 'Q', 'Q', 'R']
    },
    {
      name: '이즈리얼',
      role: 'adc',
      powerSpikes: [2, 6, 11],
      keyAbilities: ['Q', 'E', 'R'],
      counters: ['드레이븐', '루시안'],
      synergies: ['쓰레쉬', '레오나'],
      itemPriorities: ['Manamune', 'Trinity Force', 'Serylda\'s Grudge'],
      skillOrder: ['Q', 'W', 'E', 'Q', 'Q', 'R']
    },
    {
      name: '트런들',
      role: 'top',
      powerSpikes: [1, 6, 9],
      keyAbilities: ['Q', 'W', 'R'],
      counters: ['다리우스', '가렌'],
      synergies: ['리 신', '카직스'],
      itemPriorities: ['Divine Sunderer', 'Spirit Visage', 'Thornmail'],
      skillOrder: ['Q', 'W', 'E', 'Q', 'Q', 'R']
    }
  ]

  // 게임 상황 분석 메서드들
  analyzeGankSituation(
    jungler: string,
    laner: string,
    gameState: GameState,
    gankResult: 'success' | 'failure' | 'escape'
  ): {
    junglerFault: number // 0-1
    lanerFault: number // 0-1
    reasoning: string
    factors: string[]
  } {
    const junglerData = this.getChampionData(jungler)
    const lanerData = this.getChampionData(laner)
    
    let junglerFault = 0.5
    let lanerFault = 0.5
    const factors: string[] = []
    let reasoning = ''

    // 1. 타이밍 분석
    const gameTime = gameState.gameTime
    const junglerLevel = gameState.lanes.jungle.level
    
    // 정글러 레벨이 낮은 상태에서 갱킹 시도
    if (junglerLevel < 3 && gameTime < 180) {
      junglerFault += 0.2
      factors.push('정글러 레벨이 낮은 상태에서 갱킹 시도')
    }

    // 2. 라인 상태 분석
    const laneState = this.getLaneState(laner, gameState)
    if (laneState.position === 'pushed') {
      junglerFault += 0.15
      factors.push('푸시된 라인에서 갱킹 시도')
    }

    // 3. 스펠 상태 분석
    if (!laneState.spells.flash) {
      lanerFault += 0.1
      factors.push('플래시 없이 갱킹 대응')
    }

    // 4. 체력 상태 분석
    if (laneState.health < 30) {
      lanerFault += 0.2
      factors.push('낮은 체력으로 갱킹 대응')
    }

    // 5. 시야 상태 분석
    if (!laneState.vision.hasWard) {
      lanerFault += 0.15
      factors.push('와드 없이 갱킹 당함')
    }

    // 6. 챔피언 특성 분석
    if (this.isCounterMatchup(jungler, laner)) {
      junglerFault -= 0.1
      factors.push('정글러가 라이너를 카운터하는 상황')
    }

    // 정규화 (0-1 범위로)
    junglerFault = Math.max(0, Math.min(1, junglerFault))
    lanerFault = Math.max(0, Math.min(1, lanerFault))

    // 총합이 1이 되도록 조정
    const total = junglerFault + lanerFault
    junglerFault /= total
    lanerFault /= total

    reasoning = this.generateReasoning(junglerFault, lanerFault, factors)

    return {
      junglerFault,
      lanerFault,
      reasoning,
      factors
    }
  }

  analyzeCSContest(
    jungler: string,
    laner: string,
    gameState: GameState,
    csStolen: number
  ): {
    junglerFault: number
    lanerFault: number
    reasoning: string
    factors: string[]
  } {
    let junglerFault = 0.5
    let lanerFault = 0.5
    const factors: string[] = []

    // 1. CS 뺏기 정도
    if (csStolen > 10) {
      junglerFault += 0.3
      factors.push('과도한 CS 뺏기')
    } else if (csStolen > 5) {
      junglerFault += 0.2
      factors.push('중간 정도의 CS 뺏기')
    }

    // 2. 게임 페이즈 분석
    const gameTime = gameState.gameTime
    if (gameTime < 300) { // 5분 이전
      junglerFault += 0.2
      factors.push('초반 CS 뺏기는 라이너 성장 저해')
    }

    // 3. 라이너 상황 분석
    const laneState = this.getLaneState(laner, gameState)
    if (laneState.cs < 30) {
      junglerFault += 0.15
      factors.push('CS가 부족한 라이너의 CS 뺏기')
    }

    // 4. 정글러 상황 분석
    const jungleState = gameState.lanes.jungle
    if (jungleState.cs > 50) {
      junglerFault += 0.1
      factors.push('충분한 CS를 가진 정글러의 추가 CS 뺏기')
    }

    // 정규화
    const total = junglerFault + lanerFault
    junglerFault /= total
    lanerFault /= total

    const reasoning = this.generateReasoning(junglerFault, lanerFault, factors)

    return {
      junglerFault,
      lanerFault,
      reasoning,
      factors
    }
  }

  private getChampionData(name: string): ChampionData | undefined {
    return this.champions.find(champ => champ.name === name)
  }

  private getLaneState(champion: string, gameState: GameState): LaneState {
    // 실제 구현에서는 챔피언 이름으로 라인을 찾아야 함
    return gameState.lanes.top // 임시 반환
  }

  private isCounterMatchup(jungler: string, laner: string): boolean {
    const junglerData = this.getChampionData(jungler)
    return junglerData?.counters.includes(laner) || false
  }

  private generateReasoning(junglerFault: number, lanerFault: number, factors: string[]): string {
    if (junglerFault > lanerFault) {
      return `정글러의 잘못이 더 크다. ${factors.join(', ')}`
    } else if (lanerFault > junglerFault) {
      return `라이너의 잘못이 더 크다. ${factors.join(', ')}`
    } else {
      return `양쪽 모두 비슷한 책임이 있다. ${factors.join(', ')}`
    }
  }
}
