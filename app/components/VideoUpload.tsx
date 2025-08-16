'use client'

import { useState, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { CostCalculator, CostBreakdown } from '@/app/lib/costCalculator'
import PaymentModal from './PaymentModal'

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
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [calculatedCost, setCalculatedCost] = useState<CostBreakdown | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && (file.type.startsWith('video/') || file.name.endsWith('.rofl'))) {
      setVideoFile(file)
      
             // rofl 파일인 경우 특별 처리
       if (file.name.endsWith('.rofl')) {
         // ROFL 파일도 구간 선택 가능하도록 처리
         setVideoUrl('rofl-file')
         // ROFL 파일의 경우 기본 게임 시간 설정 (20분 게임 기준)
         setVideoDuration(1200) // 20분 = 1200초
         setStartTime(0)
         setEndTime(60) // 기본적으로 처음 1분 분석
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
      // 영상이 로드되면 자동 재생 (약간의 지연 후)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(e => console.log('자동 재생 실패:', e))
        }
      }, 500)
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
      // 비용 계산
      const duration = getRangeDuration()
      const fileType = videoFile.name.endsWith('.rofl') ? 'rofl' : 'video'
      
      const cost = CostCalculator.calculateCost({
        duration,
        fileType,
        quality: 'standard'
      })
      
      setCalculatedCost(cost)
      setShowPaymentModal(true)
    }
  }

  const handlePaymentConfirm = () => {
    if (videoFile && customDescription.trim() && calculatedCost) {
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
      
      setShowPaymentModal(false)
      setCalculatedCost(null)
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

  // 실시간 비용 계산
  const getCurrentCost = () => {
    if (!videoFile || getRangeDuration() <= 0) return null
    
    const duration = getRangeDuration()
    const fileType = videoFile.name.endsWith('.rofl') ? 'rofl' : 'video'
    
    return CostCalculator.calculateCost({
      duration,
      fileType,
      quality: 'standard'
    })
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
                 <p className="text-sm font-medium text-gray-700 mb-2">📋 다음 단계:</p>
                 <ol className="text-sm text-gray-600 space-y-1">
                   <li>1. 아래에서 분석하고 싶은 게임 구간을 선택하세요</li>
                   <li>2. ROFL 파일에서 해당 구간의 게임 데이터를 추출합니다</li>
                   <li>3. AI가 선택한 구간을 분석하여 판결을 내립니다</li>
                 </ol>
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

                          {/* 영상/ROFL 미리보기 및 구간 선택 */}
         {videoUrl && (
           <div className="bg-gray-100 rounded-lg p-4">
             <h4 className="font-semibold text-gray-800 mb-2">
               {videoFile?.name.endsWith('.rofl') ? '🎮 ROFL 파일 구간 선택' : '🎥 영상 미리보기 및 구간 선택'}
             </h4>
             
             {videoFile?.name.endsWith('.rofl') ? (
               // ROFL 파일 구간 선택 UI
               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                 <div className="text-center">
                   <div className="text-4xl mb-2">🎮</div>
                   <p className="text-lg font-medium text-yellow-800 mb-2">
                     ROFL 파일: {videoFile.name}
                   </p>
                   <p className="text-sm text-yellow-700">
                     게임 시간을 기준으로 분석 구간을 선택하세요
                   </p>
                 </div>
               </div>
             ) : (
                               // 일반 영상 미리보기
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  autoPlay
                  muted
                  className="w-full rounded-lg mb-4"
                  onLoadedMetadata={handleVideoLoad}
                  onTimeUpdate={handleTimeUpdate}
                />
             )}
            
                                                                                                       {/* 구간 선택 안내 */}
               <div className="bg-blue-50 rounded-lg p-3 mb-4">
                 <p className="text-sm text-blue-700 font-medium mb-2">
                   🎯 분석 구간 선택 방법:
                 </p>
                 <ul className="text-sm text-blue-600 space-y-1">
                   {videoFile?.name.endsWith('.rofl') ? (
                     <>
                       <li>• 게임 시간을 기준으로 분석하고 싶은 구간을 선택하세요</li>
                       <li>• 아래 슬라이더로 시작과 종료 지점을 설정하세요</li>
                       <li>• 설정한 구간이 실시간으로 표시됩니다</li>
                     </>
                   ) : (
                     <>
                       <li>• 영상이 자동으로 재생됩니다 (음소거 상태)</li>
                       <li>• 아래 슬라이더로 시작과 종료 지점을 설정하세요</li>
                       <li>• 설정한 구간이 실시간으로 표시됩니다</li>
                     </>
                   )}
                 </ul>
               </div>

                          {/* 구간 정보 표시 */}
              <div className="bg-gradient-to-r from-green-50 to-red-50 rounded-lg p-4 border-2 border-gray-200 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">🎬 시작 시간</p>
                    <p className="text-xl font-bold text-green-600">{formatTime(startTime)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-red-200">
                    <p className="text-sm text-gray-600 mb-1">⏹️ 종료 시간</p>
                    <p className="text-xl font-bold text-red-600">{formatTime(endTime)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">📊 분석 구간</p>
                    <p className="text-xl font-bold text-blue-600">{formatTime(getRangeDuration())}</p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-600">
                    💡 현재 영상 시간: <span className="font-medium text-purple-600">
                      {videoRef.current ? formatTime(videoRef.current.currentTime) : '0:00'}
                    </span>
                  </p>
                </div>
              </div>

                                                                                                         {/* 구간 선택 바 */}
                <div className="bg-white rounded-lg p-4 border-2 border-gray-200 mb-4">
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">🎯 구간 선택 바</h5>
                    <p className="text-xs text-gray-600 mb-3">
                      아래 슬라이더로 시작과 종료 지점을 설정하세요
                    </p>
                  </div>
                  
                  {/* 시작 시간 슬라이더 */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-2">
                      🎬 시작 시간: {formatTime(startTime)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={videoDuration}
                      value={startTime}
                      onChange={(e) => {
                        const newStartTime = parseFloat(e.target.value)
                        setStartTime(newStartTime)
                        if (videoRef.current) {
                          videoRef.current.currentTime = newStartTime
                        }
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  
                  {/* 종료 시간 슬라이더 */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-2">
                      ⏹️ 종료 시간: {formatTime(endTime)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={videoDuration}
                      value={endTime}
                      onChange={(e) => {
                        const newEndTime = parseFloat(e.target.value)
                        setEndTime(newEndTime)
                        if (videoRef.current) {
                          videoRef.current.currentTime = newEndTime
                        }
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  
                  {/* 시간 표시 */}
                  <div className="flex justify-between text-xs text-gray-600 mb-4">
                    <span>0:00</span>
                    <span>{formatTime(videoDuration)}</span>
                  </div>
                  
                  {/* 빠른 설정 버튼 */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStartTime(0)
                        setEndTime(Math.min(30, videoDuration))
                        if (videoRef.current) {
                          videoRef.current.currentTime = 0
                        }
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                    >
                      처음 30초
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStartTime(0)
                        setEndTime(Math.min(60, videoDuration))
                        if (videoRef.current) {
                          videoRef.current.currentTime = 0
                        }
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                    >
                      처음 1분
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const midPoint = videoDuration / 2
                        setStartTime(Math.max(0, midPoint - 30))
                        setEndTime(Math.min(videoDuration, midPoint + 30))
                        if (videoRef.current) {
                          videoRef.current.currentTime = midPoint
                        }
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                    >
                      중간 1분
                    </button>
                  </div>
                </div>

                         {/* 실시간 비용 표시 */}
             {getCurrentCost() && (
               <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-200 mb-4">
                 <h5 className="text-lg font-bold text-green-800 mb-3 text-center">
                   💰 실시간 비용 계산
                 </h5>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-4">
                   <div className="bg-white rounded-lg p-3 border border-green-200">
                     <p className="text-sm text-gray-600 mb-1">API 사용료</p>
                     <p className="text-lg font-bold text-green-600">
                       ${getCurrentCost()?.apiCost} (₩{CostCalculator.convertToKRW(getCurrentCost()?.apiCost || 0)})
                     </p>
                   </div>
                   <div className="bg-white rounded-lg p-3 border border-blue-200">
                     <p className="text-sm text-gray-600 mb-1">플랫폼 수수료</p>
                     <p className="text-lg font-bold text-blue-600">
                       ${getCurrentCost()?.platformFee} (₩{CostCalculator.convertToKRW(getCurrentCost()?.platformFee || 0)})
                     </p>
                   </div>
                   <div className="bg-white rounded-lg p-3 border border-purple-200">
                     <p className="text-sm text-gray-600 mb-1">총 비용</p>
                     <p className="text-xl font-bold text-purple-600">
                       ${getCurrentCost()?.totalCost} (₩{CostCalculator.convertToKRW(getCurrentCost()?.totalCost || 0)})
                     </p>
                   </div>
                 </div>
                 <div className="text-center">
                   <p className="text-sm text-gray-600">
                     분석 구간: {formatTime(getRangeDuration())} • 
                     파일 타입: {videoFile?.name.endsWith('.rofl') ? 'ROFL' : '영상'}
                   </p>
                 </div>
               </div>
             )}

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

                                   {/* 결제 버튼 */}
          <button
            type="submit"
            disabled={isLoading || !videoFile || !customDescription.trim() || getRangeDuration() <= 0 || !getCurrentCost()}
            className="court-button w-full text-lg py-4"
          >
            {isLoading ? '🔍 분석 중...' : `💳 결제하기 (${getCurrentCost() ? `₩${CostCalculator.convertToKRW(getCurrentCost()?.totalCost || 0)}` : '비용 계산 중...'})`}
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

       {/* 결제 모달 */}
       {calculatedCost && (
         <PaymentModal
           isOpen={showPaymentModal}
           onClose={() => setShowPaymentModal(false)}
           onConfirm={handlePaymentConfirm}
           cost={calculatedCost}
           duration={getRangeDuration()}
           fileName={videoFile?.name || ''}
         />
       )}
     </div>
   )
 }
