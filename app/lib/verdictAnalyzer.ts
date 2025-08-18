// 롤문철 분석을 위한 고급 판결 시스템

export class LolCourtAnalyzer {
  private gameData: any = null
  private caseDescription: string = ''

  analyzeCase(caseDescription: string, gameData?: any) {
    this.caseDescription = caseDescription
    this.gameData = gameData

    // 1단계: 상황 분석 및 관련 이벤트 찾기
    const situationAnalysis = this.analyzeSituation()
    
    // 2단계: 관련 플레이어들의 행동 분석
    const behaviorAnalysis = this.analyzeBehaviors(situationAnalysis)
    
    // 3단계: 각 행동에 수치 부여
    const scoredBehaviors = this.scoreBehaviors(behaviorAnalysis)
    
    // 4단계: 최종 판결 생성
    const verdict = this.generateVerdict(scoredBehaviors, situationAnalysis)

    return {
      verdict: verdict.finalVerdict,
      reasoning: verdict.reasoning,
      punishment: verdict.punishment,
      confidence: verdict.confidence,
      factors: verdict.factors,
      recommendations: verdict.recommendations,
      characterAnalysis: verdict.characterAnalysis,
      reinforcementLearning: verdict.reinforcementLearning,
      gameContext: situationAnalysis.context,
      responsibilityAnalysis: verdict.responsibilityAnalysis
    }
  }

  private analyzeSituation() {
    const description = this.caseDescription.toLowerCase()
    const analysis = {
      situationType: '',
      mentionedChampions: [] as string[],
      timeRange: { start: 0, end: 0 },
      relatedEvents: [] as any[],
      context: ''
    }

    // 언급된 챔피언 찾기
    if (this.gameData?.participants) {
      const champions = this.gameData.participants.map((p: any) => p.champion)
      analysis.mentionedChampions = champions.filter((champion: string) =>
        description.includes(champion.toLowerCase())
      )
    }

    // 상황 타입 분류
    if (description.includes('갱') || description.includes('정글')) {
      analysis.situationType = 'gank'
    } else if (description.includes('팀파이트') || description.includes('싸움')) {
      analysis.situationType = 'teamfight'
    } else if (description.includes('오브젝트') || description.includes('드래곤') || description.includes('바론')) {
      analysis.situationType = 'objective'
    } else if (description.includes('라인전') || description.includes('cs') || description.includes('킬')) {
      analysis.situationType = 'laning'
    } else if (description.includes('타워') || description.includes('건물')) {
      analysis.situationType = 'tower'
    } else {
      analysis.situationType = 'general'
    }

    // 관련 이벤트 찾기
    if (this.gameData?.events) {
      analysis.relatedEvents = this.findRelatedEvents(description, this.gameData.events)
    }

    // 시간 범위 추정
    if (analysis.relatedEvents.length > 0) {
      const times = analysis.relatedEvents.map(e => e.timestamp)
      analysis.timeRange = {
        start: Math.min(...times),
        end: Math.max(...times)
      }
    }

    analysis.context = `분석된 상황: ${analysis.situationType}, 관련 챔피언: ${analysis.mentionedChampions.join(', ')}, 이벤트 수: ${analysis.relatedEvents.length}`
    
    return analysis
  }

  private findRelatedEvents(description: string, events: any[]) {
    const relatedEvents = []
    
    for (const event of events) {
      let relevance = 0
      
      // 챔피언 킬 이벤트
      if (event.type === 'CHAMPION_KILL') {
        if (description.includes('킬') || description.includes('죽음') || description.includes('갱')) {
          relevance += 3
        }
        if (event.data.assists && event.data.assists.length > 0) {
          if (description.includes('갱') || description.includes('정글')) {
            relevance += 2
          }
        }
      }
      
      // 오브젝트 이벤트
      if (event.type === 'ELITE_MONSTER_KILL') {
        if (description.includes('드래곤') || description.includes('바론') || description.includes('오브젝트')) {
          relevance += 3
        }
      }
      
      // 건물 이벤트
      if (event.type === 'BUILDING_KILL') {
        if (description.includes('타워') || description.includes('건물')) {
          relevance += 3
        }
      }
      
      // 와드 이벤트
      if (event.type === 'WARD_PLACED' || event.type === 'WARD_KILL') {
        if (description.includes('와드') || description.includes('시야')) {
          relevance += 2
        }
      }
      
      if (relevance > 0) {
        relatedEvents.push({ ...event, relevance })
      }
    }
    
    // 관련도 순으로 정렬하고 상위 10개만 반환
    return relatedEvents
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10)
  }

  private analyzeBehaviors(situationAnalysis: any) {
    const behaviors = []
    const { mentionedChampions, relatedEvents, situationType } = situationAnalysis
    
    // 언급된 챔피언들의 행동 분석
    for (const champion of mentionedChampions) {
      const player = this.gameData.participants.find((p: any) => p.champion === champion)
      if (!player) continue
      
      const playerEvents = relatedEvents.filter((e: any) => e.participantId === player.id)
      const behavior = this.analyzePlayerBehavior(champion, player, playerEvents, situationType)
      behaviors.push(behavior)
    }
    
    // 언급되지 않은 챔피언들 중 관련된 행동 분석
    const otherPlayers = this.gameData.participants.filter((p: any) => 
      !mentionedChampions.includes(p.champion)
    )
    
    for (const player of otherPlayers) {
      const playerEvents = relatedEvents.filter((e: any) => e.participantId === player.id)
      if (playerEvents.length > 0) {
        const behavior = this.analyzePlayerBehavior(player.champion, player, playerEvents, situationType)
        behaviors.push(behavior)
      }
    }
    
    return behaviors
  }

  private analyzePlayerBehavior(champion: string, player: any, events: any[], situationType: string) {
    const behavior = {
      champion,
      playerId: player.id,
      team: player.team,
      actions: [] as any[],
      overallScore: 0,
      responsibility: 0
    }
    
    // 각 이벤트를 행동으로 분석
    for (const event of events) {
      const action = this.analyzeAction(event, situationType, player)
      behavior.actions.push(action)
    }
    
    // 전체 점수 계산
    if (behavior.actions.length > 0) {
      behavior.overallScore = behavior.actions.reduce((sum, action) => sum + action.score, 0) / behavior.actions.length
    }
    
    // 책임도 계산 (점수가 낮을수록 책임이 높음)
    behavior.responsibility = Math.max(0, 100 - behavior.overallScore)
    
    return behavior
  }

  private analyzeAction(event: any, situationType: string, player: any) {
    const action = {
      type: event.type,
      timestamp: event.timestamp,
      description: '',
      score: 50, // 기본 점수
      factors: [] as string[]
    }
    
    switch (event.type) {
      case 'CHAMPION_KILL':
        if (event.data.killerId === player.id) {
          action.description = '챔피언 처치'
          action.score = 80
          action.factors.push('적극적 참여', '팀 기여')
        } else if (event.data.victimId === player.id) {
          action.description = '챔피언 사망'
          action.score = 20
          action.factors.push('위치 선정 실패', '판단 오류')
        } else if (event.data.assists && event.data.assists.includes(player.id)) {
          action.description = '어시스트'
          action.score = 70
          action.factors.push('팀워크', '협력')
        }
        break
        
      case 'ELITE_MONSTER_KILL':
        action.description = '오브젝트 처치'
        action.score = 75
        action.factors.push('오브젝트 통제', '팀 이익')
        break
        
      case 'BUILDING_KILL':
        action.description = '건물 파괴'
        action.score = 70
        action.factors.push('진격', '목표 달성')
        break
        
      case 'WARD_PLACED':
        action.description = '와드 설치'
        action.score = 65
        action.factors.push('시야 확보', '정보 제공')
        break
        
      case 'WARD_KILL':
        action.description = '와드 제거'
        action.score = 60
        action.factors.push('적 시야 제거', '정보 차단')
        break
    }
    
    // 상황별 보정
    action.score = this.adjustScoreBySituation(action.score, situationType, event, player)
    
    return action
  }

  private adjustScoreBySituation(baseScore: number, situationType: string, event: any, player: any) {
    let adjustedScore = baseScore
    
    switch (situationType) {
      case 'gank':
        if (event.type === 'CHAMPION_KILL' && event.data.killerId === player.id) {
          adjustedScore += 10 // 갱킹 성공
        } else if (event.type === 'CHAMPION_KILL' && event.data.victimId === player.id) {
          adjustedScore -= 15 // 갱킹 당함
        }
        break
        
      case 'teamfight':
        if (event.type === 'CHAMPION_KILL') {
          if (event.data.killerId === player.id) {
            adjustedScore += 5 // 팀파이트에서 킬
          } else if (event.data.victimId === player.id) {
            adjustedScore -= 10 // 팀파이트에서 죽음
          }
        }
        break
        
      case 'objective':
        if (event.type === 'ELITE_MONSTER_KILL') {
          adjustedScore += 10 // 오브젝트 상황에서 오브젝트 처치
        }
        break
        
      case 'laning':
        if (event.type === 'CHAMPION_KILL') {
          if (event.data.killerId === player.id) {
            adjustedScore += 15 // 라인전에서 킬
          } else if (event.data.victimId === player.id) {
            adjustedScore -= 20 // 라인전에서 죽음
          }
        }
        break
    }
    
    return Math.max(0, Math.min(100, adjustedScore))
  }

  private scoreBehaviors(behaviors: any[]) {
    const scoredBehaviors = behaviors.map(behavior => {
      // 추가 점수 계산
      const additionalScore = this.calculateAdditionalScore(behavior)
      const finalScore = Math.max(0, Math.min(100, behavior.overallScore + additionalScore))
      
      return {
        ...behavior,
        finalScore,
        responsibility: Math.max(0, 100 - finalScore),
        grade: this.getGrade(finalScore)
      }
    })
    
    return scoredBehaviors.sort((a, b) => a.responsibility - b.responsibility) // 책임도 순으로 정렬
  }

  private calculateAdditionalScore(behavior: any) {
    let additionalScore = 0
    const player = this.gameData.participants.find((p: any) => p.id === behavior.playerId)
    
    if (!player) return additionalScore
    
    // KDA 기반 보정
    const kda = player.kills > 0 ? (player.kills + player.assists) / Math.max(player.deaths, 1) : 0
    if (kda > 3) additionalScore += 10
    else if (kda < 1) additionalScore -= 10
    
    // CS 기반 보정
    const csPerMinute = player.cs / (this.gameData.duration / 60)
    if (csPerMinute > 8) additionalScore += 5
    else if (csPerMinute < 5) additionalScore -= 5
    
    // 레벨 기반 보정
    if (player.level >= 18) additionalScore += 5
    else if (player.level < 15) additionalScore -= 5
    
    return additionalScore
  }

  private getGrade(score: number) {
    if (score >= 80) return 'A'
    if (score >= 60) return 'B'
    if (score >= 40) return 'C'
    if (score >= 20) return 'D'
    return 'F'
  }

  private generateVerdict(scoredBehaviors: any[], situationAnalysis: any) {
    const { mentionedChampions, situationType } = situationAnalysis
    
    // 주요 관련자들 필터링
    const mainPlayers = scoredBehaviors.filter(b => 
      mentionedChampions.includes(b.champion) || b.responsibility > 30
    )
    
    if (mainPlayers.length === 0) {
      return this.generateGeneralVerdict(scoredBehaviors)
    }
    
    // 책임도 순으로 정렬
    const sortedPlayers = mainPlayers.sort((a, b) => b.responsibility - a.responsibility)
    
    const primaryResponsible = sortedPlayers[0]
    const secondaryResponsible = sortedPlayers[1]
    
    // 판결 로직
    let finalVerdict = ''
    let reasoning = ''
    let punishment = ''
    let confidence = 0.8
    
    if (primaryResponsible.responsibility > 70) {
      finalVerdict = `${primaryResponsible.champion} 유죄`
      reasoning = `${primaryResponsible.champion}의 행동이 가장 큰 책임을 지며, ${primaryResponsible.grade}등급의 성과를 보였습니다.`
      punishment = '게임 매너 및 판단력 개선 필요'
      confidence = 0.9
    } else if (primaryResponsible.responsibility > 50) {
      finalVerdict = `${primaryResponsible.champion} 부분 유죄`
      reasoning = `${primaryResponsible.champion}이 주요 책임을 지지만, ${secondaryResponsible?.champion || '다른 플레이어'}도 일부 책임이 있습니다.`
      punishment = '상호 이해 및 소통 개선 권장'
      confidence = 0.8
    } else {
      finalVerdict = '상호 책임'
      reasoning = '모든 관련 플레이어들이 비슷한 수준의 책임을 지며, 전반적인 개선이 필요합니다.'
      punishment = '팀워크 및 개인 기량 향상 권장'
      confidence = 0.7
    }
    
    // 요인 및 권고사항
    const factors = this.generateFactors(scoredBehaviors, situationAnalysis)
    const recommendations = this.generateRecommendations(scoredBehaviors, situationAnalysis)
    const characterAnalysis = this.generateCharacterAnalysis(scoredBehaviors)
    const responsibilityAnalysis = this.generateResponsibilityAnalysis(scoredBehaviors)
    
    return {
      finalVerdict,
      reasoning,
      punishment,
      confidence,
      factors,
      recommendations,
      characterAnalysis,
      reinforcementLearning: '각 행동에 수치를 부여하여 객관적으로 분석한 결과입니다.',
      responsibilityAnalysis
    }
  }

  private generateGeneralVerdict(scoredBehaviors: any[]) {
    const avgScore = scoredBehaviors.reduce((sum, b) => sum + b.finalScore, 0) / scoredBehaviors.length
    
    let finalVerdict = ''
    let reasoning = ''
    let punishment = ''
    
    if (avgScore >= 70) {
      finalVerdict = '전체적으로 우수한 게임'
      reasoning = '팀 전체가 좋은 성과를 보여주었습니다.'
      punishment = '현재 플레이 스타일 유지'
    } else if (avgScore >= 50) {
      finalVerdict = '평균적인 게임'
      reasoning = '전체적으로 평균적인 성과를 보여주었습니다.'
      punishment = '지속적인 개선 노력 권장'
    } else {
      finalVerdict = '전체적인 개선 필요'
      reasoning = '팀 전체의 성과가 기대에 미치지 못했습니다.'
      punishment = '팀워크 및 개인 기량 향상 권장'
    }
    
    return {
      finalVerdict,
      reasoning,
      punishment,
      confidence: 0.6,
      factors: this.generateFactors(scoredBehaviors, { situationType: 'general' }),
      recommendations: this.generateRecommendations(scoredBehaviors, { situationType: 'general' }),
      characterAnalysis: this.generateCharacterAnalysis(scoredBehaviors),
      reinforcementLearning: '전체 게임 성과를 기준으로 분석한 결과입니다.',
      responsibilityAnalysis: '전체적인 게임 성과를 기준으로 판단했습니다.'
    }
  }

  private generateFactors(scoredBehaviors: any[], situationAnalysis: any) {
    const factors = []
    
    factors.push(`분석된 상황: ${situationAnalysis.situationType}`)
    factors.push(`관련 플레이어 수: ${scoredBehaviors.length}`)
    
    if (scoredBehaviors.length > 0) {
      const avgScore = scoredBehaviors.reduce((sum, b) => sum + b.finalScore, 0) / scoredBehaviors.length
      factors.push(`평균 행동 점수: ${avgScore.toFixed(1)}`)
      
      const highestResponsibility = scoredBehaviors.reduce((max, b) => 
        b.responsibility > max.responsibility ? b : max
      )
      factors.push(`최고 책임도: ${highestResponsibility.champion} (${highestResponsibility.responsibility.toFixed(1)}%)`)
    }
    
    return factors
  }

  private generateRecommendations(scoredBehaviors: any[], situationAnalysis: any) {
    const recommendations = []
    
    const lowScorePlayers = scoredBehaviors.filter(b => b.finalScore < 50)
    if (lowScorePlayers.length > 0) {
      recommendations.push(`${lowScorePlayers.map(p => p.champion).join(', ')}: 개인 기량 향상 필요`)
    }
    
    const highResponsibilityPlayers = scoredBehaviors.filter(b => b.responsibility > 50)
    if (highResponsibilityPlayers.length > 0) {
      recommendations.push(`${highResponsibilityPlayers.map(p => p.champion).join(', ')}: 판단력 및 매너 개선 필요`)
    }
    
    recommendations.push('팀워크 및 소통 강화 권장')
    recommendations.push('지속적인 게임 이해도 향상')
    
    return recommendations
  }

  private generateCharacterAnalysis(scoredBehaviors: any[]) {
    if (scoredBehaviors.length === 0) {
      return '분석할 플레이어가 없습니다.'
    }
    
    return scoredBehaviors.map(behavior => {
      const player = this.gameData.participants.find((p: any) => p.id === behavior.playerId)
      const kda = player.kills > 0 ? (player.kills + player.assists) / Math.max(player.deaths, 1) : 0
      
      return `${behavior.champion}: 행동점수 ${behavior.finalScore.toFixed(1)}점 (${behavior.grade}등급), 책임도 ${behavior.responsibility.toFixed(1)}%, KDA ${kda.toFixed(1)}`
    }).join('\n')
  }

  private generateResponsibilityAnalysis(scoredBehaviors: any[]) {
    if (scoredBehaviors.length === 0) {
      return '책임 분석을 위한 데이터가 부족합니다.'
    }
    
    const sortedByResponsibility = scoredBehaviors.sort((a, b) => b.responsibility - a.responsibility)
    
    return sortedByResponsibility.map((behavior, index) => {
      const rank = index + 1
      return `${rank}위: ${behavior.champion} (책임도 ${behavior.responsibility.toFixed(1)}%, ${behavior.grade}등급)`
    }).join('\n')
  }
}
