'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { CostBreakdown } from '@/app/lib/costCalculator'
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
  const [customDescription, setCustomDescription] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [calculatedCost, setCalculatedCost] = useState<CostBreakdown | null>(null)
  const [conversionProgress, setConversionProgress] = useState<number>(0)
  const [isConverting, setIsConverting] = useState<boolean>(false)

  // 파일 업로드 처리
  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0]
      if (error.code === 'file-too-large') {
        alert('파일이 너무 큽니다. 100MB 이하의 ROFL 파일을 업로드해주세요.')
        return
      }
    }
    
    const file = acceptedFiles[0]
    if (file && file.name.endsWith('.rofl')) {
      setVideoFile(file)
      await handleRoflFile(file)
    } else {
      alert('ROFL 파일만 업로드 가능합니다.')
    }
  }, [])

  // ROFL 파일 처리
  const handleRoflFile = async (file: File) => {
    try {
      setIsConverting(true)
      setConversionProgress(0)
      
      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          const remaining = 100 - prev
          const increment = Math.min(Math.random() * 10 + 3, remaining * 0.3)
          const newProgress = prev + increment
          return newProgress >= 99 ? 100 : newProgress
        })
      }, 150)
      
      const formData = new FormData()
      formData.append('roflFile', file)
      
      const response = await fetch('/api/analyze-rofl', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setConversionProgress(100)
          setIsConverting(false)
          clearInterval(progressInterval)
        }
      }
    } catch (error) {
      console.error('ROFL 분석 실패:', error)
      setIsConverting(false)
      setConversionProgress(0)
    }
  }

  // Dropzone 설정
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': ['.rofl']
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false)
  })

  // 비용 계산
  const getCurrentCost = () => {
    if (!videoFile) return null
    
    // ROFL 파일 크기에 비례한 비용 계산
    const fileSizeMB = videoFile.size / (1024 * 1024)
    const apiCost = fileSizeMB * 50 // 1MB당 50원으로 낮춤
    const platformFee = 100 // 최저 수수료 100원으로 낮춤
    const totalCost = apiCost + platformFee
    
    return {
      apiCost: Math.floor(apiCost),
      platformFee: Math.floor(platformFee),
      totalCost: Math.floor(totalCost),
      fileSizeMB: Math.round(fileSizeMB * 100) / 100,
      currency: 'KRW'
    }
  }

  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (videoFile && customDescription.trim()) {
      const cost = getCurrentCost()
      if (cost) {
        setCalculatedCost(cost)
        setShowPaymentModal(true)
      }
    }
  }

  // 결제 확인
  const handlePaymentConfirm = () => {
    if (videoFile && customDescription.trim() && calculatedCost) {
      const characterNames = extractCharacterNames(customDescription)
      
      onSubmit({
        videoFile,
        startTime: 0,
        endTime: 1200, // 전체 구간 (20분)
        targetCharacters: characterNames,
        analysisType: 'custom',
        customDescription
      })
      
      setShowPaymentModal(false)
      setCalculatedCost(null)
    }
  }

  // 캐릭터 이름 추출
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
    
    return champions.filter(champion => description.includes(champion))
  }

  // 유틸리티 함수들
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-lol-gold">
        <h3 className="text-3xl font-bold text-court-brown mb-8 text-center">
          📁 ROFL 파일 업로드 및 분석
        </h3>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 파일 업로드 영역 */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-4 text-center">
              📹 ROFL 파일 업로드 *
            </label>
            
            <div
              {...getRootProps()}
              className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 hover:shadow-lg ${
                isDragging 
                  ? 'border-lol-gold bg-gradient-to-br from-yellow-50 to-orange-50' 
                  : videoFile 
                    ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50' 
                    : 'border-gray-300 hover:border-lol-gold hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              
              {!videoFile ? (
                <div>
                  <div className="text-7xl mb-6">📁</div>
                  <p className="text-xl font-semibold text-gray-700 mb-3">
                    ROFL 파일을 여기에 드래그하거나 클릭하여 업로드
                  </p>
                  <p className="text-base text-gray-600 mb-2">
                    ROFL 파일만 업로드 가능 (최대 100MB)
                  </p>
                  <p className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg inline-block">
                    💡 ROFL 파일은 리그 오브 레전드 리플레이 파일입니다
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-7xl mb-6">✅</div>
                  <p className="text-xl font-semibold text-green-700 mb-3">
                    {videoFile.name}
                  </p>
                  <p className="text-base text-gray-600 mb-4">
                    {formatFileSize(videoFile.size)} • {videoFile.type}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setVideoFile(null)
                    }}
                    className="px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium"
                  >
                    다른 파일 선택
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ROFL 분석 진행률 */}
          {isConverting && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6">
              <h4 className="font-bold text-yellow-800 mb-4 text-center text-lg">🔄 ROFL 파일 분석 중...</h4>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${conversionProgress}%` }}
                ></div>
              </div>
              <p className="text-center font-semibold text-yellow-800">
                {Math.floor(conversionProgress)}% 완료
              </p>
            </div>
          )}

          {/* ROFL 파일 분석 결과 */}
          {videoFile?.name.endsWith('.rofl') && !isConverting && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6">
              <h4 className="font-bold text-blue-800 mb-4 text-center text-lg">📊 ROFL 파일 분석 완료</h4>
              <div className="text-base text-blue-700 space-y-2 mb-4">
                <p>• 게임 데이터 분석이 완료되었습니다</p>
                <p>• 전체 게임 구간이 분석 대상입니다</p>
                <p>• 아래에 분석하고 싶은 상황을 자세히 설명해주세요</p>
              </div>
              
              {getCurrentCost() && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-800 mb-2">
                      💰 예상 비용: ₩{getCurrentCost()?.totalCost}
                    </div>
                    <div className="text-sm text-blue-600 space-y-1">
                      <p>파일 크기: {getCurrentCost()?.fileSizeMB}MB</p>
                      <p>API 비용: ₩{getCurrentCost()?.apiCost} • 수수료: ₩{getCurrentCost()?.platformFee}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ROFL 파일 다운로드 방법 안내 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6">
            <h4 className="font-bold text-green-800 mb-4 text-center text-lg">📋 ROFL 파일 다운로드 방법</h4>
            <div className="text-base text-green-700 space-y-3">
              <div className="flex items-center space-x-3">
                <span className="bg-green-200 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                <p>리그 오브 레전드 클라이언트에 접속하세요</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="bg-green-200 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                <p>닉네임 옆의 초상화를 클릭하세요</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="bg-green-200 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                <p>대전기록 탭을 클릭하세요</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="bg-green-200 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                <p>분석을 원하는 게임을 선택하세요</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="bg-green-200 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</span>
                <p>"다운로드" 버튼을 클릭하여 ROFL 파일을 다운로드하세요</p>
              </div>
            </div>
          </div>

          {/* 분석 상황 설명 */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-4 text-center">
              📝 분석하고 싶은 상황을 자세히 설명해주세요 *
            </label>
            <textarea
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-lol-gold focus:border-transparent resize-none text-base"
              rows={5}
              placeholder="예시: 이즈리얼과 세라핀 둘 중에 누구 잘못이 더 큰지 분석해주세요. 이즈리얼이 세라핀의 궁극기를 피하지 못해서 팀파이트에서 패배했습니다."
            />
            <p className="text-base text-gray-600 mt-3 text-center">
              💡 분석하고 싶은 캐릭터 이름을 포함해서 설명해주세요. (예: 이즈리얼, 세라핀, 리신 등)
            </p>
          </div>

          {/* 결제 버튼 */}
          <button
            type="submit"
            disabled={isLoading || !videoFile || !customDescription.trim() || !getCurrentCost()}
            className="court-button w-full text-xl py-5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isLoading ? '🔍 분석 중...' : `💳 결제하기 (${getCurrentCost() ? `₩${getCurrentCost()?.totalCost}` : '비용 계산 중...'})`}
          </button>
        </form>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
          <p className="text-base text-blue-700 text-center leading-relaxed">
            💡 <strong>ROFL 파일 분석 사용법:</strong><br/>
            1. 롤 클라이언트에서 ROFL 파일을 다운로드하세요<br/>
            2. ROFL 파일을 드래그하거나 클릭하여 업로드하세요<br/>
            3. 분석하고 싶은 상황을 자세히 설명하세요 (캐릭터 이름 포함)<br/>
            4. AI가 게임 데이터를 분석하여 객관적인 판결을 내립니다
          </p>
        </div>

        {/* 결제 모달 */}
        {calculatedCost && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            onConfirm={handlePaymentConfirm}
            cost={calculatedCost}
            duration={1200}
            fileName={videoFile?.name || ''}
          />
        )}
      </div>
    </div>
  )
}
