'use client'

import { HeaderAd } from './AdBanner'

export default function Header() {
  return (
    <div className="text-center mb-8">
      <HeaderAd />
      
      <h1 className="text-5xl font-bold text-lol-gold mb-2">
        ⚖️ 롤법원 <span className="text-sm text-red-500 font-bold">v47</span>
      </h1>
      
      <p className="text-lg text-gray-700 mb-4">
        AI 판사가 ROFL 파일을 분석하여 공정한 판결을 내립니다
      </p>
      
      <div className="flex justify-center space-x-4 text-sm text-gray-600">
        <span>🎮 ROFL 파일 분석</span>
        <span>•</span>
        <span>🤖 AI 판사</span>
        <span>•</span>
        <span>⚖️ 공정한 판결</span>
      </div>
    </div>
  )
}
