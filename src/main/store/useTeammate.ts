import {defineStore} from "pinia";
import {SummonerInfoList} from "@/main/views/teammate/teammateTypes";
import {SimpleMatchTypes} from "@/lcu/types/queryMatchLcuTypes";
import {QueryMatch} from "@/main/views/teammate/queryMatch";
import {queryMasteryChampList} from "@/lcu/aboutSummoner";
import {Hater} from "@/main/views/record/blackListTypes";

const useMatch = new QueryMatch()

export const useTeammateStore = defineStore('useTeammate', {
  state: () => {
    return {
      summonerInfo: [] as SummonerInfoList[],
      summonerKad:[] as number[],
      recentMatchList: [] as SimpleMatchTypes[][],
      cacheMatchList: {} as {[key:string]:SimpleMatchTypes[]},
      masteryChampList:[] as string[][][],
      blackList: null as Hater[]|null,
      isLcuErr:false,
      isCacheSuccess:false,
    }
  },
  actions: {
    async initStore(summonerInfo:SummonerInfoList[],queueId:number) {
      this.summonerInfo = summonerInfo
      await this.getMatchList(summonerInfo)
      await this.cacheMatchRecord(summonerInfo,queueId)
    },
    async getMatchList(summonerInfo:SummonerInfoList[]){
      for (const summoner of summonerInfo) {
        const matchList = await useMatch.getMatchHis(summoner.puuid)
        if (matchList.length === 0) {
          // 查询最近战绩出错
          this.isLcuErr = true
          this.summonerKad = []
          this.recentMatchList = []
          return this.getMatchListFromChamp(summonerInfo)
        } else {
          const kda = this.calculateAverageKDA(matchList)
          this.summonerKad.push(kda)
          this.recentMatchList.push(matchList)
        }
      }

    },
    // 战绩获取失败，获取英雄数据
    async getMatchListFromChamp(summonerInfo:SummonerInfoList[]){
      for (const summoner of summonerInfo) {
        const list = await queryMasteryChampList(summoner.puuid)
        this.masteryChampList.push(list||[])
      }
    },
    // 缓存战绩数据
    async cacheMatchRecord (summonerInfo:SummonerInfoList[],queueId:number){
      if (this.recentMatchList.length === 0){
        return
      }

      for (const [index,summoner] of summonerInfo.entries()) {
        const matchHis20:SimpleMatchTypes[] =JSON.parse(JSON.stringify(this.recentMatchList[index]))

        if (queueId===420||queueId===440) {
          const matchList = await useMatch.getSpecialMatchHis(summoner.puuid, matchHis20, queueId)
          const cacheList = matchList.length === 0 ? matchHis20.slice(0, 10) : matchList
          this.cacheMatchList[summoner.summonerId] = cacheList
        } else {
          this.cacheMatchList[summoner.summonerId] = matchHis20.slice(0, 10)
        }
      }
      this.isCacheSuccess = true
    },
    // 计算kda
    calculateAverageKDA(statsArray:SimpleMatchTypes[]){
      const firstSixStats = statsArray.slice(0, 6)

      const sumKDA = firstSixStats.reduce(
        (sum, stats) => sum + stats.kda, 0)
      const averageKDA = sumKDA / firstSixStats.length
      return parseFloat(averageKDA.toFixed(1))
    },
    // 获取黑名单数据
    addBlackList(blacklist:Hater[]){
      this.blackList = blacklist
    },
  }
})
