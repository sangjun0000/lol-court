import { NextRequest, NextResponse } from 'next/server'

// 롤 API 키 (환경변수에서 가져옴)
const RIOT_API_KEY = process.env.RIOT_API_KEY || 'RGAPI-1e6d8794-f7cd-4bd2-b8fd-d798ccd9b7f0'

export async function POST(request: NextRequest) {
  try {
    const { summonerName, region } = await request.json()
    
    console.log('태그라인 검색 요청:', { summonerName, region })

    if (!summonerName) {
      return NextResponse.json(
        { error: '소환사명이 필요합니다.' },
        { status: 400 }
      )
    }

    if (!RIOT_API_KEY) {
      return NextResponse.json(
        { error: 'Riot API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    // 일반적인 태그라인들을 시도
    const commonTags = [
      'KR1', 'KR2', 'KR3', 'KR4', 'KR5', 'KR6', 'KR7', 'KR8', 'KR9', 'KR0',
      'NA1', 'NA2', 'NA3', 'NA4', 'NA5', 'NA6', 'NA7', 'NA8', 'NA9', 'NA0',
      'EUW1', 'EUW2', 'EUW3', 'EUW4', 'EUW5', 'EUW6', 'EUW7', 'EUW8', 'EUW9', 'EUW0',
      'EUN1', 'EUN2', 'EUN3', 'EUN4', 'EUN5', 'EUN6', 'EUN7', 'EUN8', 'EUN9', 'EUN0',
      'JP1', 'JP2', 'JP3', 'JP4', 'JP5', 'JP6', 'JP7', 'JP8', 'JP9', 'JP0',
      'BR1', 'BR2', 'BR3', 'BR4', 'BR5', 'BR6', 'BR7', 'BR8', 'BR9', 'BR0',
      'LA1', 'LA2', 'LA3', 'LA4', 'LA5', 'LA6', 'LA7', 'LA8', 'LA9', 'LA0',
      'OC1', 'OC2', 'OC3', 'OC4', 'OC5', 'OC6', 'OC7', 'OC8', 'OC9', 'OC0',
      'TR1', 'TR2', 'TR3', 'TR4', 'TR5', 'TR6', 'TR7', 'TR8', 'TR9', 'TR0',
      'RU1', 'RU2', 'RU3', 'RU4', 'RU5', 'RU6', 'RU7', 'RU8', 'RU9', 'RU0'
    ]

    const foundTags: string[] = []

    // 병렬로 여러 태그라인을 시도 (최대 10개까지만)
    const tagsToTry = commonTags.slice(0, 10)
    
    const promises = tagsToTry.map(async (tag) => {
      try {
        const accountUrl = `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(summonerName)}/${tag}`
        
        const accountResponse = await fetch(accountUrl, {
          headers: {
            'X-Riot-Token': RIOT_API_KEY,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Charset': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': 'https://developer.riotgames.com',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })

        if (accountResponse.ok) {
          return tag
        }
        return null
      } catch (error) {
        return null
      }
    })

    const results = await Promise.all(promises)
    const validTags = results.filter(tag => tag !== null) as string[]

    console.log(`태그라인 검색 완료: ${validTags.length}개 발견`)

    return NextResponse.json({ 
      tags: validTags,
      message: `${validTags.length}개의 태그라인을 찾았습니다.`
    })

  } catch (error) {
    console.error('태그라인 검색 오류:', error)
    return NextResponse.json(
      { error: '태그라인 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
