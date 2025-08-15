import OpenAI from 'openai'

export interface VideoAnalysisConfig {
  frameInterval: number // 몇 초마다 프레임 추출할지 (기본: 5초)
  keyMoments: string[] // 분석할 키 모먼트들
  maxFrames: number // 최대 프레임 수 (비용 절약)
}

export interface GameMoment {
  timestamp: number // 영상 내 시간 (초)
  frame: string // base64 인코딩된 이미지
  description: string // 상황 설명
  importance: number // 중요도 (0-1)
}

export interface VideoAnalysisResult {
  moments: GameMoment[]
  summary: string
  keyEvents: string[]
  totalDuration: number
}

export class LoLVideoAnalyzer {
  private openai: OpenAI
  private config: VideoAnalysisConfig

  constructor(apiKey: string, config?: Partial<VideoAnalysisConfig>) {
    this.openai = new OpenAI({ apiKey })
    this.config = {
      frameInterval: 5, // 5초마다 프레임 추출
      keyMoments: [
        '갱킹', '팀파이트', '오브젝티브', '타워 공격', 'CS 뺏기',
        '비난', '화내기', '도망', '실패', '성공'
      ],
      maxFrames: 20, // 최대 20개 프레임만 분석 (비용 절약)
      ...config
    }
  }

  async analyzeVideo(videoFile: File): Promise<VideoAnalysisResult> {
    try {
      // 1. 영상에서 프레임 추출
      const frames = await this.extractFrames(videoFile)
      
      // 2. 각 프레임을 AI로 분석
      const analyzedFrames = await this.analyzeFrames(frames)
      
      // 3. 키 모먼트 선별
      const keyMoments = this.selectKeyMoments(analyzedFrames)
      
      // 4. 전체 상황 요약
      const summary = await this.generateSummary(keyMoments)
      
      return {
        moments: keyMoments,
        summary,
        keyEvents: this.extractKeyEvents(keyMoments),
        totalDuration: await this.getVideoDuration(videoFile)
      }
    } catch (error) {
      console.error('영상 분석 오류:', error)
      throw new Error('영상 분석에 실패했습니다.')
    }
  }

  private async extractFrames(videoFile: File): Promise<GameMoment[]> {
    const frames: GameMoment[] = []
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    return new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        const duration = video.duration
        const frameCount = Math.min(
          Math.floor(duration / this.config.frameInterval),
          this.config.maxFrames
        )
        
        let extractedCount = 0
        
        const extractFrame = (currentTime: number) => {
          if (extractedCount >= frameCount) {
            resolve(frames)
            return
          }
          
          video.currentTime = currentTime
          
          video.onseeked = () => {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            ctx.drawImage(video, 0, 0)
            
            const frameData = canvas.toDataURL('image/jpeg', 0.8)
            
            frames.push({
              timestamp: currentTime,
              frame: frameData,
              description: '',
              importance: 0
            })
            
            extractedCount++
            extractFrame(currentTime + this.config.frameInterval)
          }
        }
        
        extractFrame(0)
      }
      
      video.onerror = reject
      video.src = URL.createObjectURL(videoFile)
    })
  }

  private async analyzeFrames(frames: GameMoment[]): Promise<GameMoment[]> {
    const analyzedFrames: GameMoment[] = []
    
    for (const frame of frames) {
      try {
        const analysis = await this.analyzeSingleFrame(frame.frame)
        frame.description = analysis.description
        frame.importance = analysis.importance
        analyzedFrames.push(frame)
      } catch (error) {
        console.error(`프레임 ${frame.timestamp}초 분석 실패:`, error)
        // 분석 실패한 프레임은 건너뛰기
      }
    }
    
    return analyzedFrames
  }

  private async analyzeSingleFrame(frameData: string): Promise<{
    description: string
    importance: number
  }> {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: `당신은 리그 오브 레전드 게임 영상을 분석하는 전문가입니다.
          
분석해야 할 요소들:
1. 게임 상황 (갱킹, 팀파이트, CS, 오브젝티브 등)
2. 플레이어 행동 (비난, 화내기, 도망, 협력 등)
3. 게임 상태 (체력, 골드, 레벨, 아이템 등)
4. 시야 상태 (와드, 미아 등)

중요도 평가 기준:
- 0.1-0.3: 일반적인 게임 진행
- 0.4-0.6: 주목할 만한 상황
- 0.7-0.9: 중요한 갈등이나 문제 상황
- 1.0: 매우 중요한 판결이 필요한 상황

JSON 형식으로 응답하세요:
{
  "description": "상황 설명",
  "importance": 0.0-1.0
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "이 롤 게임 영상 프레임을 분석해주세요."
            },
            {
              type: "image_url",
              image_url: {
                url: frameData
              }
            }
          ]
        }
      ],
      max_tokens: 300
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('AI 응답이 없습니다.')
    }

    try {
      return JSON.parse(content)
    } catch {
      // JSON 파싱 실패 시 기본값 반환
      return {
        description: content,
        importance: 0.5
      }
    }
  }

  private selectKeyMoments(frames: GameMoment[]): GameMoment[] {
    // 중요도가 높은 순으로 정렬하고 상위 프레임들만 선택
    return frames
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 10) // 상위 10개 모먼트만 선택
  }

  private async generateSummary(keyMoments: GameMoment[]): Promise<string> {
    const momentsText = keyMoments
      .map(m => `${Math.floor(m.timestamp / 60)}:${(m.timestamp % 60).toString().padStart(2, '0')} - ${m.description}`)
      .join('\n')

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `당신은 롤 게임 영상을 요약하는 전문가입니다.
          
주어진 키 모먼트들을 바탕으로 게임의 주요 상황을 요약해주세요.
특히 갈등이나 문제가 되는 상황을 중심으로 설명해주세요.`
        },
        {
          role: "user",
          content: `다음 키 모먼트들을 바탕으로 게임 상황을 요약해주세요:

${momentsText}`
        }
      ],
      max_tokens: 500
    })

    return response.choices[0]?.message?.content || '분석 실패'
  }

  private extractKeyEvents(keyMoments: GameMoment[]): string[] {
    const events: string[] = []
    
    for (const moment of keyMoments) {
      if (moment.importance > 0.6) {
        events.push(`${Math.floor(moment.timestamp / 60)}:${(moment.timestamp % 60).toString().padStart(2, '0')} - ${moment.description}`)
      }
    }
    
    return events
  }

  private async getVideoDuration(videoFile: File): Promise<number> {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.onloadedmetadata = () => {
        resolve(video.duration)
      }
      video.src = URL.createObjectURL(videoFile)
    })
  }

  // 사용자가 특정 구간을 선택할 수 있는 기능
  async analyzeTimeRange(videoFile: File, startTime: number, endTime: number): Promise<VideoAnalysisResult> {
    // 특정 시간 구간만 분석
    const frames = await this.extractFrames(videoFile)
    const rangeFrames = frames.filter(frame => 
      frame.timestamp >= startTime && frame.timestamp <= endTime
    )
    
    const analyzedFrames = await this.analyzeFrames(rangeFrames)
    const keyMoments = this.selectKeyMoments(analyzedFrames)
    const summary = await this.generateSummary(keyMoments)
    
    return {
      moments: keyMoments,
      summary,
      keyEvents: this.extractKeyEvents(keyMoments),
      totalDuration: endTime - startTime
    }
  }
}
