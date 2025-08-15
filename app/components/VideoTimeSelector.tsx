'use client'

import { useState, useRef } from 'react'

interface VideoTimeSelectorProps {
  videoFile: File
  onTimeRangeSelect: (startTime: number, endTime: number) => void
  onFullVideoSelect: () => void
}

export default function VideoTimeSelector({ 
  videoFile, 
  onTimeRangeSelect, 
  onFullVideoSelect 
}: VideoTimeSelectorProps) {
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [duration, setDuration] = useState<number>(0)
  const [startTime, setStartTime] = useState<number>(0)
  const [endTime, setEndTime] = useState<number>(0)
  const [isSelecting, setIsSelecting] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // 영상 로드
  useState(() => {
    const url = URL.createObjectURL(videoFile)
    setVideoUrl(url)
    
    const video = document.createElement('video')
    video.onloadedmetadata = () => {
      setDuration(video.duration)
      setEndTime(video.duration)
    }
    video.src = url
  })

  const handleTimeRangeSelect = () => {
    if (startTime < endTime) {
      onTimeRangeSelect(startTime, endTime)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSliderChange = (type: 'start' | 'end', value: number) => {
    if (type === 'start') {
      setStartTime(value)
      if (videoRef.current) {
        videoRef.current.currentTime = value
      }
    } else {
      setEndTime(value)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 border-2 border-lol-blue">
      <h3 className="text-2xl font-bold text-court-brown mb-4">
        🎬 영상 구간 선택
      </h3>

      <div className="space-y-4">
        {/* 영상 미리보기 */}
        <div className="relative">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full rounded-lg"
            style={{ maxHeight: '300px' }}
            controls
          />
          
          {/* 구간 선택 오버레이 */}
          {isSelecting && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-center mb-2">
                  구간 선택 모드: {formatTime(startTime)} - {formatTime(endTime)}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsSelecting(false)}
                    className="court-button bg-gray-500"
                  >
                    완료
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 시간 슬라이더 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시작 시간: {formatTime(startTime)}
            </label>
            <input
              type="range"
              min="0"
              max={duration}
              value={startTime}
              onChange={(e) => handleSliderChange('start', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              종료 시간: {formatTime(endTime)}
            </label>
            <input
              type="range"
              min="0"
              max={duration}
              value={endTime}
              onChange={(e) => handleSliderChange('end', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* 선택된 구간 정보 */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">
            📊 선택된 구간 정보
          </h4>
          <div className="space-y-1 text-sm text-blue-700">
            <p>시작: {formatTime(startTime)}</p>
            <p>종료: {formatTime(endTime)}</p>
            <p>길이: {formatTime(endTime - startTime)}</p>
            <p>예상 비용: ${((endTime - startTime) / 5 * 0.01).toFixed(2)}</p>
          </div>
        </div>

        {/* 분석 옵션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleTimeRangeSelect}
            disabled={startTime >= endTime}
            className="court-button bg-lol-blue hover:bg-blue-600 disabled:bg-gray-400"
          >
            🎯 선택 구간 분석
          </button>

          <button
            onClick={onFullVideoSelect}
            className="court-button bg-court-brown hover:bg-brown-600"
          >
            📹 전체 영상 분석
          </button>
        </div>

        {/* 분석 팁 */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">
            💡 분석 팁
          </h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 갈등이 발생한 구간만 선택하면 비용을 절약할 수 있습니다</li>
            <li>• 1-2분 구간을 선택하면 더 정확한 분석이 가능합니다</li>
            <li>• 전체 영상 분석은 비용이 많이 들 수 있습니다</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
