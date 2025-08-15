// 리그 오브 레전드 게임 지식 및 메타 정보

export interface ChampionRole {
  name: string
  primaryRole: string
  secondaryRole?: string
  responsibilities: string[]
  commonIssues: string[]
}

export interface GamePhase {
  name: string
  duration: string
  objectives: string[]
  priorities: string[]
  commonConflicts: string[]
}

export interface MetaRule {
  category: string
  rule: string
  importance: number
  description: string
}

export class GameKnowledgeBase {
  private champions: ChampionRole[] = [
    {
      name: '정글러',
      primaryRole: '정글',
      responsibilities: [
        '갱킹으로 라인 우위 확보',
        '오브젝티브(드래곤, 바론) 컨트롤',
        '팀 전체 맵 압박',
        '라인 밸런싱'
      ],
      commonIssues: [
        '갱킹 타이밍 부족',
        '오브젝티브 놓침',
        '라인 밸런싱 실패',
        '팀원과의 소통 부족'
      ]
    },
    {
      name: '탑 라이너',
      primaryRole: '탑',
      responsibilities: [
        '라인 우위 확보',
        '스플릿 푸시',
        '팀파이트 참여',
        '탱킹 역할'
      ],
      commonIssues: [
        '갱킹 대응 실패',
        '스플릿 타이밍 부족',
        '팀파이트 참여 지연',
        '라인 밸런싱 실패'
      ]
    },
    {
      name: '미드 라이너',
      primaryRole: '미드',
      responsibilities: [
        '라인 우위 확보',
        '로밍으로 사이드 라인 지원',
        '오브젝티브 참여',
        'AP/AD 데미지 딜링'
      ],
      commonIssues: [
        '로밍 타이밍 부족',
        'CS 관리 실패',
        '오브젝티브 참여 지연',
        '라인 밸런싱 실패'
      ]
    },
    {
      name: '원딜',
      primaryRole: '원딜',
      responsibilities: [
        'CS 수급',
        '안전한 포지셔닝',
        '팀파이트 데미지 딜링',
        '오브젝티브 데미지'
      ],
      commonIssues: [
        '포지셔닝 실패',
        'CS 수급 부족',
        '팀파이트 참여 지연',
        '오브젝티브 참여 부족'
      ]
    },
    {
      name: '서폿',
      primaryRole: '서폿',
      responsibilities: [
        '원딜 보호',
        '시야 확보',
        '팀파이트 이니시',
        '오브젝티브 참여'
      ],
      commonIssues: [
        '시야 관리 실패',
        '원딜 보호 부족',
        '팀파이트 이니시 실패',
        '로밍 타이밍 부족'
      ]
    }
  ]

  private gamePhases: GamePhase[] = [
    {
      name: 'early',
      duration: '1-15분',
      objectives: ['라인 우위', '갱킹 성공', 'CS 수급'],
      priorities: ['라인 밸런싱', '갱킹 대응', 'CS 관리'],
      commonConflicts: [
        '정글러 갱킹 vs 라이너 도망',
        'CS 분배 문제',
        '시야 확보 vs 로밍'
      ]
    },
    {
      name: 'mid',
      duration: '15-25분',
      objectives: ['오브젝티브 컨트롤', '타워 밀기', '팀파이트'],
      priorities: ['드래곤/바론', '타워 밀기', '팀파이트'],
      commonConflicts: [
        '오브젝티브 vs CS 수급',
        '스플릿 vs 그룹',
        '타워 밀기 vs 오브젝티브'
      ]
    },
    {
      name: 'late',
      duration: '25분+',
      objectives: ['한타 승리', '넥서스 밀기', '바론 컨트롤'],
      priorities: ['한타', '오브젝티브', '넥서스'],
      commonConflicts: [
        '한타 vs 스플릿',
        '바론 vs 넥서스',
        '팀파이트 포지셔닝'
      ]
    }
  ]

  private metaRules: MetaRule[] = [
    {
      category: '팀워크',
      rule: '팀 전체의 이익이 개인의 이익보다 우선',
      importance: 5,
      description: '개인적인 플레이보다 팀 전체의 승리를 위한 플레이가 우선되어야 합니다.'
    },
    {
      category: '소통',
      rule: '건설적이고 존중하는 소통',
      importance: 4,
      description: '비난보다는 건설적인 피드백과 제안을 해야 합니다.'
    },
    {
      category: '책임',
      rule: '각자의 역할에 대한 책임감',
      importance: 4,
      description: '자신의 역할을 제대로 수행하고 실수에 대해 책임을 져야 합니다.'
    },
    {
      category: '객관성',
      rule: '상황을 객관적으로 판단',
      importance: 3,
      description: '감정적 판단보다는 게임 상황을 객관적으로 분석해야 합니다.'
    },
    {
      category: '개선',
      rule: '지속적인 개선 의지',
      importance: 3,
      description: '실수를 통해 배우고 개선하려는 의지가 있어야 합니다.'
    }
  ]

  public getChampionRole(roleName: string): ChampionRole | undefined {
    return this.champions.find(champ => 
      champ.name.toLowerCase().includes(roleName.toLowerCase()) ||
      roleName.toLowerCase().includes(champ.name.toLowerCase())
    )
  }

  public getGamePhase(phaseName: string): GamePhase | undefined {
    return this.gamePhases.find(phase => phase.name === phaseName)
  }

  public getMetaRules(): MetaRule[] {
    return this.metaRules
  }

  public getRelevantRules(category?: string): MetaRule[] {
    if (category) {
      return this.metaRules.filter(rule => rule.category === category)
    }
    return this.metaRules
  }

  public analyzeRoleConflict(role1: string, role2: string, situation: string): {
    conflict: string
    resolution: string
    responsibility: string
  } {
    const champ1 = this.getChampionRole(role1)
    const champ2 = this.getChampionRole(role2)

    if (!champ1 || !champ2) {
      return {
        conflict: '역할 불명확',
        resolution: '역할과 책임을 명확히 하세요',
        responsibility: '팀 전체'
      }
    }

    // 일반적인 갈등 패턴 분석
    if (role1 === '정글러' && role2 === '라이너') {
      if (situation.includes('갱킹') && situation.includes('실패')) {
        return {
          conflict: '갱킹 타이밍과 대응 문제',
          resolution: '정글러는 갱킹 타이밍을, 라이너는 대응을 개선해야 합니다',
          responsibility: '정글러 60%, 라이너 40%'
        }
      }
    }

    if (role1 === '원딜' && role2 === '서폿') {
      if (situation.includes('명령') || situation.includes('불만')) {
        return {
          conflict: '소통 방식 문제',
          resolution: '원딜은 건설적인 요청을, 서폿은 적극적인 협력을 해야 합니다',
          responsibility: '원딜 70%, 서폿 30%'
        }
      }
    }

    return {
      conflict: '일반적인 팀워크 문제',
      resolution: '상호 이해와 소통을 통해 해결해야 합니다',
      responsibility: '양쪽 모두'
    }
  }
}
