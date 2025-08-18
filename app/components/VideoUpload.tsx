'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface VideoUploadProps {
  onAnalysisComplete: (gameData: any, description: string) => void
}

export default function VideoUpload({ onAnalysisComplete }: VideoUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [caseDescription, setCaseDescription] = useState('')

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (!file.name.endsWith('.rofl')) {
      alert('ROFL 파일만 업로드 가능합니다.')
      return
    }

    setUploadedFile(file)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': ['.rofl']
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024 // 100MB
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadedFile || !caseDescription.trim()) return

    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append('roflFile', uploadedFile)

      const response = await fetch('/api/analyze-rofl', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('ROFL 파일 분석 중 오류가 발생했습니다.')
      }

      const data = await response.json()
      onAnalysisComplete(data.gameData, caseDescription)

    } catch (error) {
      console.error('분석 오류:', error)
      alert('ROFL 파일 분석 중 오류가 발생했습니다.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        ROFL 파일 업로드 및 법원 심리
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 파일 업로드 영역 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            증거 자료 (ROFL 파일) 업로드 *
          </label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="text-6xl">📁</div>
              <p className="text-lg text-gray-600">
                {isDragActive ? '파일을 여기에 놓으세요' : 'ROFL 파일을 드래그하거나 클릭하여 업로드하세요'}
              </p>
              <p className="text-sm text-gray-500">
                최대 파일 크기: 100MB
              </p>
            </div>
          </div>
        </div>

        {/* 업로드 완료 메시지 */}
        {uploadedFile && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">
              증거 자료 심사 완료
            </h4>
            <p className="text-green-700">
              {uploadedFile.name} 파일이 성공적으로 업로드되었습니다.
            </p>
            <p className="text-sm text-green-600 mt-2">
              이제 소송 사유를 입력하고 법원 판결을 받으실 수 있습니다.
            </p>
          </div>
        )}

        {/* 상황 설명 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            소송 사유 진술 *
          </label>
          <textarea
            value={caseDescription}
            onChange={(e) => setCaseDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            placeholder="예시: 이즈리얼과 세라핀 중 누구의 잘못이 더 큰지 판결해주세요. 이즈리얼이 세라핀의 궁극기를 피하지 못해서 팀파이트에서 패배했습니다."
            required
          />
          <p className="text-sm text-gray-600 mt-2">
            💡 소송 관련자(캐릭터) 이름을 포함해서 진술해주세요. (예: 이즈리얼, 세라핀, 리신 등)
          </p>
        </div>

        {/* 판결 시작 버튼 */}
        <button
          type="submit"
          disabled={isAnalyzing || !uploadedFile || !caseDescription.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? '⚖️ 판결 심의 중...' : '⚖️ 법원 판결 시작'}
        </button>
      </form>

      {/* 사용법 안내 */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          롤법원 사용법
        </h4>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>증거 자료 (ROFL 파일) 업로드</li>
          <li>소송 사유 진술 작성</li>
          <li>AI 판사가 게임 데이터를 심사하여 공정한 판결을 내립니다</li>
        </ol>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>무료 법원:</strong> 광고 수익으로 운영되는 무료 AI 법원 서비스입니다.
          </p>
        </div>
      </div>
    </div>
  )
}
