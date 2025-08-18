import { NextRequest, NextResponse } from 'next/server'
import { LolAIJudge } from '@/app/lib/aiJudge'
import { LolCourtAnalyzer } from '@/app/lib/verdictAnalyzer'

export async function POST(request: NextRequest) {
  try {
    const { caseDescription, gameData } = await request.json()

    if (!caseDescription) {
      return NextResponse.json(
        { error: '소송 사유가 필요합니다.' },
        { status: 400 }
      )
    }

    // 게임 데이터가 있으면 사건 설명을 강화
    let enhancedCaseDescription = caseDescription
    if (gameData) {
      enhancedCaseDescription = enhanceCaseWithGameData(caseDescription, gameData)
    }

    // AI 판사 초기화
    const aiJudge = new LolAIJudge()
    const analyzer = new LolCourtAnalyzer()

    // 사건 분석
    const analysis = await aiJudge.analyzeCase(enhancedCaseDescription)
    const verdictAnalysis = await analyzer.analyzeCase(enhancedCaseDescription)

    // 게임 데이터 기반 추가 분석
    let additionalAnalysis = null
    if (gameData) {
      additionalAnalysis = generateAdditionalAnalysis(gameData, caseDescription)
    }

    return NextResponse.json({
      success: true,
      verdict: analysis.verdict,
      reasoning: analysis.reasoning,
      punishment: analysis.punishment || '',
      confidence: analysis.confidence || 0.8,
      factors: analysis.factors || [],
      recommendations: analysis.recommendations || [],
      characterAnalysis: analysis.characterAnalysis || '',
      reinforcementLearning: analysis.reinforcementLearning || 'AI 판사가 게임 데이터를 종합적으로 분석하여 판결을 내렸습니다.',
      ...additionalAnalysis
    })

  } catch (error) {
    console.error('판결 처리 오류:', error)
    return NextResponse.json(
      { error: '판결 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

function enhanceCaseWithGameData(caseDescription: string, gameData: any): string {
  const { participants, analysis, events } = gameData
  
  // 언급된 챔피언 찾기
  const mentionedChampions = findMentionedChampions(caseDescription, participants)
  
  // 관련 플레이어 성과 분석
  const relevantPlayers = analyzeRelevantPlayers(mentionedChampions, participants)
  
  // 게임 통계 요약
  const gameStats = `
게임 통계:
- 총 킬: ${analysis.totalKills}
- 총 데스: ${analysis.totalDeaths}
- 총 어시스트: ${analysis.totalAssists}
- 게임 시간: ${Math.floor(gameData.duration / 60)}분
- 드래곤: ${analysis.objectives.dragons}개
- 바론: ${analysis.objectives.barons}개
- 타워: ${analysis.objectives.towers}개
- 팀파이트: ${analysis.teamfights}회
`

  // 관련 플레이어 성과
  const playerPerformance = relevantPlayers.length > 0 ? `
관련 플레이어 성과:
${relevantPlayers.map(player => 
  `- ${player.champion}: KDA ${player.kills}/${player.deaths}/${player.assists}, CS ${player.cs}, 점수 ${player.score}점 (${player.rank}위)`
).join('\n')}
` : ''

  // 주요 이벤트 분석
  const keyEvents = extractKeyEvents(events, mentionedChampions)
  const eventAnalysis = keyEvents.length > 0 ? `
주요 이벤트:
${keyEvents.map(event => `- ${event.description} (${Math.floor(event.timestamp / 1000)}초)`).join('\n')}
` : ''

  return `${caseDescription}

${gameStats}
${playerPerformance}
${eventAnalysis}

위의 게임 데이터를 바탕으로 정확한 판결을 내려주세요.`
}

function findMentionedChampions(caseDescription: string, participants: any[]): string[] {
  const championNames = participants.map(p => p.champion)
  const mentioned = championNames.filter(champion => 
    caseDescription.toLowerCase().includes(champion.toLowerCase())
  )
  return mentioned
}

function analyzeRelevantPlayers(mentionedChampions: string[], participants: any[]): any[] {
  if (mentionedChampions.length === 0) {
    // 언급된 챔피언이 없으면 상위 3명 반환
    return participants
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 3)
  }
  
  return participants.filter(p => mentionedChampions.includes(p.champion))
}

function extractKeyEvents(events: any[], mentionedChampions: string[]): any[] {
  // 언급된 챔피언과 관련된 주요 이벤트 추출
  const relevantEvents = events.filter(event => {
    if (event.type === 'CHAMPION_KILL') {
      return mentionedChampions.length === 0 || 
             mentionedChampions.some(champion => 
               event.data.killerId && event.data.victimId
             )
    }
    return event.type === 'ELITE_MONSTER_KILL' || event.type === 'BUILDING_KILL'
  })
  
  return relevantEvents.slice(0, 5) // 상위 5개 이벤트만
}

function generateAdditionalAnalysis(gameData: any, caseDescription: string) {
  const { participants, analysis, events } = gameData
  
  // 언급된 챔피언 찾기
  const mentionedChampions = findMentionedChampions(caseDescription, participants)
  
  // 관련 플레이어 성과 분석
  const relevantPlayers = analyzeRelevantPlayers(mentionedChampions, participants)
  
  // 책임도 분석
  const responsibilityAnalysis = analyzeResponsibility(mentionedChampions, participants, events, caseDescription)
  
  // 게임 컨텍스트 정보
  const gameContext = {
    totalKills: analysis.totalKills,
    totalDeaths: analysis.totalDeaths,
    totalAssists: analysis.totalAssists,
    gameDuration: gameData.duration,
    participants: participants.length,
    mentionedChampions,
    relevantPlayers: relevantPlayers.map(player => ({
      champion: player.champion,
      kills: player.kills,
      deaths: player.deaths,
      assists: player.assists,
      cs: player.cs,
      score: player.score,
      rank: player.rank
    }))
  }
  
  return {
    gameContext,
    responsibilityAnalysis
  }
}

function analyzeResponsibility(mentionedChampions: string[], participants: any[], events: any[], caseDescription: string): string {
  if (mentionedChampions.length === 0) {
    return '소송 사유에서 특정 챔피언이 언급되지 않아 전체적인 게임 상황을 바탕으로 판단합니다.'
  }
  
  const relevantPlayers = participants.filter(p => mentionedChampions.includes(p.champion))
  const analysis = []
  
  relevantPlayers.forEach(player => {
    const kda = player.kills > 0 ? (player.kills + player.assists) / Math.max(player.deaths, 1) : 0
    
    if (kda > 3 && player.score > 70) {
      analysis.push(`${player.champion}은 우수한 성과(KDA ${kda.toFixed(1)}, 점수 ${player.score}점)를 보여주었으며, 책임도가 낮습니다.`)
    } else if (kda > 1.5 && player.score > 50) {
      analysis.push(`${player.champion}은 평균적인 성과(KDA ${kda.toFixed(1)}, 점수 ${player.score}점)를 보여주었으며, 부분적인 책임이 있을 수 있습니다.`)
    } else {
      analysis.push(`${player.champion}은 낮은 성과(KDA ${kda.toFixed(1)}, 점수 ${player.score}점)를 보여주었으며, 높은 책임도가 있습니다.`)
    }
  })
  
  // 팀 성과 분석
  const blueTeam = participants.filter(p => p.team === 100)
  const redTeam = participants.filter(p => p.team === 200)
  
  const blueScore = blueTeam.reduce((sum, p) => sum + p.score, 0) / blueTeam.length
  const redScore = redTeam.reduce((sum, p) => sum + p.score, 0) / redTeam.length
  
  if (Math.abs(blueScore - redScore) > 20) {
    const winningTeam = blueScore > redScore ? '블루팀' : '레드팀'
    analysis.push(`전체적으로 ${winningTeam}이 우세한 성과를 보여주었습니다.`)
  }
  
  return analysis.join('\n')
}
