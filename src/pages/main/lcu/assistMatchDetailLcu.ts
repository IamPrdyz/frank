import {invokeLcu} from "./index";
import {champDict} from "../resources/champList";
import {getItemImgUrl, getspellImgUrl, querySummonerPosition} from "./utils";
import {Game, LcuMatchList,simpleMatchTypes} from "./types/queryMatchLcuTypes";

export const queryChampList = async (summonerId: string) => {
  if (summonerId==='') {
    return null
  }
  try {
    const summonerSuperChampData:any = await invokeLcu('get', `/lol-collections/v1/inventories/${summonerId}/champion-mastery`)
    return  summonerSuperChampData.slice(0, 20).reduce((res: any, item: any) => {
      return res.concat([[
       `https://game.gtimg.cn/images/lol/act/img/champion/${champDict[String(item.championId)].alias}.png`,
       `${champDict[String(item.championId)].label} ${champDict[String(item.championId)].title}`,
        `英雄等级 ${item.championLevel} | 熟练度 ${item.championPoints}`
      ]])
    }, [])
  } catch (e) {
    return null
  }
}

const queryMatchHistory = async (puuid: string, begIndex: number, endIndex: number): Promise<LcuMatchList|null> => {
  const res = await invokeLcu(
    'get',
    `/lol-match-history/v1/products/lol/${puuid}/matches`,
    [begIndex, endIndex])
  if (res?.success === false){
    return null
  }
  return res
}

const timestampToDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const year = String( date.getFullYear()).slice(2,4)
  const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  return (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + `/${day}/${year}`
}


// 获取简单的对局数据
const getSimpleMatch = (match: Game,gameModel:string) => {
  return {
    champImgUrl: `https://game.gtimg.cn/images/lol/act/img/champion/${champDict[String(match.participants[0].championId)].alias}.png`,
    // 是否取得胜利
    isWin: match.participants[0].stats.win === true ? true : false,
    // 击杀数目
    kills: match.participants[0].stats.kills,
    // 死亡数目
    deaths: match.participants[0].stats.deaths,
    // 助攻数目
    assists: match.participants[0].stats.assists,
    // 游戏时间
    matchTime: timestampToDate(match.gameCreation),
    // 游戏模式
    gameModel:gameModel,
    // 召唤师技能1
    spell1Id : getspellImgUrl(match.participants[0].spell1Id),
    // 召唤师技能2
    spell2Id : getspellImgUrl(match.participants[0].spell2Id),
    // 物品
    item0 :  getItemImgUrl(match.participants[0].stats.item0),
    item1 :  getItemImgUrl(match.participants[0].stats.item1),
    item2 :  getItemImgUrl(match.participants[0].stats.item2),
    item3 :  getItemImgUrl(match.participants[0].stats.item3),
    item4 :  getItemImgUrl(match.participants[0].stats.item4),
    item5 :  getItemImgUrl(match.participants[0].stats.item5),
    item6 :  getItemImgUrl(match.participants[0].stats.item6),
    // 召唤师位置
    lane : querySummonerPosition(match.participants[0].timeline.lane),
    // 等级
    level:match.participants[0].stats.champLevel
  }
}

const queryGameType = (queueId:number) => {
  switch (queueId) {
    case 420 : return '单双';
    case 430 : return '匹配';
    case 440 : return '组排';
    case 450 : return '极地';
    case 1700 : return '斗魂';
  }
  return '其它'
}

export const queryMatch = async (puuid:string) => {
  if (puuid === ''){
    return null
  }
  const matchList = await queryMatchHistory(puuid, 0, 20)
  if (matchList === null || matchList?.games?.games.length ===0){
    return null
  }
  const simpleMatchList:simpleMatchTypes[] = isRevGames(matchList.games.games).reduce((res:any,item:any) => {
    return res.concat([getSimpleMatch(item,queryGameType(item.queueId))])
  },[])
  return simpleMatchList
}

const isRevGames = (games:Game[]):Game[]  =>  {
  let len = games.length

  if (games[0].gameCreation > games[len-1].gameCreation) {
    return games
  }
  return games.reverse()
}
