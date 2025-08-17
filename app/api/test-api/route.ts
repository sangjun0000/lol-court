import { NextRequest, NextResponse } from 'next/server'

// 롤 API 키 (환경변수에서 가져옴)
const RIOT_API_KEY = process.env.RIOT_API_KEY || 'RGAPI-7a9b7937-4452-45c0-a7ee-83249b5a1171'

export async function GET(request: NextRequest) {
  try {
    console.log('API 키 테스트 시작')
    console.log('API 키:', RIOT_API_KEY ? '설정됨' : '설정안됨')
    console.log('API 키 길이:', RIOT_API_KEY?.length)
    console.log('API 키 시작:', RIOT_API_KEY?.substring(0, 10))
    
    if (!RIOT_API_KEY) {
      return NextResponse.json(
        { error: 'API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    // 여러 소환사명으로 테스트
    const testSummoners = ['Hide on bush', 'Faker', 'Deft']
    
    for (const summonerName of testSummoners) {
      try {
        const testUrl = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`
        
        console.log(`테스트 소환사: ${summonerName}`)
        console.log('테스트 URL:', testUrl)
        
        const response = await fetch(testUrl, {
          headers: {
            'X-Riot-Token': RIOT_API_KEY,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })

        console.log(`${summonerName} 응답:`, { status: response.status, ok: response.ok })

        if (response.ok) {
          const data = await response.json()
          console.log(`${summonerName} 성공:`, data)
          
          return NextResponse.json({
            success: true,
            message: 'API 키가 정상적으로 작동합니다.',
            summoner: {
              name: data.name,
              level: data.summonerLevel,
              id: data.id
            },
            testedWith: summonerName
          })
        } else {
          const errorText = await response.text()
          console.log(`${summonerName} 에러:`, errorText)
        }
      } catch (error) {
        console.log(`${summonerName} 테스트 중 오류:`, error)
      }
    }

    // 모든 테스트가 실패한 경우
    return NextResponse.json(
      { 
        error: '모든 API 테스트가 실패했습니다.',
        message: 'API 키가 유효하지 않거나 서버 문제일 수 있습니다.',
        apiKeyLength: RIOT_API_KEY.length,
        apiKeyStart: RIOT_API_KEY.substring(0, 10)
      },
      { status: 403 }
    )

  } catch (error) {
    console.error('API 테스트 오류:', error)
    return NextResponse.json(
      { error: 'API 테스트 중 오류가 발생했습니다.', details: error },
      { status: 500 }
    )
  }
}
