export default function Header() {
  return (
    <header className="text-center py-8">
      <div className="mb-4">
        <h1 className="text-5xl font-bold text-lol-gold mb-2">
          ⚖️ 롤법원 <span className="text-sm text-red-500 font-bold">v19</span>
        </h1>
        <p className="text-xl text-white opacity-90">
          AI 기반 롤문철 - 공정한 판결을 위한 최고의 법원
        </p>
      </div>
      
      <div className="bg-black bg-opacity-50 rounded-lg p-4 max-w-2xl mx-auto">
        <p className="text-gray-300 text-sm leading-relaxed">
          리그 오브 레전드 게임 중 발생한 분쟁을 AI가 공정하게 판결합니다. 
          게임 상황을 자세히 설명해주시면, AI 판사가 객관적인 분석과 함께 
          최종 판결을 내려드립니다.
        </p>
      </div>
    </header>
  )
}
