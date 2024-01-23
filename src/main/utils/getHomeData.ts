// 处理本地召唤师英雄熟练度数据
import {champDict} from "@/resources/champList";

import {
  queryMasteryChampList,
  queryCurrentRankPoint,
  queryCurrentSummonerInfo,
  querySummonerHonorLevel
} from "@/lcu/aboutSummoner";


// 返回首页最终需要的数据
export const getCurrentSummonerAllInfo = async () => {
  const summonerInfo = await queryCurrentSummonerInfo()

  if (summonerInfo===null) {
    return null
  }

  const [rankList, champLevel, honorData] = await Promise.all([
    queryCurrentRankPoint(),
    queryMasteryChampList(summonerInfo.puuid),
    querySummonerHonorLevel(),
  ])

  rankList.push(honorData)
  return { summonerInfo, rankList, champLevel }
}
