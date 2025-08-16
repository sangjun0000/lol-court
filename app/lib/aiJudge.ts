import OpenAI from 'openai'
import { LoLReinforcementLearning, GameState } from './reinforcementLearning'

export interface AIVerdict {
  verdict: string
  reasoning: string
  punishment?: string
  confidence: number
  characterAnalysis: {
    primaryFault: string
    secondaryFault?: string
    faultComparison: string
  }
  factors: string[]
  recommendations: string[]
  reinforcementLearning?: {
    optimalAction: string
    expectedReward: number
    playerReward: number
    fault: number
  }
}

export class LolAIJudge {
  private openai: OpenAI
  private systemPrompt: string
  private rlSystem: LoLReinforcementLearning

  constructor(apiKey?: string) {
    this.openai = apiKey ? new OpenAI({ apiKey }) : new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' })
    this.rlSystem = new LoLReinforcementLearning()
    this.systemPrompt = `당신은 리그 오브 레전드의 전문 판사입니다.

당신의 역할:
1. 게임 상황을 정확히 분석
2. 각 플레이어의 행동을 객관적으로 평가
3. 누가 더 큰 책임이 있는지 판단
4. 구체적인 근거와 함께 판결 제시

판단 기준:
- 게임 시간 (초반/중반/후반)
- 팀 상황 (골드 차이, 오브젝트 상황)
- 개인 vs 팀 이익의 균형
- 위험도와 보상의 비율
- 스펠 유무, 레벨 차이, 아이템 상황
- 맵 리딩과 시야 상황
- 상대방 스킬 쿨타임

응답 형식 (JSON):
{
  "verdict": "최종 판결",
  "reasoning": "판결 근거",
  "punishment": "벌칙 (선택사항)",
  "confidence": 0.0-1.0,
  "characterAnalysis": {
    "primaryFault": "주요 책임자 캐릭터명",
    "secondaryFault": "보조 책임자 캐릭터명 (선택사항)",
    "faultComparison": "책임 비교 설명"
  },
  "factors": ["고려한 요소1", "고려한 요소2"],
  "recommendations": ["개선 제안1", "개선 제안2"]
}`
  }

  async analyzeCase(caseDescription: string): Promise<AIVerdict> {
    try {
      // 1. 강화학습 시스템으로 기본 분석
      const gameState = this.extractGameState(caseDescription)
      const playerAction = this.extractPlayerAction(caseDescription)
      
      const rlAnalysis = this.rlSystem.generateAIVerdict(
        caseDescription,
        playerAction,
        gameState
      )

      // 2. OpenAI API로 상세 분석
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: this.systemPrompt
          },
          {
            role: "user",
            content: `다음 게임 상황을 분석해주세요:

${caseDescription}

강화학습 분석 결과:
- 최적 행동: ${rlAnalysis.optimalAction}
- 예상 보상: ${rlAnalysis.expectedReward}
- 플레이어 보상: ${rlAnalysis.playerReward}
- 잘못 정도: ${(rlAnalysis.fault * 100).toFixed(1)}%

이 정보를 참고하여 최종 판결을 내려주세요.`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('OpenAI API 응답이 없습니다.')
      }

      // 3. JSON 파싱 및 강화학습 결과 통합
      const aiVerdict = this.parseAIResponse(response)
      
      return {
        ...aiVerdict,
        reinforcementLearning: {
          optimalAction: rlAnalysis.optimalAction,
          expectedReward: rlAnalysis.expectedReward,
          playerReward: rlAnalysis.playerReward,
          fault: rlAnalysis.fault
        }
      }

    } catch (error) {
      console.error('AI 판사 분석 오류:', error)
      
      // 오류 시 강화학습 결과만 반환
      const gameState = this.extractGameState(caseDescription)
      const playerAction = this.extractPlayerAction(caseDescription)
      const rlAnalysis = this.rlSystem.generateAIVerdict(
        caseDescription,
        playerAction,
        gameState
      )

      return {
        verdict: rlAnalysis.verdict,
        reasoning: rlAnalysis.reasoning,
        confidence: 0.7,
        characterAnalysis: {
          primaryFault: '분석 실패',
          faultComparison: 'AI 분석 중 오류가 발생했습니다.'
        },
        factors: ['강화학습 기반 분석'],
        recommendations: ['더 자세한 상황 설명을 제공해주세요.'],
        reinforcementLearning: {
          optimalAction: rlAnalysis.optimalAction,
          expectedReward: rlAnalysis.expectedReward,
          playerReward: rlAnalysis.playerReward,
          fault: rlAnalysis.fault
        }
      }
    }
  }

  async analyzeVideo(videoFrames: string[]): Promise<AIVerdict> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: `당신은 리그 오브 레전드 영상 분석 전문가입니다. 
            제공된 영상 프레임들을 분석하여 게임 상황을 파악하고 판결을 내려주세요.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "이 영상에서 발생한 게임 상황을 분석하고 누가 더 큰 책임이 있는지 판단해주세요."
              },
              ...videoFrames.map(frame => ({
                type: "image_url" as const,
                image_url: {
                  url: frame
                }
              }))
            ]
          }
        ],
        max_tokens: 1000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('영상 분석 응답이 없습니다.')
      }

      return this.parseAIResponse(response)

    } catch (error) {
      console.error('영상 분석 오류:', error)
      throw error
    }
  }

  // 게임 상태 추출
  private extractGameState(caseDescription: string): GameState {
    // 텍스트에서 게임 상태 정보 추출
    const gameTime = this.extractGameTime(caseDescription)
    const goldInfo = this.extractGoldInfo(caseDescription)
    
    return {
      gameTime: gameTime,
      playerLevel: this.extractPlayerLevel(caseDescription),
      teamGold: goldInfo.teamGold,
      enemyGold: goldInfo.enemyGold,
      objectives: this.extractObjectives(caseDescription),
      teamFights: this.extractTeamFights(caseDescription),
      vision: this.extractVisionScore(caseDescription),
      pressure: this.extractPressureScore(caseDescription)
    }
  }

  // 플레이어 행동 추출
  private extractPlayerAction(caseDescription: string): string {
    if (caseDescription.includes('갱킹 호응')) return 'gank_response_kill'
    if (caseDescription.includes('갱킹 무시')) return 'gank_ignore_safe'
    if (caseDescription.includes('CS 집중')) return 'cs_focus_safe'
    if (caseDescription.includes('오브젝트 참여')) return 'objective_join_win'
    if (caseDescription.includes('팀파이트 참여')) return 'teamfight_engage_win'
    
    return 'unknown_action'
  }

  // 게임 시간 추출
  private extractGameTime(description: string): number {
    const timeMatch = description.match(/(\d+)분/)
    if (timeMatch) {
      return parseInt(timeMatch[1]) * 60
    }
    return 900 // 기본값 15분
  }

  // 골드 정보 추출
  private extractGoldInfo(description: string): { teamGold: number, enemyGold: number } {
    // 간단한 추출 로직 (실제로는 더 정교한 파싱 필요)
    return {
      teamGold: 15000,
      enemyGold: 14000
    }
  }

  // 플레이어 레벨 추출
  private extractPlayerLevel(description: string): number {
    const levelMatch = description.match(/레벨\s*(\d+)/)
    return levelMatch ? parseInt(levelMatch[1]) : 10
  }

  // 오브젝트 정보 추출
  private extractObjectives(description: string): string[] {
    const objectives: string[] = []
    if (description.includes('드래곤')) objectives.push('dragon')
    if (description.includes('바론')) objectives.push('baron')
    if (description.includes('타워')) objectives.push('tower')
    return objectives
  }

  // 팀파이트 수 추출
  private extractTeamFights(description: string): number {
    const fightMatch = description.match(/팀파이트\s*(\d+)/)
    return fightMatch ? parseInt(fightMatch[1]) : 0
  }

  // 시야 점수 추출
  private extractVisionScore(description: string): number {
    if (description.includes('시야 좋음')) return 0.8
    if (description.includes('시야 나쁨')) return 0.2
    return 0.5
  }

  // 압박도 추출
  private extractPressureScore(description: string): number {
    if (description.includes('압박 심함')) return 0.8
    if (description.includes('압박 없음')) return 0.2
    return 0.5
  }

  // AI 응답 파싱
  private parseAIResponse(response: string): AIVerdict {
    try {
      // JSON 추출 시도
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      // JSON이 아닌 경우 기본 구조로 변환
      return {
        verdict: response,
        reasoning: 'AI 분석 결과',
        confidence: 0.8,
        characterAnalysis: {
          primaryFault: '분석 필요',
          faultComparison: response
        },
        factors: ['AI 분석'],
        recommendations: ['더 자세한 분석이 필요합니다.']
      }
    } catch (error) {
      console.error('AI 응답 파싱 오류:', error)
      return {
        verdict: response,
        reasoning: '응답 파싱 실패',
        confidence: 0.5,
        characterAnalysis: {
          primaryFault: '분석 실패',
          faultComparison: '응답을 파싱할 수 없습니다.'
        },
        factors: ['파싱 오류'],
        recommendations: ['다시 시도해주세요.']
      }
    }
  }

  // 강화학습 결과 학습
  learnFromResult(action: string, situation: string, actualResult: any): void {
    this.rlSystem.learnFromResult(action, situation, actualResult)
  }

  // 학습 데이터 내보내기
  exportLearningData(): any {
    return this.rlSystem.exportLearningData()
  }

  // 학습 데이터 불러오기
  importLearningData(data: any): void {
    this.rlSystem.importLearningData(data)
  }

  // ROFL 파일 분석
  async judgeRoflReplay(params: {
    roflData: ArrayBuffer
    roflInfo: any
    customDescription: string
    targetCharacters: string[]
  }): Promise<AIVerdict> {
    try {
      // ROFL 파일에서 게임 이벤트 추출
      const gameEvents = await this.extractGameEventsFromRofl(params.roflData)
      
      // 사용자 설명과 결합
      const analysisDescription = `
ROFL 리플레이 분석 요청:
${params.customDescription}

분석 대상 캐릭터: ${params.targetCharacters.join(', ')}

게임 이벤트 정보:
${JSON.stringify(gameEvents, null, 2)}
      `

      // 기존 분석 로직 사용
      return await this.analyzeCase(analysisDescription)
    } catch (error) {
      console.error('ROFL 분석 오류:', error)
      throw new Error('ROFL 파일 분석에 실패했습니다.')
    }
  }

  // 영상 파일 분석
  async judgeVideo(params: {
    videoFile: File
    startTime: number
    endTime: number
    customDescription: string
    targetCharacters: string[]
  }): Promise<AIVerdict> {
    try {
      // 영상에서 프레임 추출 (실제 구현 필요)
      const frames = await this.extractFramesFromVideo(params.videoFile, params.startTime, params.endTime)
      
      // 사용자 설명과 결합
      const analysisDescription = `
영상 분석 요청:
${params.customDescription}

분석 대상 캐릭터: ${params.targetCharacters.join(', ')}
분석 구간: ${params.startTime}초 ~ ${params.endTime}초
분석된 프레임 수: ${frames.length}
      `

      // 기존 분석 로직 사용
      return await this.analyzeCase(analysisDescription)
    } catch (error) {
      console.error('영상 분석 오류:', error)
      throw new Error('영상 분석에 실패했습니다.')
    }
  }

  // ROFL 파일에서 게임 이벤트 추출
  private async extractGameEventsFromRofl(roflData: ArrayBuffer): Promise<any[]> {
    // 실제 ROFL 파싱 로직 구현 필요
    // 현재는 기본 구조만 반환
    return [
      {
        type: 'game_start',
        timestamp: 0,
        description: '게임 시작'
      },
      {
        type: 'team_fight',
        timestamp: 300,
        description: '팀파이트 발생'
      }
    ]
  }

  // 영상에서 프레임 추출
  private async extractFramesFromVideo(videoFile: File, startTime: number, endTime: number): Promise<any[]> {
    // 실제 영상 프레임 추출 로직 구현 필요
    // 현재는 기본 구조만 반환
    return [
      {
        timestamp: startTime,
        description: '분석 시작 프레임'
      },
      {
        timestamp: endTime,
        description: '분석 종료 프레임'
      }
    ]
  }
}
