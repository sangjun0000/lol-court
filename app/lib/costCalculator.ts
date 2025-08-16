export interface CostBreakdown {
  apiCost: number
  platformFee: number
  totalCost: number
  currency: string
}

export interface AnalysisParams {
  duration: number // 분석 구간 길이 (초)
  fileType: 'video' | 'rofl'
  quality: 'standard' | 'high' | 'ultra'
}

export class CostCalculator {
  // API 비용 (OpenAI 기준)
  private static readonly API_COSTS = {
    gpt4: 0.03, // $0.03 per 1K tokens
    gpt4Vision: 0.01, // $0.01 per 1K tokens
    roflAnalysis: 0.02 // $0.02 per 1K tokens (ROFL 파일 분석)
  }

  // 플랫폼 수수료 (30%)
  private static readonly PLATFORM_FEE_RATE = 0.3

  // 초당 토큰 사용량 추정
  private static readonly TOKENS_PER_SECOND = {
    video: 50, // 영상 1초당 약 50 토큰
    rofl: 30   // ROFL 1초당 약 30 토큰
  }

  static calculateCost(params: AnalysisParams): CostBreakdown {
    const { duration, fileType, quality } = params

    // 품질별 비용 배수
    const qualityMultiplier = {
      standard: 1.0,
      high: 1.5,
      ultra: 2.0
    }[quality]

    // 파일 타입별 토큰 사용량
    const tokensPerSecond = this.TOKENS_PER_SECOND[fileType]
    const totalTokens = duration * tokensPerSecond * qualityMultiplier

    // API 비용 계산
    const apiCostPerToken = fileType === 'rofl' 
      ? this.API_COSTS.roflAnalysis 
      : this.API_COSTS.gpt4Vision

    const apiCost = (totalTokens / 1000) * apiCostPerToken

    // 플랫폼 수수료 계산
    const platformFee = apiCost * this.PLATFORM_FEE_RATE

    // 총 비용
    const totalCost = apiCost + platformFee

    return {
      apiCost: Math.round(apiCost * 100) / 100,
      platformFee: Math.round(platformFee * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      currency: 'USD'
    }
  }

  // 한국 원화로 변환 (대략적 환율)
  static convertToKRW(usdAmount: number): number {
    const exchangeRate = 1300 // 1 USD = 1300 KRW
    return Math.round(usdAmount * exchangeRate)
  }

  // 비용 안내 메시지 생성
  static generateCostMessage(cost: CostBreakdown, duration: number): string {
    const krwCost = this.convertToKRW(cost.totalCost)
    
    return `분석 구간: ${Math.floor(duration / 60)}분 ${duration % 60}초

💰 비용 내역:
• API 사용료: $${cost.apiCost} (₩${this.convertToKRW(cost.apiCost)})
• 플랫폼 수수료: $${cost.platformFee} (₩${this.convertToKRW(cost.platformFee)})
• 총 비용: $${cost.totalCost} (₩${krwCost})`
  }
}
