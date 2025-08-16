'use client'

import { useState, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export interface VideoUploadData {
  videoFile: File
  startTime: number
  endTime: number
  targetCharacters: string[]
  analysisType: 'custom'
  customDescription: string
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
  const [customDescription, setCustomDescription] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [isSelectingRange, setIsSelectingRange] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && (file.type.startsWith('video/') || file.name.endsWith('.rofl'))) {
      setVideoFile(file)
      
             // rofl 파일인 경우 특별 처리
       if (file.name.endsWith('.rofl')) {
         // ROFL 파일은 바로 분석 가능
         setVideoUrl('')
         return
       }
      
      const url = URL.createObjectURL(file)
      setVideoUrl(url)
      // 영상 로드 후 기본 구간 설정 (처음 30초)
      setTimeout(() => {
        if (videoRef.current && videoRef.current.duration > 30) {
          setEndTime(30)
        }
      }, 1000)
    }
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm'],
      'application/octet-stream': ['.rofl']
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024, // 500MB (rofl 파일이 클 수 있음)
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false)
  })

  const handleVideoLoad = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration
      setVideoDuration(duration)
      // 기본적으로 처음 30초 또는 전체 영상 중 짧은 것
      setEndTime(Math.min(30, duration))
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current && isSelectingRange) {
      setEndTime(videoRef.current.currentTime)
    }
  }

  const handleRangeSelectionStart = () => {
    if (videoRef.current) {
      setStartTime(videoRef.current.currentTime)
      setIsSelectingRange(true)
    }
  }

  const handleRangeSelectionEnd = () => {
    setIsSelectingRange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (videoFile && customDescription.trim()) {
      // 사용자 설명에서 캐릭터 이름 추출
      const characterNames = extractCharacterNames(customDescription)
      
      onSubmit({
        videoFile,
        startTime,
        endTime,
        targetCharacters: characterNames,
        analysisType: 'custom',
        customDescription
      })
    }
  }

  // 사용자 설명에서 캐릭터 이름 추출하는 함수
  const extractCharacterNames = (description: string): string[] => {
    const champions = [
      '리 신', '다리우스', '이즈리얼', '트런들', '야스오', '진', '카이사', '루시안', 
      '베인', '케이틀린', '애쉬', '징크스', '트리스타나', '드레이븐', '미스 포츈',
      '카직스', '렉사이', '엘리스', '누누', '람머스', '아무무', '피들스틱',
      '갱플랭크', '가렌', '나서스', '말파이트', '오른', '쉔', '케넨',
      '제라스', '오리아나', '아리', '카시오페아', '르블랑', '애니', '브랜드',
      '쓰레쉬', '레오나', '알리스타', '블리츠크랭크', '나미', '소나', '모르가나',
      '세라핀', '소라카', '룰루', '자이라', '카르마', '잔나', '타릭'
    ]
    
    const foundCharacters = champions.filter(champion => 
      description.includes(champion)
    )
    
    return foundCharacters
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

  const getRangeDuration = () => {
    return endTime - startTime
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
                  MP4, AVI, MOV, MKV, WebM, ROFL 형식 지원 (최대 500MB)
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  💡 ROFL 파일은 리그 오브 레전드 리플레이 파일입니다
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
                    setStartTime(0)
                    setEndTime(0)
                  }}
                  className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  다른 영상 선택
                </button>
              </div>
            )}
          </div>
        </div>

                 {/* ROFL 파일 안내 */}
         {videoFile && videoFile.name.endsWith('.rofl') && (
           <div className="bg-green-50 border border-green-200 rounded-lg p-4">
             <h4 className="font-semibold text-green-800 mb-2">🎮 ROFL 파일 업로드됨</h4>
             <div className="space-y-3">
               <p className="text-sm text-green-700">
                 <strong>ROFL 파일</strong>이 성공적으로 업로드되었습니다!
               </p>
               <div className="bg-white rounded-lg p-3">
                 <p className="text-sm font-medium text-gray-700 mb-2">✨ 자동 분석 기능:</p>
                 <ul className="text-sm text-gray-600 space-y-1">
                   <li>• ROFL 파일에서 게임 이벤트를 자동으로 추출합니다</li>
                   <li>• 구간 선택 없이 전체 게임을 분석합니다</li>
                   <li>• AI가 게임 데이터를 기반으로 판결을 내립니다</li>
                   <li>• 영상 녹화 없이 바로 분석 가능합니다</li>
                 </ul>
               </div>
               <div className="bg-blue-50 rounded-lg p-3">
                 <p className="text-sm font-medium text-blue-700 mb-1">💡 장점:</p>
                 <p className="text-sm text-blue-600">
                   ROFL 파일은 게임의 모든 데이터를 포함하므로 더 정확한 분석이 가능합니다.
                 </p>
               </div>
             </div>
           </div>
         )}

        {/* 영상 미리보기 및 구간 선택 */}
        {videoUrl && (
          <div className="bg-gray-100 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">🎥 영상 미리보기 및 구간 선택</h4>
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full rounded-lg mb-4"
              onLoadedMetadata={handleVideoLoad}
              onTimeUpdate={handleTimeUpdate}
            />
            
            {/* 구간 선택 안내 */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-700 font-medium mb-2">
                🎯 분석 구간 선택 방법:
              </p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• 영상을 재생하여 분석하고 싶은 구간을 찾으세요</li>
                <li>• 시작 지점에서 "구간 시작" 버튼을 클릭하세요</li>
                <li>• 종료 지점에서 "구간 종료" 버튼을 클릭하세요</li>
                <li>• 또는 아래 슬라이더로 직접 조정할 수 있습니다</li>
              </ul>
            </div>

            {/* 구간 선택 버튼 */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={handleRangeSelectionStart}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                🎬 구간 시작
              </button>
              <button
                type="button"
                onClick={handleRangeSelectionEnd}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                ⏹️ 구간 종료
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartTime(0)
                  setEndTime(Math.min(30, videoDuration))
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                🔄 처음 30초
              </button>
            </div>

            {/* 구간 정보 표시 */}
            <div className="bg-white rounded-lg p-3 border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">시작 시간</p>
                  <p className="text-lg font-bold text-green-600">{formatTime(startTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">종료 시간</p>
                  <p className="text-lg font-bold text-red-600">{formatTime(endTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">분석 구간</p>
                  <p className="text-lg font-bold text-blue-600">{formatTime(getRangeDuration())}</p>
                </div>
              </div>
            </div>

            {/* 슬라이더로 세밀 조정 */}
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">시작 시간 조정</label>
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
                <label className="block text-sm text-gray-600 mb-1">종료 시간 조정</label>
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

            {/* 구간 경고 */}
            {getRangeDuration() > 60 && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  ⚠️ 분석 구간이 1분을 초과합니다. 비용 절약을 위해 더 짧은 구간을 선택하는 것을 권장합니다.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 분석하고 싶은 상황 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📝 분석하고 싶은 상황을 자세히 설명해주세요 *
          </label>
          <textarea
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lol-gold focus:border-transparent resize-none"
            rows={4}
            placeholder="예시: 이즈리얼과 세라핀 둘 중에 누구 잘못이 더 큰지 분석해주세요. 이즈리얼이 세라핀의 궁극기를 피하지 못해서 팀파이트에서 패배했습니다."
          />
          <p className="text-sm text-gray-600 mt-2">
            💡 분석하고 싶은 캐릭터 이름을 포함해서 설명해주세요. (예: 이즈리얼, 세라핀, 리신 등)
          </p>
        </div>

                 {/* 제출 버튼 */}
         <button
           type="submit"
           disabled={isLoading || !videoFile || !customDescription.trim() || (!videoFile.name.endsWith('.rofl') && getRangeDuration() <= 0)}
           className="court-button w-full text-lg py-4"
         >
           {isLoading ? '🔍 분석 중...' : videoFile?.name.endsWith('.rofl') ? '⚖️ ROFL 파일 판결 받기' : '⚖️ 영상 판결 받기'}
         </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>영상 업로드 사용법:</strong><br/>
          1. 롤 게임 영상을 드래그하거나 클릭하여 업로드하세요<br/>
          2. 영상에서 분석하고 싶은 구간을 선택하세요 (비용 절약을 위해 짧게)<br/>
          3. 분석하고 싶은 상황을 자세히 설명하세요 (캐릭터 이름 포함)<br/>
          4. AI가 선택한 구간을 분석하여 객관적인 판결을 내립니다
        </p>
      </div>
    </div>
  )
}
