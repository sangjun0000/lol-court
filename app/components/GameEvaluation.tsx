'use client'

interface Player {
  id: number
  champion: string
  team: number
  kills: number
  deaths: number
  assists: number
  cs: number
  level: number
  rank: number
  evaluation: string
  score: number
}

interface GameEvaluationProps {
  players: Player[]
  gameAnalysis: {
    totalKills: number
    totalDeaths: number
    totalAssists: number
    objectives: {
      dragons: number
      barons: number
      towers: number
    }
    teamfights: number
    highlights: Array<{
      time: number
      type: string
      description: string
      participants: number[]
    }>
    gameSummary: {
      duration: number
      winner: number
      gameType: string
      mapName: string
    }
    teamAnalysis: {
      blueTeam: {
        totalKills: number
        totalDeaths: number
        totalAssists: number
        objectives: number
        teamfightWins: number
        evaluation: string
        strengths: string[]
        weaknesses: string[]
      }
      redTeam: {
        totalKills: number
        totalDeaths: number
        totalAssists: number
        objectives: number
        teamfightWins: number
        evaluation: string
        strengths: string[]
        weaknesses: string[]
      }
    }
    metaAnalysis: {
      gamePhase: string
      keyMoments: string[]
      turningPoints: string[]
      recommendations: string[]
    }
  }
  isVisible: boolean
}

export default function GameEvaluation({ players, gameAnalysis, isVisible }: GameEvaluationProps) {
  if (!isVisible) return null

  const sortedPlayers = [...players].sort((a, b) => a.rank - b.rank)

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 border-2 border-lol-gold">
      <h3 className="text-2xl font-bold text-court-brown mb-6">
        🏆 전문 게임 분석 리포트
      </h3>

      {/* 게임 기본 정보 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">📋 게임 기본 정보</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.floor(gameAnalysis.gameSummary.duration / 60)}:{(gameAnalysis.gameSummary.duration % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-600">게임 시간</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {gameAnalysis.gameSummary.winner === 100 ? '블루팀' : '레드팀'}
            </div>
            <div className="text-sm text-gray-600">승리팀</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{gameAnalysis.gameSummary.gameType}</div>
            <div className="text-sm text-gray-600">게임 타입</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{gameAnalysis.gameSummary.mapName}</div>
            <div className="text-sm text-gray-600">맵</div>
          </div>
        </div>
      </div>

      {/* 게임 통계 요약 */}
      <div className="bg-gradient-to-r from-red-50 to-yellow-50 rounded-lg p-4 mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">📊 게임 통계 요약</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{gameAnalysis.totalKills}</div>
            <div className="text-sm text-gray-600">총 킬</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{gameAnalysis.totalDeaths}</div>
            <div className="text-sm text-gray-600">총 데스</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{gameAnalysis.totalAssists}</div>
            <div className="text-sm text-gray-600">총 어시스트</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{gameAnalysis.teamfights}</div>
            <div className="text-sm text-gray-600">팀파이트</div>
          </div>
        </div>
      </div>

      {/* 플레이어 순위 */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">👑 플레이어 순위 (1등 ~ 10등)</h4>
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                player.rank === 1
                  ? 'bg-yellow-50 border-yellow-300 shadow-lg'
                  : player.rank === 2
                  ? 'bg-gray-50 border-gray-300'
                  : player.rank === 3
                  ? 'bg-orange-50 border-orange-300'
                  : 'bg-white border-gray-200'
              }`}
            >
              {/* 순위 */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white mr-4 ${
                player.rank === 1
                  ? 'bg-yellow-500'
                  : player.rank === 2
                  ? 'bg-gray-500'
                  : player.rank === 3
                  ? 'bg-orange-500'
                  : 'bg-blue-500'
              }`}>
                {player.rank}
              </div>

              {/* 챔피언 정보 */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-gray-800">{player.champion}</h5>
                    <p className="text-sm text-gray-600">
                      팀 {player.team === 100 ? '블루' : '레드'} • 레벨 {player.level}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">
                      {player.kills}/{player.deaths}/{player.assists}
                    </div>
                    <div className="text-sm text-gray-600">CS: {player.cs}</div>
                  </div>
                </div>
                
                {/* 평가 */}
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">{player.evaluation}</p>
                    <div className="text-sm font-semibold text-blue-600">
                      점수: {player.score}/100
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 주요 하이라이트 */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">⭐ 주요 하이라이트</h4>
        <div className="space-y-2">
          {gameAnalysis.highlights.map((highlight, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-800">{highlight.type}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    ({Math.floor(highlight.time / 60)}:{(highlight.time % 60).toString().padStart(2, '0')})
                  </span>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {highlight.participants.length}명 참여
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{highlight.description}</p>
            </div>
          ))}
        </div>
      </div>

             {/* 팀 분석 */}
       <div className="mb-6">
         <h4 className="text-lg font-semibold text-gray-800 mb-3">⚔️ 팀별 상세 분석</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* 블루팀 분석 */}
           <div className="bg-blue-50 rounded-lg p-4">
             <h5 className="font-semibold text-blue-800 mb-2">🔵 블루팀 분석</h5>
             <div className="text-sm text-blue-700 space-y-2">
               <p><strong>킬/데스/어시스트:</strong> {gameAnalysis.teamAnalysis.blueTeam.totalKills}/{gameAnalysis.teamAnalysis.blueTeam.totalDeaths}/{gameAnalysis.teamAnalysis.blueTeam.totalAssists}</p>
               <p><strong>오브젝트:</strong> {gameAnalysis.teamAnalysis.blueTeam.objectives}개</p>
               <p><strong>팀파이트 승리:</strong> {gameAnalysis.teamAnalysis.blueTeam.teamfightWins}회</p>
               <p><strong>평가:</strong> {gameAnalysis.teamAnalysis.blueTeam.evaluation}</p>
               <div className="mt-2">
                 <p><strong>강점:</strong></p>
                 <ul className="list-disc list-inside ml-2">
                   {gameAnalysis.teamAnalysis.blueTeam.strengths.map((strength, index) => (
                     <li key={index}>{strength}</li>
                   ))}
                 </ul>
               </div>
               <div className="mt-2">
                 <p><strong>약점:</strong></p>
                 <ul className="list-disc list-inside ml-2">
                   {gameAnalysis.teamAnalysis.blueTeam.weaknesses.map((weakness, index) => (
                     <li key={index}>{weakness}</li>
                   ))}
                 </ul>
               </div>
             </div>
           </div>

           {/* 레드팀 분석 */}
           <div className="bg-red-50 rounded-lg p-4">
             <h5 className="font-semibold text-red-800 mb-2">🔴 레드팀 분석</h5>
             <div className="text-sm text-red-700 space-y-2">
               <p><strong>킬/데스/어시스트:</strong> {gameAnalysis.teamAnalysis.redTeam.totalKills}/{gameAnalysis.teamAnalysis.redTeam.totalDeaths}/{gameAnalysis.teamAnalysis.redTeam.totalAssists}</p>
               <p><strong>오브젝트:</strong> {gameAnalysis.teamAnalysis.redTeam.objectives}개</p>
               <p><strong>팀파이트 승리:</strong> {gameAnalysis.teamAnalysis.redTeam.teamfightWins}회</p>
               <p><strong>평가:</strong> {gameAnalysis.teamAnalysis.redTeam.evaluation}</p>
               <div className="mt-2">
                 <p><strong>강점:</strong></p>
                 <ul className="list-disc list-inside ml-2">
                   {gameAnalysis.teamAnalysis.redTeam.strengths.map((strength, index) => (
                     <li key={index}>{strength}</li>
                   ))}
                 </ul>
               </div>
               <div className="mt-2">
                 <p><strong>약점:</strong></p>
                 <ul className="list-disc list-inside ml-2">
                   {gameAnalysis.teamAnalysis.redTeam.weaknesses.map((weakness, index) => (
                     <li key={index}>{weakness}</li>
                   ))}
                 </ul>
               </div>
             </div>
           </div>
         </div>
       </div>

       {/* 메타 분석 */}
       <div className="mb-6">
         <h4 className="text-lg font-semibold text-gray-800 mb-3">🎯 메타 분석 및 전략적 인사이트</h4>
         <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <h5 className="font-semibold text-purple-800 mb-2">📈 게임 페이즈 분석</h5>
               <p className="text-sm text-purple-700">{gameAnalysis.metaAnalysis.gamePhase}</p>
             </div>
             <div>
               <h5 className="font-semibold text-purple-800 mb-2">🔄 전환점 분석</h5>
               <ul className="text-sm text-purple-700 space-y-1">
                 {gameAnalysis.metaAnalysis.turningPoints.map((point, index) => (
                   <li key={index}>• {point}</li>
                 ))}
               </ul>
             </div>
           </div>
           
           <div className="mt-4">
             <h5 className="font-semibold text-purple-800 mb-2">💡 핵심 순간</h5>
             <ul className="text-sm text-purple-700 space-y-1">
               {gameAnalysis.metaAnalysis.keyMoments.map((moment, index) => (
                 <li key={index}>• {moment}</li>
               ))}
             </ul>
           </div>

           <div className="mt-4">
             <h5 className="font-semibold text-purple-800 mb-2">🎯 개선 권장사항</h5>
             <ul className="text-sm text-purple-700 space-y-1">
               {gameAnalysis.metaAnalysis.recommendations.map((rec, index) => (
                 <li key={index}>• {rec}</li>
               ))}
             </ul>
           </div>
         </div>
       </div>

       {/* 오브젝트 정보 */}
       <div className="mb-6">
         <h4 className="text-lg font-semibold text-gray-800 mb-3">🏰 오브젝트 정보</h4>
         <div className="grid grid-cols-3 gap-4">
           <div className="text-center bg-red-50 rounded-lg p-3">
             <div className="text-2xl font-bold text-red-600">{gameAnalysis.objectives.dragons}</div>
             <div className="text-sm text-gray-600">드래곤</div>
           </div>
           <div className="text-center bg-purple-50 rounded-lg p-3">
             <div className="text-2xl font-bold text-purple-600">{gameAnalysis.objectives.barons}</div>
             <div className="text-sm text-gray-600">바론</div>
           </div>
           <div className="text-center bg-yellow-50 rounded-lg p-3">
             <div className="text-2xl font-bold text-yellow-600">{gameAnalysis.objectives.towers}</div>
             <div className="text-sm text-gray-600">타워</div>
           </div>
         </div>
       </div>

       {/* 전문가 코멘트 */}
       <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
         <h4 className="text-lg font-semibold text-gray-800 mb-3">🎤 전문가 코멘트</h4>
         <div className="text-sm text-gray-700 space-y-2">
           <p>이 게임은 {gameAnalysis.gameSummary.duration > 1800 ? '장기전' : '중단기전'}으로, {gameAnalysis.totalKills > 30 ? '고킬 게임' : '저킬 게임'}의 특징을 보였습니다.</p>
           <p>승리팀의 핵심 요인은 {gameAnalysis.gameSummary.winner === 100 ? '블루팀' : '레드팀'}의 {gameAnalysis.teamAnalysis.blueTeam.objectives > gameAnalysis.teamAnalysis.redTeam.objectives ? '오브젝트 우위' : '팀파이트 우위'}였으며,</p>
           <p>전체적으로 {gameAnalysis.teamfights > 5 ? '팀파이트 중심' : '개인 플레이 중심'}의 게임이었습니다.</p>
         </div>
       </div>
     </div>
   )
 }
