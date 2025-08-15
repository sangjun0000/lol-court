// 롤문철 분석을 위한 고급 판결 시스템
import { GameKnowledgeBase } from './gameKnowledge'

export interface GameContext {
  gamePhase: 'early' | 'mid' | 'late'
  teamComposition: string[]
  playerRoles: string[]
  gameState: 'winning' | 'losing' | 'even'
  objectives: string[]
  roleConflicts?: string[]
}

export interface VerdictAnalysis {
  verdict: string
  reasoning: string
  punishment?: string
  confidence: number
  factors: string[]
  recommendations: string[]
  characterAnalysis?: {
    primaryFault: string
    secondaryFault?: string
    faultComparison: string
  }
}

export class LolCourtAnalyzer {
  private gameKnowledge: GameKnowledgeBase

  constructor() {
    this.gameKnowledge = new GameKnowledgeBase()
  }

  private gameRules = {
    teamplay: ['팀워크', '협력', '소통', '객관성'],
    gameKnowledge: ['게임 이해도', '메타 인식', '상황 판단'],
    sportsmanship: ['매너', '존중', '건설적 비판'],
    responsibility: ['역할 수행', '책임감', '개선 의지']
  }

  private analyzeContext(caseDescription: string): GameContext {
    const lowerCase = caseDescription.toLowerCase()
    
    // 게임 페이즈 분석
    let gamePhase: 'early' | 'mid' | 'late' = 'mid'
    if (lowerCase.includes('초반') || lowerCase.includes('라인전') || lowerCase.includes('갱')) {
      gamePhase = 'early'
    } else if (lowerCase.includes('후반') || lowerCase.includes('한타') || lowerCase.includes('넥서스')) {
      gamePhase = 'late'
    }

    // 팀 상태 분석
    let gameState: 'winning' | 'losing' | 'even' = 'even'
    if (lowerCase.includes('이기고') || lowerCase.includes('우세') || lowerCase.includes('앞서')) {
      gameState = 'winning'
    } else if (lowerCase.includes('지고') || lowerCase.includes('열세') || lowerCase.includes('뒤처')) {
      gameState = 'losing'
    }

    // 플레이어 역할 추출
    const roles = ['정글러', '탑', '미드', '원딜', '서폿']
    const playerRoles = roles.filter(role => lowerCase.includes(role))

    // 오브젝티브 분석
    const objectives = []
    if (lowerCase.includes('드래곤')) objectives.push('드래곤')
    if (lowerCase.includes('바론')) objectives.push('바론')
    if (lowerCase.includes('타워')) objectives.push('타워')
    if (lowerCase.includes('CS')) objectives.push('CS')

    // 역할 갈등 분석
    const roleConflicts: string[] = []
    if (playerRoles.length >= 2) {
      const phase = this.gameKnowledge.getGamePhase(gamePhase)
      if (phase) {
        roleConflicts.push(...phase.commonConflicts)
      }
    }

    return {
      gamePhase,
      teamComposition: [],
      playerRoles,
      gameState,
      objectives,
      roleConflicts
    }
  }

  private analyzeBehavior(caseDescription: string): {
    behavior: string
    severity: number
    intent: 'positive' | 'negative' | 'neutral'
  } {
    const lowerCase = caseDescription.toLowerCase()
    
    // 행동 패턴 분석
    const behaviors = {
      '비난': { severity: 3, intent: 'negative' },
      '화를 내': { severity: 4, intent: 'negative' },
      '불만': { severity: 2, intent: 'negative' },
      '명령': { severity: 3, intent: 'negative' },
      '도망': { severity: 2, intent: 'neutral' },
      '실패': { severity: 1, intent: 'neutral' },
      '도움': { severity: -1, intent: 'positive' },
      '협력': { severity: -2, intent: 'positive' },
      '칭찬': { severity: -3, intent: 'positive' }
    }

    let maxSeverity = 0
    let detectedBehavior = '일반적 행동'
    let intent: 'positive' | 'negative' | 'neutral' = 'neutral'

    for (const [behavior, analysis] of Object.entries(behaviors)) {
      if (lowerCase.includes(behavior) && Math.abs(analysis.severity) > Math.abs(maxSeverity)) {
        maxSeverity = analysis.severity
        detectedBehavior = behavior
        intent = analysis.intent
      }
    }

    return {
      behavior: detectedBehavior,
      severity: maxSeverity,
      intent
    }
  }

  private analyzeResponsibility(caseDescription: string, context: GameContext): {
    primaryResponsible: string
    secondaryResponsible?: string
    responsibilityLevel: number
    characterNames: string[]
  } {
    const lowerCase = caseDescription.toLowerCase()
    
    // 책임 분석 로직
    let primaryResponsible = '상황에 따라 다름'
    let secondaryResponsible: string | undefined
    let responsibilityLevel = 0.5
    const characterNames: string[] = []

    // 캐릭터 이름 추출 (일반적인 롤 캐릭터들)
    const champions = [
      '이즈리얼', '트런들', '야스오', '진', '카이사', '루시안', '베인', '케이틀린',
      '애쉬', '징크스', '트리스타나', '드레이븐', '미스 포츈', '바루스', '코그모',
      '리 신', '카직스', '렉사이', '엘리스', '누누', '람머스', '아무무', '피들스틱',
      '갱플랭크', '다리우스', '가렌', '나서스', '말파이트', '오른', '쉔', '케넨',
      '제라스', '오리아나', '아리', '카시오페아', '르블랑', '애니', '브랜드', '빅토르',
      '쓰레쉬', '레오나', '알리스타', '블리츠크랭크', '나미', '소나', '모르가나', '룰루'
    ]

    for (const champion of champions) {
      if (lowerCase.includes(champion.toLowerCase())) {
        characterNames.push(champion)
      }
    }

    // 정글러 관련 책임
    if (lowerCase.includes('정글러') && lowerCase.includes('갱')) {
      if (lowerCase.includes('실패') || lowerCase.includes('도망')) {
        primaryResponsible = '정글러'
        responsibilityLevel = 0.7
      }
    }

    // 라이너 관련 책임
    if (lowerCase.includes('CS') && lowerCase.includes('뺏어')) {
      primaryResponsible = '정글러'
      secondaryResponsible = '미드 라이너'
      responsibilityLevel = 0.8
    }

    // 서폿 관련 책임
    if (lowerCase.includes('서폿') && lowerCase.includes('명령')) {
      primaryResponsible = '원딜'
      responsibilityLevel = 0.6
    }

    return {
      primaryResponsible,
      secondaryResponsible,
      responsibilityLevel,
      characterNames
    }
  }

  private generateVerdict(
    behavior: any,
    context: GameContext,
    responsibility: any
  ): VerdictAnalysis {
    const { severity, intent } = behavior
    const { gamePhase, gameState, playerRoles, roleConflicts } = context
    const { responsibilityLevel, characterNames } = responsibility

    // 게임 지식 기반 분석
    const phase = this.gameKnowledge.getGamePhase(gamePhase)
    const relevantRules = this.gameKnowledge.getRelevantRules()
    
    // 역할별 책임 분석
    const roleAnalysis = playerRoles.map(role => this.gameKnowledge.getChampionRole(role)).filter(Boolean)
    
    // 판결 로직
    let verdict = ''
    let reasoning = ''
    let punishment: string | undefined
    let confidence = 0.7
    const factors: string[] = []
    const recommendations: string[] = []
    let characterAnalysis: any = undefined

    // 캐릭터별 책임 분석
    if (characterNames.length >= 2) {
      const char1 = characterNames[0]
      const char2 = characterNames[1]
      const lowerCase = caseDescription.toLowerCase()
      
      // 상황별 책임도 계산
      let char1Fault = 0.5
      let char2Fault = 0.5
      let faultReason = ''

      if (intent === 'negative' && severity >= 3) {
        if (lowerCase.includes('비난') || lowerCase.includes('화를 내')) {
          char1Fault = 0.7
          char2Fault = 0.3
          faultReason = `${char1}의 부정적 소통이 ${char2}의 실수보다 더 큰 문제를 야기했기 때문입니다.`
        } else if (lowerCase.includes('도망') || lowerCase.includes('실패')) {
          char1Fault = 0.4
          char2Fault = 0.6
          faultReason = `${char2}의 갱킹 대응 실패가 ${char1}의 판단보다 더 큰 책임이 있기 때문입니다.`
        }
      } else if (lowerCase.includes('CS') && lowerCase.includes('뺏어')) {
        char1Fault = 0.8
        char2Fault = 0.2
        faultReason = `${char1}의 CS 뺏기는 행동이 ${char2}의 반응보다 훨씬 더 부당한 행동이기 때문입니다.`
      }

      characterAnalysis = {
        primaryFault: char1Fault > char2Fault ? char1 : char2,
        secondaryFault: char1Fault > char2Fault ? char2 : char1,
        faultComparison: faultReason || `${char1}과 ${char2} 모두 비슷한 책임이 있습니다.`
      }
    }

    // 상황별 판결 (게임 지식 기반)
    if (intent === 'negative' && severity >= 3) {
      verdict = '유죄 판결'
      
      // 게임 페이즈별 구체적 분석
      let phaseContext = ''
      if (phase) {
        phaseContext = `${phase.name} 페이즈(${phase.duration})에서는 ${phase.priorities.join(', ')}가 우선되어야 하는데, `
      }
      
      reasoning = `분석 결과, 해당 플레이어의 ${behavior.behavior} 행동은 팀워크를 해치고 게임 분위기를 악화시켰습니다. ${phaseContext}${gameState} 상태를 고려할 때 더 건설적인 소통이 필요했습니다.`
      
      punishment = '팀워크 정신 함양 및 게임 매너 개선 필요'
      confidence = 0.85
      factors.push('부정적 의도', '높은 심각도', '팀워크 저해')
      
      // 역할별 구체적 권고사항
      roleAnalysis.forEach(role => {
        if (role) {
          recommendations.push(`${role.name} 역할의 ${role.responsibilities[0]} 개선 필요`)
        }
      })
      recommendations.push('건설적 소통 방법 학습', '상황별 적절한 반응 연습')
      
    } else if (intent === 'negative' && severity >= 2) {
      verdict = '부분 유죄'
      
      let phaseContext = ''
      if (phase) {
        phaseContext = `${phase.name} 페이즈에서의 판단과 `
      }
      
      reasoning = `상황을 분석한 결과, 일부 행동은 개선의 여지가 있습니다. ${phaseContext}${gameState} 상태를 고려할 때 더 나은 선택이 가능했습니다.`
      punishment = '게임 매너 개선 권고'
      confidence = 0.75
      factors.push('부정적 의도', '중간 심각도', '개선 가능')
      
      // 메타 규칙 기반 권고사항
      const communicationRule = relevantRules.find(rule => rule.category === '소통')
      if (communicationRule) {
        recommendations.push(communicationRule.description)
      }
      recommendations.push('상황별 판단력 향상', '팀원과의 소통 개선')
      
    } else if (intent === 'positive') {
      verdict = '정당한 행동'
      
      let phaseContext = ''
      if (phase) {
        phaseContext = `${phase.name} 페이즈에서의 올바른 판단과 `
      }
      
      reasoning = `제시된 상황에서 해당 플레이어의 행동은 완전히 정당하고 칭찬받을 만합니다. ${phaseContext}${gameState} 상태에서의 적절한 대응이었습니다.`
      confidence = 0.9
      factors.push('긍정적 의도', '팀워크 증진', '올바른 판단')
      recommendations.push('현재 플레이 스타일 유지', '다른 팀원들에게도 긍정적 영향 전파')
      
    } else {
      verdict = '무죄 판결'
      
      let phaseContext = ''
      if (phase) {
        phaseContext = `${phase.name} 페이즈와 `
      }
      
      reasoning = `종합적인 분석 결과, 해당 플레이어의 행동은 게임 상황에서 합리적이고 정당한 판단이었습니다. ${phaseContext}${gameState} 상태를 고려할 때 문제가 없었습니다.`
      confidence = 0.8
      factors.push('중립적 의도', '합리적 판단', '상황 적절성')
      recommendations.push('현재 플레이 스타일 유지', '게임 이해도 지속적 향상')
    }

    // 책임도에 따른 조정
    if (responsibilityLevel > 0.7) {
      if (verdict.includes('무죄')) {
        verdict = '부분 유죄'
        reasoning += ' 다만 일부 책임이 있으므로 향후 개선이 필요합니다.'
      }
    }

    // 역할 갈등이 있는 경우 추가 분석
    if (roleConflicts && roleConflicts.length > 0) {
      factors.push('역할 갈등 상황')
      recommendations.push('역할 간 소통 개선 필요')
    }

    return {
      verdict,
      reasoning,
      punishment,
      confidence,
      factors,
      recommendations,
      characterAnalysis
    }
  }

  public analyzeCase(caseDescription: string): VerdictAnalysis {
    const context = this.analyzeContext(caseDescription)
    const behavior = this.analyzeBehavior(caseDescription)
    const responsibility = this.analyzeResponsibility(caseDescription, context)

    return this.generateVerdict(behavior, context, responsibility)
  }
}
