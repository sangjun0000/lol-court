'use client'

import { useState } from 'react'

interface DetailedCaseFormProps {
  onSubmit: (caseData: DetailedCaseData) => void
  isLoading: boolean
}

export interface DetailedCaseData {
  basicDescription: string
  gameTime: number
  champions: {
    player1: string
    player2: string
  }
  spells: {
    player1: string[]
    player2: string[]
  }
  levels: {
    player1: number
    player2: number
  }
  health: {
    player1: number
    player2: number
  }
  items: {
    player1: string[]
    player2: string[]
  }
  laneState: string
  vision: {
    hasWard: boolean
    wardLocation?: string
  }
  objectives: {
    dragon: boolean
    baron: boolean
    towers: string[]
  }
  teamComposition: string[]
}

export default function DetailedCaseForm({ onSubmit, isLoading }: DetailedCaseFormProps) {
  const [formData, setFormData] = useState<DetailedCaseData>({
    basicDescription: '',
    gameTime: 300,
    champions: { player1: '', player2: '' },
    spells: { player1: [], player2: [] },
    levels: { player1: 1, player2: 1 },
    health: { player1: 100, player2: 100 },
    items: { player1: [], player2: [] },
    laneState: 'even',
    vision: { hasWard: false },
    objectives: { dragon: false, baron: false, towers: [] },
    teamComposition: []
  })

  const champions = [
    '리 신', '다리우스', '이즈리얼', '트런들', '야스오', '진', '카이사', '루시안', 
    '베인', '케이틀린', '애쉬', '징크스', '트리스타나', '드레이븐', '미스 포츈',
    '카직스', '렉사이', '엘리스', '누누', '람머스', '아무무', '피들스틱',
    '갱플랭크', '가렌', '나서스', '말파이트', '오른', '쉔', '케넨',
    '제라스', '오리아나', '아리', '카시오페아', '르블랑', '애니', '브랜드',
    '쓰레쉬', '레오나', '알리스타', '블리츠크랭크', '나미', '소나', '모르가나'
  ]

  const spells = ['플래시', '텔레포트', '힐', '클린즈', '점화', '유체화', '회복', '탈진']
  const items = ['도란의 검', '도란의 반지', '도란의 방패', '롱소드', '증폭의 고서', '체력 물약']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const updateFormData = (field: keyof DetailedCaseData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateNestedField = (parent: keyof DetailedCaseData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...(prev[parent] as any), [field]: value }
    }))
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 border-2 border-lol-gold">
      <h3 className="text-2xl font-bold text-court-brown mb-6">
        ⚖️ 상세한 롤 판사 신청서
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 상황 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📝 기본 상황 설명 *
          </label>
          <textarea
            value={formData.basicDescription}
            onChange={(e) => updateFormData('basicDescription', e.target.value)}
            className="input-field"
            rows={4}
            placeholder="예: 리 신이 탑 라인에 갱을 왔는데 다리우스가 도망가서 갱이 실패했습니다..."
            required
          />
        </div>

        {/* 게임 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ⏰ 게임 시간 (분)
          </label>
          <input
            type="number"
            value={Math.floor(formData.gameTime / 60)}
            onChange={(e) => updateFormData('gameTime', parseInt(e.target.value) * 60)}
            className="input-field"
            min="0"
            max="60"
          />
        </div>

        {/* 챔피언 선택 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎯 플레이어 1 챔피언
            </label>
            <select
              value={formData.champions.player1}
              onChange={(e) => updateNestedField('champions', 'player1', e.target.value)}
              className="input-field"
            >
              <option value="">선택하세요</option>
              {champions.map(champ => (
                <option key={champ} value={champ}>{champ}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎯 플레이어 2 챔피언
            </label>
            <select
              value={formData.champions.player2}
              onChange={(e) => updateNestedField('champions', 'player2', e.target.value)}
              className="input-field"
            >
              <option value="">선택하세요</option>
              {champions.map(champ => (
                <option key={champ} value={champ}>{champ}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 레벨과 체력 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📊 플레이어 1 레벨
            </label>
            <input
              type="number"
              value={formData.levels.player1}
              onChange={(e) => updateNestedField('levels', 'player1', parseInt(e.target.value))}
              className="input-field"
              min="1"
              max="18"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ❤️ 플레이어 1 체력 (%)
            </label>
            <input
              type="number"
              value={formData.health.player1}
              onChange={(e) => updateNestedField('health', 'player1', parseInt(e.target.value))}
              className="input-field"
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📊 플레이어 2 레벨
            </label>
            <input
              type="number"
              value={formData.levels.player2}
              onChange={(e) => updateNestedField('levels', 'player2', parseInt(e.target.value))}
              className="input-field"
              min="1"
              max="18"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ❤️ 플레이어 2 체력 (%)
            </label>
            <input
              type="number"
              value={formData.health.player2}
              onChange={(e) => updateNestedField('health', 'player2', parseInt(e.target.value))}
              className="input-field"
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* 스펠 선택 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⚡ 플레이어 1 스펠
            </label>
            <div className="space-y-2">
              {spells.map(spell => (
                <label key={spell} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.spells.player1.includes(spell)}
                    onChange={(e) => {
                      const current = formData.spells.player1
                      const updated = e.target.checked
                        ? [...current, spell]
                        : current.filter(s => s !== spell)
                      updateNestedField('spells', 'player1', updated)
                    }}
                    className="mr-2"
                  />
                  {spell}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⚡ 플레이어 2 스펠
            </label>
            <div className="space-y-2">
              {spells.map(spell => (
                <label key={spell} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.spells.player2.includes(spell)}
                    onChange={(e) => {
                      const current = formData.spells.player2
                      const updated = e.target.checked
                        ? [...current, spell]
                        : current.filter(s => s !== spell)
                      updateNestedField('spells', 'player2', updated)
                    }}
                    className="mr-2"
                  />
                  {spell}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 라인 상태 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🛣️ 라인 상태
          </label>
          <select
            value={formData.laneState}
            onChange={(e) => updateFormData('laneState', e.target.value)}
            className="input-field"
          >
            <option value="even">균등</option>
            <option value="pushed">푸시됨</option>
            <option value="frozen">프리즈됨</option>
            <option value="under_tower">타워 아래</option>
          </select>
        </div>

        {/* 시야 상태 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            👁️ 시야 상태
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.vision.hasWard}
                onChange={(e) => updateNestedField('vision', 'hasWard', e.target.checked)}
                className="mr-2"
              />
              와드가 있음
            </label>
            {formData.vision.hasWard && (
              <input
                type="text"
                placeholder="와드 위치 (예: 강가, 부쉬)"
                className="input-field"
                value={formData.vision.wardLocation || ''}
                onChange={(e) => updateNestedField('vision', 'wardLocation', e.target.value)}
              />
            )}
          </div>
        </div>

        {/* 오브젝티브 상태 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🏆 오브젝티브 상태
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.objectives.dragon}
                onChange={(e) => updateNestedField('objectives', 'dragon', e.target.checked)}
                className="mr-2"
              />
              드래곤 스폰됨
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.objectives.baron}
                onChange={(e) => updateNestedField('objectives', 'baron', e.target.checked)}
                className="mr-2"
              />
              바론 스폰됨
            </label>
          </div>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isLoading || !formData.basicDescription}
          className="court-button w-full text-lg py-4"
        >
          {isLoading ? '🔍 판사가 분석 중...' : '⚖️ 정교한 판결 받기'}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>정교한 판결을 위해:</strong> 가능한 한 많은 정보를 입력해주세요. 
          스펠, 레벨, 체력, 시야 상태 등이 판결에 중요한 영향을 미칩니다.
        </p>
      </div>
    </div>
  )
}
