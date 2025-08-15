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
  onVideoAnalysisRequest: (matchData: MatchData, highlight: { startTime: number, endTime: number, description: string }) => void
}

export default function MatchHistorySearch({ onVideoAnalysisRequest }: MatchHistorySearchProps) {
  const [summonerName, setSummonerName] = useState('')
  const [region, setRegion] = useState('kr')
  const [isLoading, setIsLoading] = useState(false)
  const [matches, setMatches] = useState<MatchData[]>([])
  const [error, setError] = useState('')

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

  const handleSearch = async () => {
    if (!summonerName.trim()) {
      setError('소환사명을 입력해주세요.')
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
          region: region
        }),
      })

      if (!response.ok) {
        throw new Error('전적 검색에 실패했습니다.')
      }

      const data = await response.json()
      setMatches(data.matches)
    } catch (error) {
      console.error('전적 검색 오류:', error)
      setError('전적을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVideoAnalysis = (match: MatchData, highlight: { startTime: number, endTime: number, description: string }) => {
    onVideoAnalysisRequest(match, highlight)
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

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 border-2 border-lol-gold">
      <h3 className="text-2xl font-bold text-court-brown mb-6">
        🔍 전적 검색
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👤 소환사명
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={summonerName}
                onChange={(e) => setSummonerName(e.target.value)}
                placeholder="소환사명을 입력하세요"
                className="input-field flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="court-button px-6"
              >
                {isLoading ? '🔍 검색 중...' : '검색'}
              </button>
            </div>
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
                        endTime: match.gameDuration,
                        description: '전체 게임'
                      })}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                    >
                      🎬 전체 분석
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
                            분석
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

      {/* 사용법 안내 */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>전적 검색 사용법:</strong><br/>
          1. 서버와 소환사명을 입력하세요<br/>
          2. 최근 게임 기록을 확인하세요<br/>
          3. 분석하고 싶은 게임의 "전체 분석" 또는 "주요 구간"을 클릭하세요<br/>
          4. 자동으로 영상 분석 요청이 생성됩니다
        </p>
      </div>
    </div>
  )
}
