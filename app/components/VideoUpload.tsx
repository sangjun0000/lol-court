'use client'

import { useState, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export interface VideoUploadData {
  videoFile: File
  startTime: number
  endTime: number
  targetCharacters: string[]
  analysisType: 'teamfight' | 'gank' | 'objective' | 'laning' | 'custom'
  customDescription?: string
}

interface VideoUploadProps {
  onSubmit: (data: VideoUploadData) => void
  isLoading: boolean
}

export default function VideoUpload({ onSubmit, isLoading }: VideoUploadProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [startTime, setStartTime] = useState<number>(0)
  const [endTime, setEndTime] = useState<number>(0)
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [targetCharacters, setTargetCharacters] = useState<string[]>([])
  const [analysisType, setAnalysisType] = useState<'teamfight' | 'gank' | 'objective' | 'laning' | 'custom'>('teamfight')
  const [customDescription, setCustomDescription] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const champions = [
    '리 신', '다리우스', '이즈리얼', '트런들', '야스오', '진', '카이사', '루시안', 
    '베인', '케이틀린', '애쉬', '징크스', '트리스타나', '드레이븐', '미스 포츈',
    '카직스', '렉사이', '엘리스', '누누', '람머스', '아무무', '피들스틱',
    '갱플랭크', '가렌', '나서스', '말파이트', '오른', '쉔', '케넨',
    '제라스', '오리아나', '아리', '카시오페아', '르블랑', '애니', '브랜드',
    '쓰레쉬', '레오나', '알리스타', '블리츠크랭크', '나미', '소나', '모르가나'
  ]

  const analysisTypes = [
    { value: 'teamfight', label: '팀파이트', description: '한타 상황에서의 판단' },
    { value: 'gank', label: '갱킹', description: '갱킹 상황에서의 판단' },
    { value: 'objective', label: '오브젝트', description: '드래곤/바론 상황에서의 판단' },
    { value: 'laning', label: '라인전', description: '라인전 상황에서의 판단' },
    { value: 'custom', label: '커스텀', description: '직접 상황 설명' }
  ]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file)
      const url = URL.createObjectURL(file)
      setVideoUrl(url)
    }
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm']
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false)
  })

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration)
      setEndTime(videoRef.current.duration)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setStartTime(videoRef.current.currentTime)
    }
  }

  const handleCharacterToggle = (character: string) => {
    setTargetCharacters(prev => 
      prev.includes(character) 
        ? prev.filter(c => c !== character)
        : [...prev, character]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (videoFile && targetCharacters.length > 0) {
      onSubmit({
        videoFile,
        startTime,
        endTime,
        targetCharacters,
        analysisType,
        customDescription: analysisType === 'custom' ? customDescription : undefined
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 border-2 border-lol-gold">
      <h3 className="text-2xl font-bold text-court-brown mb-6">
        🎬 영상 업로드 및 분석
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 영상 업로드 영역 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📹 롤 게임 영상 업로드 *
          </label>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging 
                ? 'border-lol-gold bg-yellow-50' 
                : videoFile 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            
            {!videoFile ? (
              <div>
                <div className="text-6xl mb-4">📁</div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  영상을 여기에 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-sm text-gray-500">
                  MP4, AVI, MOV, MKV, WebM 형식 지원 (최대 100MB)
                </p>
              </div>
            ) : (
              <div>
                <div className="text-6xl mb-4">✅</div>
                <p className="text-lg font-medium text-green-700 mb-2">
                  {videoFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(videoFile.size)} • {videoFile.type}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setVideoFile(null)
                    setVideoUrl('')
                    setVideoDuration(0)
                  }}
                  className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  다른 영상 선택
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 영상 미리보기 */}
        {videoUrl && (
          <div className="bg-gray-100 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">🎥 영상 미리보기</h4>
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full rounded-lg"
              onLoadedMetadata={handleVideoLoad}
              onTimeUpdate={handleTimeUpdate}
            />
            <p className="text-sm text-gray-600 mt-2">
              영상을 재생하여 분석하고 싶은 구간을 확인하세요
            </p>
          </div>
        )}

        {/* 분석 유형 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🎯 분석하고 싶은 상황 *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysisTypes.map(type => (
              <label key={type.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="analysisType"
                  value={type.value}
                  checked={analysisType === type.value}
                  onChange={(e) => setAnalysisType(e.target.value as any)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-800">{type.label}</div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 커스텀 설명 */}
        {analysisType === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 상황 설명
            </label>
            <textarea
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="분석하고 싶은 구체적인 상황을 설명해주세요..."
            />
          </div>
        )}

        {/* 시간 구간 선택 */}
        {videoDuration > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⏰ 분석 구간 선택 *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">시작 시간</label>
                <input
                  type="range"
                  min="0"
                  max={videoDuration}
                  value={startTime}
                  onChange={(e) => setStartTime(parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-600">{formatTime(startTime)}</span>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">종료 시간</label>
                <input
                  type="range"
                  min="0"
                  max={videoDuration}
                  value={endTime}
                  onChange={(e) => setEndTime(parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-600">{formatTime(endTime)}</span>
              </div>
            </div>
            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                분석 구간: {formatTime(startTime)} ~ {formatTime(endTime)} 
                (총 {formatTime(endTime - startTime)})
              </p>
            </div>
          </div>
        )}

        {/* 판결받을 캐릭터 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            👥 판결받을 캐릭터 선택 *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
            {champions.map(character => (
              <label key={character} className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={targetCharacters.includes(character)}
                  onChange={() => handleCharacterToggle(character)}
                  className="mr-2"
                />
                <span className="text-sm">{character}</span>
              </label>
            ))}
          </div>
          {targetCharacters.length > 0 && (
            <div className="mt-2 p-2 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                선택된 캐릭터: {targetCharacters.join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* 빠른 선택 버튼들 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ⚡ 빠른 선택
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTargetCharacters(['리 신', '다리우스', '이즈리얼', '트런들', '야스오'])}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
            >
              아군 전체
            </button>
            <button
              type="button"
              onClick={() => setTargetCharacters(['리 신'])}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200"
            >
              정글러만
            </button>
            <button
              type="button"
              onClick={() => setTargetCharacters(['다리우스'])}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200"
            >
              탑 라이너만
            </button>
            <button
              type="button"
              onClick={() => setTargetCharacters([])}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
            >
              선택 해제
            </button>
          </div>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isLoading || !videoFile || targetCharacters.length === 0}
          className="court-button w-full text-lg py-4"
        >
          {isLoading ? '🔍 영상 분석 중...' : '⚖️ 영상 판결 받기'}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>영상 업로드 사용법:</strong><br/>
          1. 롤 게임 영상을 드래그하거나 클릭하여 업로드하세요<br/>
          2. 분석하고 싶은 상황 유형을 선택하세요<br/>
          3. 영상에서 분석 구간을 설정하세요<br/>
          4. 판결받을 캐릭터들을 선택하세요<br/>
          5. AI가 영상을 분석하여 객관적인 판결을 내립니다
        </p>
      </div>
    </div>
  )
}
