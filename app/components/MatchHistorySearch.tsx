'use client'

import { useState } from 'react'

export interface MatchData {
  matchId: string
  gameMode: string
  gameDuration: number
  gameDate: string
  champion: string
  kills: number
  deaths: number
  assists: number
  win: boolean
  videoUrl?: string
  highlights: {
    startTime: number
    endTime: number
    description: string
  }[]
}

interface MatchHistorySearchProps {
  onVideoAnalysisRequest: (matchData: MatchData, highlight: { startTime: number, endTime: number, description: string }, customDescription: string) => void
}

export default function MatchHistorySearch({ onVideoAnalysisRequest }: MatchHistorySearchProps) {
  const [summonerName, setSummonerName] = useState('')
  const [tagLine, setTagLine] = useState('KR1') // 태그라인 추가
  const [region, setRegion] = useState('kr')
  const [isLoading, setIsLoading] = useState(false)
  const [matches, setMatches] = useState<MatchData[]>([])
  const [error, setError] = useState('')
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [isSearchingTags, setIsSearchingTags] = useState(false)
  const [selectedHighlight, setSelectedHighlight] = useState<{ startTime: number, endTime: number, description: string } | null>(null)
  const [customDescription, setCustomDescription] = useState('')
  const [customStartTime, setCustomStartTime] = useState(0)
  const [customEndTime, setCustomEndTime] = useState(30)

  const regions = [
    { value: 'kr', label: '한국', flag: '🇰🇷' },
    { value: 'na1', label: '북미', flag: '🇺🇸' },
    { value: 'euw1', label: '서유럽', flag: '🇪🇺' },
    { value: 'eun1', label: '동유럽', flag: '🇪🇺' },
    { value: 'jp1', label: '일본', flag: '🇯🇵' },
    { value: 'br1', label: '브라질', flag: '🇧🇷' },
    { value: 'la1', label: '라틴아메리카', flag: '🇲🇽' },
    { value: 'la2', label: '라틴아메리카 남부', flag: '🇦🇷' },
    { value: 'oc1', label: '오세아니아', flag: '🇦🇺' },
    { value: 'tr1', label: '터키', flag: '🇹🇷' },
    { value: 'ru', label: '러시아', flag: '🇷🇺' },
    { value: 'ph2', label: '필리핀', flag: '🇵🇭' },
    { value: 'sg2', label: '싱가포르', flag: '🇸🇬' },
    { value: 'th2', label: '태국', flag: '🇹🇭' },
    { value: 'tw2', label: '대만', flag: '🇹🇼' },
    { value: 'vn2', label: '베트남', flag: '🇻🇳' }
  ]

  // 태그라인 검색 함수
  const searchAvailableTags = async (name: string) => {
    if (!name.trim() || name.length < 2) {
      setAvailableTags([])
      return
    }

    setIsSearchingTags(true)
    setAvailableTags([])

    try {
      const response = await fetch('/api/search-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summonerName: name.trim(),
          region: region
        }),
      })

      const data = await response.json()
      
      if (response.ok && data.tags) {
        setAvailableTags(data.tags)
      }
    } catch (error) {
      console.error('태그 검색 오류:', error)
    } finally {
      setIsSearchingTags(false)
    }
  }

  // 소환사명 변경 시 태그라인 자동 검색
  const handleSummonerNameChange = (name: string) => {
    setSummonerName(name)
    if (name.trim().length >= 2) {
      // 디바운스: 500ms 후에 검색
      const timeoutId = setTimeout(() => {
        searchAvailableTags(name)
      }, 500)
      return () => clearTimeout(timeoutId)
    } else {
      setAvailableTags([])
    }
  }

  const handleSearch = async () => {
    if (!summonerName.trim()) {
      setError('소환사명을 입력해주세요.')
      return
    }

    if (!tagLine.trim()) {
      setError('태그라인을 선택해주세요.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/match-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summonerName: summonerName.trim(),
          tagLine: tagLine.trim(),
          region: region
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || '전적 검색에 실패했습니다.')
      }

      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches)
      } else {
        setError('최근 게임 기록이 없습니다.')
        setMatches([])
      }
         } catch (error) {
       console.error('전적 검색 오류:', error)
       if (error instanceof Error) {
         setError(`전적 검색 오류: ${error.message}`)
       } else {
         setError('전적을 불러오는 중 오류가 발생했습니다.')
       }
     } finally {
      setIsLoading(false)
    }
  }

  const handleVideoAnalysis = (match: MatchData, highlight: { startTime: number, endTime: number, description: string }) => {
    setSelectedMatch(match)
    setSelectedHighlight(highlight)
    setCustomStartTime(highlight.startTime)
    setCustomEndTime(highlight.endTime)
    setCustomDescription(`${match.champion}의 ${highlight.description} 구간 분석`)
  }

  const handleCustomAnalysis = () => {
    if (selectedMatch && customDescription.trim()) {
      onVideoAnalysisRequest(selectedMatch, {
        startTime: customStartTime,
        endTime: customEndTime,
        description: '커스텀 구간'
      }, customDescription)
    }
  }

  const handleRoflDownload = async (match: MatchData) => {
    try {
      const response = await fetch('/api/download-rofl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId: match.matchId,
          region: region
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        alert(errorData.error || 'ROFL 파일 다운로드에 실패했습니다.')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${match.champion}_${match.matchId}.rofl`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      alert('ROFL 파일이 성공적으로 다운로드되었습니다!')
    } catch (error) {
      console.error('ROFL 다운로드 오류:', error)
      alert('ROFL 파일 다운로드 중 오류가 발생했습니다.')
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRangeDuration = () => {
    return customEndTime - customStartTime
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 border-2 border-lol-gold">
      <h3 className="text-2xl font-bold text-court-brown mb-6">
        🔍 전적에서 영상찾기
      </h3>

      {/* 검색 폼 */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🌍 서버
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="input-field"
            >
              {regions.map(region => (
                <option key={region.value} value={region.value}>
                  {region.flag} {region.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👤 소환사명
            </label>
                         <input
               type="text"
               value={summonerName}
               onChange={(e) => handleSummonerNameChange(e.target.value)}
               placeholder="소환사명"
               className="input-field"
               onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
             />
             {/* 태그라인 검색 결과 */}
             {isSearchingTags && (
               <div className="mt-1 text-xs text-gray-500">
                 🔍 태그라인 검색 중...
               </div>
             )}
             {availableTags.length > 0 && (
               <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                 <div className="text-xs text-blue-700 mb-1">🏷️ 사용 가능한 태그라인:</div>
                 <div className="flex flex-wrap gap-1">
                   {availableTags.map((tag, index) => (
                     <button
                       key={index}
                       onClick={() => setTagLine(tag)}
                       className={`px-2 py-1 text-xs rounded border ${
                         tagLine === tag 
                           ? 'bg-blue-500 text-white border-blue-500' 
                           : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-100'
                       }`}
                     >
                       {tag}
                     </button>
                   ))}
                 </div>
               </div>
             )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏷️ 태그라인
            </label>
            <input
              type="text"
              value={tagLine}
              onChange={(e) => setTagLine(e.target.value)}
              placeholder="KR1"
              className="input-field"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 검색
            </label>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="court-button w-full"
            >
              {isLoading ? '🔍 검색 중...' : '검색'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* 전적 목록 */}
      {matches.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800">
            📊 최근 게임 기록 ({matches.length}게임)
          </h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {matches.map((match, index) => (
              <div key={match.matchId} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${match.win ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-medium text-gray-800">{match.champion}</span>
                    <span className="text-sm text-gray-600">{match.gameMode}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">{formatDate(match.gameDate)}</div>
                    <div className="text-xs text-gray-500">{formatDuration(match.gameDuration)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm">
                      <span className="text-green-600 font-medium">{match.kills}</span>
                      /<span className="text-red-600 font-medium">{match.deaths}</span>
                      /<span className="text-blue-600 font-medium">{match.assists}</span>
                    </span>
                    <span className={`text-sm font-medium ${match.win ? 'text-green-600' : 'text-red-600'}`}>
                      {match.win ? '승리' : '패배'}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleVideoAnalysis(match, {
                        startTime: 0,
                        endTime: Math.min(60, match.gameDuration), // 최대 1분으로 제한
                        description: '게임 시작 구간'
                      })}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                    >
                      🎬 구간 선택
                    </button>
                    <button
                      onClick={() => handleRoflDownload(match)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                    >
                      📁 ROFL 다운로드
                    </button>
                  </div>
                </div>

                {/* 하이라이트 구간들 */}
                {match.highlights && match.highlights.length > 0 && (
                  <div className="border-t pt-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">🔥 주요 구간</h5>
                    <div className="space-y-2">
                      {match.highlights.map((highlight, hIndex) => (
                        <div key={hIndex} className="flex items-center justify-between bg-gray-50 rounded p-2">
                          <div className="flex-1">
                            <div className="text-sm text-gray-800">{highlight.description}</div>
                            <div className="text-xs text-gray-500">
                              {formatDuration(highlight.startTime)} ~ {formatDuration(highlight.endTime)}
                            </div>
                          </div>
                          <button
                            onClick={() => handleVideoAnalysis(match, highlight)}
                            className="px-2 py-1 bg-lol-gold text-white rounded text-xs hover:bg-yellow-600"
                          >
                            구간 선택
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 구간 선택 및 분석 설정 */}
      {selectedMatch && selectedHighlight && (
        <div className="mt-6 border-t pt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            🎯 분석 구간 설정
          </h4>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            {/* 선택된 게임 정보 */}
            <div className="flex items-center space-x-3">
              <span className="font-medium text-gray-800">{selectedMatch.champion}</span>
              <span className="text-sm text-gray-600">{selectedMatch.gameMode}</span>
              <span className={`text-sm font-medium ${selectedMatch.win ? 'text-green-600' : 'text-red-600'}`}>
                {selectedMatch.win ? '승리' : '패배'}
              </span>
            </div>

            {/* 구간 조정 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ⏰ 분석 구간 조정
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">시작 시간</label>
                  <input
                    type="range"
                    min="0"
                    max={selectedMatch.gameDuration}
                    value={customStartTime}
                    onChange={(e) => setCustomStartTime(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-600">{formatDuration(customStartTime)}</span>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">종료 시간</label>
                  <input
                    type="range"
                    min="0"
                    max={selectedMatch.gameDuration}
                    value={customEndTime}
                    onChange={(e) => setCustomEndTime(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-600">{formatDuration(customEndTime)}</span>
                </div>
              </div>
              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  분석 구간: {formatDuration(customStartTime)} ~ {formatDuration(customEndTime)} 
                  (총 {formatDuration(getRangeDuration())})
                </p>
              </div>
            </div>

            {/* 분석하고 싶은 상황 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 분석하고 싶은 상황을 자세히 설명해주세요 *
              </label>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lol-gold focus:border-transparent resize-none"
                rows={3}
                placeholder="예시: 이즈리얼과 세라핀 둘 중에 누구 잘못이 더 큰지 분석해주세요. 이즈리얼이 세라핀의 궁극기를 피하지 못해서 팀파이트에서 패배했습니다."
              />
              <p className="text-sm text-gray-600 mt-2">
                💡 분석하고 싶은 캐릭터 이름을 포함해서 설명해주세요.
              </p>
            </div>

            {/* 구간 경고 */}
            {getRangeDuration() > 60 && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  ⚠️ 분석 구간이 1분을 초과합니다. 비용 절약을 위해 더 짧은 구간을 선택하는 것을 권장합니다.
                </p>
              </div>
            )}

            {/* 분석 시작 버튼 */}
            <button
              onClick={handleCustomAnalysis}
              disabled={!customDescription.trim() || getRangeDuration() <= 0}
              className="court-button w-full text-lg py-4"
            >
              ⚖️ 영상 판결 받기
            </button>
          </div>
        </div>
      )}

      {/* 사용법 안내 */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>전적에서 영상찾기 사용법:</strong><br/>
          1. 서버와 소환사명을 입력하세요<br/>
          2. 최근 게임 기록을 확인하세요<br/>
          3. 분석하고 싶은 게임의 "구간 선택"을 클릭하세요<br/>
          4. 분석 구간을 조정하고 상황을 설명하세요<br/>
          5. AI가 선택한 구간을 분석하여 객관적인 판결을 내립니다<br/>
          <br/>
          📁 <strong>ROFL 파일 다운로드:</strong><br/>
          • 각 게임마다 "📁 ROFL 다운로드" 버튼을 클릭하면 리플레이 파일을 다운로드할 수 있습니다<br/>
          • 다운로드한 ROFL 파일은 "🎮 직접 영상 올리기" 탭에서 업로드하여 분석할 수 있습니다
        </p>
      </div>
    </div>
  )
}
