'use client'

import { useState } from 'react'
import { CostBreakdown } from '@/app/lib/costCalculator'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  cost: CostBreakdown
  duration: number
  fileName: string
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  cost, 
  duration, 
  fileName 
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'kakao' | 'naver'>('card')

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      // 실제 결제 처리 로직 (Stripe, 토스페이먼츠 등)
      await processPayment(cost, paymentMethod)
      onConfirm()
    } catch (error) {
      console.error('결제 오류:', error)
      alert('결제 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsProcessing(false)
    }
  }

  const processPayment = async (cost: CostBreakdown, method: string) => {
    // 실제 결제 API 호출
    const response = await fetch('/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: cost.totalCost,
        currency: cost.currency,
        paymentMethod: method,
        fileName,
        duration
      })
    })

    if (!response.ok) {
      throw new Error('결제 처리 실패')
    }

    return response.json()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          💳 결제 확인
        </h3>

        {/* 파일 정보 */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-600">파일: {fileName}</p>
          <p className="text-sm text-gray-600">
            분석 구간: {Math.floor(duration / 60)}분 {duration % 60}초
          </p>
        </div>

        {/* 비용 내역 */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">💰 비용 내역</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>API 사용료:</span>
              <span>${cost.apiCost}</span>
            </div>
            <div className="flex justify-between">
              <span>플랫폼 수수료:</span>
              <span>${cost.platformFee}</span>
            </div>
            <div className="border-t pt-1 mt-2">
              <div className="flex justify-between font-bold">
                <span>총 비용:</span>
                <span className="text-lg">${cost.totalCost}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 결제 방법 선택 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            결제 방법 선택
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="mr-2"
              />
              <span>💳 신용카드</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="kakao"
                checked={paymentMethod === 'kakao'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="mr-2"
              />
              <span>💛 카카오페이</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="naver"
                checked={paymentMethod === 'naver'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="mr-2"
              />
              <span>💚 네이버페이</span>
            </label>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-lol-gold text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
          >
            {isProcessing ? '결제 중...' : '결제하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
