import {isRevGames, queryMatchHistory} from "@/lcu/aboutMatch";
import {Game, SimpleMatchTypes} from "@/lcu/types/queryMatchLcuTypes";
import {champDict} from "@/resources/champList";
import {querySummonerPosition} from "@/lcu/utils";

export class QueryMatch {
  constructor(queueId: number) {
    this.currentMode = queueId
  }

  private currentMode = 0
  public cacheSpecialMatch: SimpleMatchTypes[][] = []

  public timestampToDate = (timestamp: number) => {
    var date = new Date(timestamp)
    return (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-' + date.getDate()
  }

  public queryGameType = (queueId: number) => {
    switch (queueId) {
      case 420 :
        return '单双';
      case 430 :
        return '匹配';
      case 440 :
        return '灵活';
      case 450 :
        return '极地';
      case 1700 :
        return '斗魂';
    }
    return '其它'
  }

  public getSimpleMatch = (match: Game): SimpleMatchTypes => {
    return {
      champId:match.participants[0].championId,
      champImgUrl: `${champDict[String(match.participants[0].championId)].alias}.png`,
      // 是否取得胜利
      isWin: match.participants[0].stats.win === true ? true : false,
      // 击杀数目
      kills: match.participants[0].stats.kills,
      // 死亡数目
      deaths: match.participants[0].stats.deaths,
      // 助攻数目
      assists: match.participants[0].stats.assists,
      // 游戏时间
      matchTime: this.timestampToDate(match.gameCreation),
      // 游戏模式
      gameModel:this.queryGameType(match.queueId),
      // 召唤师技能1
      spell1Id : match.participants[0].spell1Id,
      // 召唤师技能2
      spell2Id : match.participants[0].spell2Id,
      // 物品
      itemList:
        [match.participants[0].stats.item0,match.participants[0].stats.item1,
        match.participants[0].stats.item2,match.participants[0].stats.item3,
        match.participants[0].stats.item4,match.participants[0].stats.item5,
        match.participants[0].stats.item6],
      // 召唤师位置
      lane : querySummonerPosition(match.participants[0].timeline.lane),
      // 等级
      level:match.participants[0].stats.champLevel,
      queueId:match.queueId
    }
  }
  // process record data
  public dealMatchHistory = async (puuid: string, begIndex: number, endIndex: number): Promise<SimpleMatchTypes[]> => {
    const matchList = await queryMatchHistory(puuid, begIndex, endIndex)

    if (matchList === null) {
      return []
    }
    if (matchList?.games?.games?.length === 0 || matchList?.games?.games === undefined) {
      return []
    }

    return isRevGames(matchList.games.games)
      .map((matchListElement) => {
        return this.getSimpleMatch(matchListElement)
      })
  }
  // query the record of a specific mode
  public querySpecialMatch = async (puuid: string, matchHis20: SimpleMatchTypes[]) => {
    const specialList = matchHis20
      .filter(matchList => matchList.queueId === this.currentMode)
      .slice(0, 10)
    const speListLen = specialList.length

    if (speListLen === 10 || matchHis20.length < 20) {
      this.cacheSpecialMatch.push(specialList)
    } else {
      const matchHis40 = await this.dealMatchHistory(puuid, 20, 59)
      this.cacheSpecialMatch.push(
        [...specialList,
          ...matchHis40.filter(matchList => matchList.queueId === this.currentMode)
            .slice(0, 10 - speListLen)]
      )
    }
  }
  // return result
  public getResultInfo = async (puuid: string,index:number) => {
    const matchHis20 = await this.dealMatchHistory(puuid, 0, 19)

    if (this.currentMode === 420 || this.currentMode === 440) {
      // 如果是单双|组排， 延迟异步获取缓存数据
      setTimeout(() => {
        this.querySpecialMatch(puuid, matchHis20)
      },1500+500*index)
      return matchHis20
    }
    return matchHis20
  }
}
