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
    const apiCost = fileSizeMB * 100 // 1MB당 100원
    const platformFee = 500 // 고정 수수료 500원
    const totalCost = apiCost + platformFee
    
    return {
      apiCost,
      platformFee,
      totalCost,
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
    <div className="bg-white rounded-xl shadow-2xl p-6 border-2 border-lol-gold">
      <h3 className="text-2xl font-bold text-court-brown mb-6">
        📁 ROFL 파일 업로드 및 분석
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 파일 업로드 영역 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📹 ROFL 파일 업로드 *
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
                  ROFL 파일을 여기에 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-sm text-gray-500">
                  ROFL 파일만 업로드 가능 (최대 100MB)
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
                  }}
                  className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  다른 파일 선택
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ROFL 분석 진행률 */}
        {isConverting && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">🔄 ROFL 파일 분석 중...</h4>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-yellow-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${conversionProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-yellow-700 mt-2">
              {conversionProgress.toFixed(1)}% 완료
            </p>
          </div>
        )}

        {/* ROFL 파일 분석 결과 */}
        {videoFile?.name.endsWith('.rofl') && !isConverting && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">📊 ROFL 파일 분석 완료</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• 게임 데이터 분석이 완료되었습니다</p>
              <p>• 전체 게임 구간이 분석 대상입니다</p>
              <p>• 아래에 분석하고 싶은 상황을 자세히 설명해주세요</p>
            </div>
            
            {getCurrentCost() && (
              <div className="mt-3 bg-blue-100 rounded-lg p-3">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-800">
                    💰 예상 비용: ₩{getCurrentCost()?.totalCost}
                  </div>
                  <div className="text-sm text-blue-600">
                    파일 크기: {getCurrentCost()?.fileSizeMB}MB • API 비용: ₩{getCurrentCost()?.apiCost} • 수수료: ₩{getCurrentCost()?.platformFee}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ROFL 파일 다운로드 방법 안내 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">📋 ROFL 파일 다운로드 방법</h4>
          <div className="text-sm text-green-700 space-y-2">
            <p>1. 리그 오브 레전드 클라이언트에 접속하세요</p>
            <p>2. 닉네임 옆의 초상화를 클릭하세요</p>
            <p>3. 대전기록 탭을 클릭하세요</p>
            <p>4. 분석을 원하는 게임을 선택하세요</p>
            <p>5. "다운로드" 버튼을 클릭하여 ROFL 파일을 다운로드하세요</p>
          </div>
        </div>

        {/* 분석 상황 설명 */}
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
          disabled={isLoading || !videoFile || !customDescription.trim() || !getCurrentCost()}
          className="court-button w-full text-lg py-4"
        >
          {isLoading ? '🔍 분석 중...' : `💳 결제하기 (${getCurrentCost() ? `₩${getCurrentCost()?.totalCost}` : '비용 계산 중...'})`}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
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
  )
}
