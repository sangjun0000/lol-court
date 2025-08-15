export interface GameAction {
  action: string // 행동 (예: '갱킹 호응', 'CS 집중', '오브젝트 참여')
  situation: string // 상황
  expectedReward: number // 예상 보상값
  risk: number // 위험도 (0-1)
  timeCost: number // 시간 비용
  teamBenefit: number // 팀 이익 (0-1)
  personalBenefit: number // 개인 이익 (0-1)
}

export interface GameState {
  gameTime: number
  playerLevel: number
  teamGold: number
  enemyGold: number
  objectives: string[]
  teamFights: number
  vision: number // 시야 점수
  pressure: number // 압박도
}

export interface ActionResult {
  action: string
  actualReward: number
  success: boolean
  consequences: string[]
  learning: string
}

export class LoLReinforcementLearning {
  private actionRewards: Map<string, number> = new Map()
  private stateActionValues: Map<string, Map<string, number>> = new Map()
  private learningRate = 0.1
  private discountFactor = 0.9

  constructor() {
    this.initializeActionRewards()
  }

  // 1. 각 행동에 기본 보상값 설정
  private initializeActionRewards(): void {
    // 갱킹 관련 행동
    this.actionRewards.set('gank_response_kill', 100) // 갱킹 호응해서 킬
    this.actionRewards.set('gank_response_assist', 50) // 갱킹 호응해서 어시스트
    this.actionRewards.set('gank_response_fail', -20) // 갱킹 호응 실패
    this.actionRewards.set('gank_ignore_safe', 30) // 갱킹 무시하고 안전하게 CS
    this.actionRewards.set('gank_ignore_risky', -50) // 갱킹 무시했는데 위험

    // CS 관련 행동
    this.actionRewards.set('cs_focus_safe', 40) // 안전하게 CS 집중
    this.actionRewards.set('cs_focus_risky', -30) // 위험하게 CS 집중
    this.actionRewards.set('cs_share_teammate', 60) // 팀원에게 CS 양보
    this.actionRewards.set('cs_steal_teammate', -40) // 팀원 CS 뺏기

    // 오브젝트 관련 행동
    this.actionRewards.set('objective_join_win', 80) // 오브젝트 참여해서 승리
    this.actionRewards.set('objective_join_loss', -40) // 오브젝트 참여해서 패배
    this.actionRewards.set('objective_ignore_team_loss', -60) // 오브젝트 무시해서 팀 패배
    this.actionRewards.set('objective_ignore_team_win', 20) // 오브젝트 무시했는데 팀 승리

    // 팀파이트 관련 행동
    this.actionRewards.set('teamfight_engage_win', 90) // 팀파이트 참여해서 승리
    this.actionRewards.set('teamfight_engage_loss', -50) // 팀파이트 참여해서 패배
    this.actionRewards.set('teamfight_avoid_safe', 30) // 팀파이트 회피하고 안전
    this.actionRewards.set('teamfight_avoid_team_loss', -70) // 팀파이트 회피해서 팀 패배
  }

  // 2. 상황별 최적 행동 계산
  calculateOptimalAction(situation: string, gameState: GameState): {
    action: string
    expectedReward: number
    reasoning: string
    alternatives: GameAction[]
  } {
    const possibleActions = this.getPossibleActions(situation, gameState)
    const evaluatedActions = possibleActions.map(action => ({
      ...action,
      finalReward: this.calculateFinalReward(action, gameState)
    }))

    // 최고 보상값을 가진 행동 선택
    const optimalAction = evaluatedActions.reduce((best, current) => 
      current.finalReward > best.finalReward ? current : best
    )

    return {
      action: optimalAction.action,
      expectedReward: optimalAction.finalReward,
      reasoning: this.generateReasoning(optimalAction, gameState),
      alternatives: evaluatedActions
    }
  }

  // 3. 최종 보상값 계산 (상황별 가중치 적용)
  private calculateFinalReward(action: GameAction, gameState: GameState): number {
    let baseReward = this.actionRewards.get(action.action) || 0

    // 게임 시간에 따른 가중치
    const timeWeight = this.getTimeWeight(gameState.gameTime)
    
    // 팀 상황에 따른 가중치
    const teamWeight = this.getTeamWeight(gameState)
    
    // 위험도에 따른 보정
    const riskAdjustment = action.risk * -50
    
    // 팀 이익 vs 개인 이익 균형
    const teamPersonalBalance = (action.teamBenefit * 0.7) + (action.personalBenefit * 0.3)

    return baseReward * timeWeight * teamWeight + riskAdjustment + (teamPersonalBalance * 100)
  }

  // 4. 게임 시간에 따른 가중치
  private getTimeWeight(gameTime: number): number {
    if (gameTime < 300) return 0.8 // 초반 (5분 전)
    if (gameTime < 900) return 1.0 // 중반 (15분 전)
    if (gameTime < 1800) return 1.2 // 후반 (30분 전)
    return 1.5 // 극후반
  }

  // 5. 팀 상황에 따른 가중치
  private getTeamWeight(gameState: GameState): number {
    const goldDifference = gameState.teamGold - gameState.enemyGold
    const goldRatio = goldDifference / Math.max(gameState.teamGold, gameState.enemyGold, 1)
    
    if (goldRatio > 0.2) return 1.3 // 팀이 크게 앞섬
    if (goldRatio > 0) return 1.1 // 팀이 조금 앞섬
    if (goldRatio > -0.2) return 1.0 // 비등비등
    return 0.8 // 팀이 뒤짐
  }

  // 6. 가능한 행동들 생성
  private getPossibleActions(situation: string, gameState: GameState): GameAction[] {
    const actions: GameAction[] = []

    // 갱킹 상황
    if (situation.includes('갱킹') || situation.includes('gank')) {
      actions.push(
        {
          action: 'gank_response_kill',
          situation,
          expectedReward: 100,
          risk: 0.3,
          timeCost: 30,
          teamBenefit: 0.8,
          personalBenefit: 0.9
        },
        {
          action: 'gank_response_assist',
          situation,
          expectedReward: 50,
          risk: 0.2,
          timeCost: 20,
          teamBenefit: 0.7,
          personalBenefit: 0.6
        },
        {
          action: 'gank_ignore_safe',
          situation,
          expectedReward: 30,
          risk: 0.1,
          timeCost: 0,
          teamBenefit: 0.3,
          personalBenefit: 0.8
        }
      )
    }

    // CS 경합 상황
    if (situation.includes('CS') || situation.includes('미니언')) {
      actions.push(
        {
          action: 'cs_focus_safe',
          situation,
          expectedReward: 40,
          risk: 0.1,
          timeCost: 0,
          teamBenefit: 0.4,
          personalBenefit: 0.9
        },
        {
          action: 'cs_share_teammate',
          situation,
          expectedReward: 60,
          risk: 0.0,
          timeCost: 0,
          teamBenefit: 0.9,
          personalBenefit: 0.2
        }
      )
    }

    // 오브젝트 상황
    if (situation.includes('드래곤') || situation.includes('바론') || situation.includes('오브젝트')) {
      actions.push(
        {
          action: 'objective_join_win',
          situation,
          expectedReward: 80,
          risk: 0.4,
          timeCost: 60,
          teamBenefit: 0.9,
          personalBenefit: 0.6
        },
        {
          action: 'objective_ignore_team_win',
          situation,
          expectedReward: 20,
          risk: 0.1,
          timeCost: 0,
          teamBenefit: 0.2,
          personalBenefit: 0.8
        }
      )
    }

    return actions
  }

  // 7. 판결 근거 생성
  private generateReasoning(optimalAction: GameAction & { finalReward: number }, gameState: GameState): string {
    const reasons: string[] = []

    if (optimalAction.teamBenefit > 0.7) {
      reasons.push('팀 전체의 이익을 크게 도움')
    }
    if (optimalAction.risk < 0.2) {
      reasons.push('위험도가 낮아 안전함')
    }
    if (optimalAction.finalReward > 50) {
      reasons.push('예상 보상값이 높음')
    }
    if (gameState.gameTime > 1800 && optimalAction.teamBenefit > optimalAction.personalBenefit) {
      reasons.push('후반에는 팀플레이가 중요')
    }

    return reasons.join(', ')
  }

  // 8. 행동 결과 학습 (실제 결과로 보상값 업데이트)
  learnFromResult(
    action: string,
    situation: string,
    actualResult: ActionResult
  ): void {
    const currentReward = this.actionRewards.get(action) || 0
    const newReward = currentReward + this.learningRate * (actualResult.actualReward - currentReward)
    
    this.actionRewards.set(action, newReward)
    
    // 상황별 행동 가치 업데이트
    const stateKey = this.getStateKey(situation)
    if (!this.stateActionValues.has(stateKey)) {
      this.stateActionValues.set(stateKey, new Map())
    }
    
    const stateActions = this.stateActionValues.get(stateKey)!
    const currentValue = stateActions.get(action) || 0
    const newValue = currentValue + this.learningRate * (actualResult.actualReward - currentValue)
    stateActions.set(action, newValue)
  }

  // 9. 상황 키 생성
  private getStateKey(situation: string): string {
    // 상황을 간단한 키로 변환
    if (situation.includes('갱킹')) return 'gank_situation'
    if (situation.includes('CS')) return 'cs_situation'
    if (situation.includes('오브젝트')) return 'objective_situation'
    if (situation.includes('팀파이트')) return 'teamfight_situation'
    return 'general_situation'
  }

  // 10. AI 판사용 판결 생성
  generateAIVerdict(
    situation: string,
    playerAction: string,
    gameState: GameState
  ): {
    verdict: string
    reasoning: string
    optimalAction: string
    expectedReward: number
    playerReward: number
    fault: number // 0-1, 1이 가장 큰 잘못
  } {
    const optimal = this.calculateOptimalAction(situation, gameState)
    const playerReward = this.actionRewards.get(playerAction) || 0
    const fault = Math.max(0, (optimal.expectedReward - playerReward) / optimal.expectedReward)

    return {
      verdict: this.generateVerdictText(fault, optimal.action, playerAction),
      reasoning: optimal.reasoning,
      optimalAction: optimal.action,
      expectedReward: optimal.expectedReward,
      playerReward: playerReward,
      fault: fault
    }
  }

  // 11. 판결 텍스트 생성
  private generateVerdictText(fault: number, optimalAction: string, playerAction: string): string {
    if (fault < 0.2) {
      return `올바른 판단입니다. ${optimalAction}이 최적의 선택이었습니다.`
    } else if (fault < 0.5) {
      return `개선의 여지가 있습니다. ${optimalAction}이 더 나은 선택이었을 것입니다.`
    } else {
      return `잘못된 판단입니다. ${optimalAction}을 선택했어야 했습니다.`
    }
  }

  // 12. 학습 데이터 내보내기
  exportLearningData(): any {
    return {
      actionRewards: Object.fromEntries(this.actionRewards),
      stateActionValues: Object.fromEntries(
        Array.from(this.stateActionValues.entries()).map(([state, actions]) => [
          state,
          Object.fromEntries(actions)
        ])
      ),
      learningRate: this.learningRate,
      discountFactor: this.discountFactor
    }
  }

  // 13. 학습 데이터 불러오기
  importLearningData(data: any): void {
    this.actionRewards = new Map(Object.entries(data.actionRewards))
    this.stateActionValues = new Map(
      Object.entries(data.stateActionValues).map(([state, actions]) => [
        state,
        new Map(Object.entries(actions as any))
      ])
    )
    this.learningRate = data.learningRate
    this.discountFactor = data.discountFactor
  }
}
