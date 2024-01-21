import {defineStore} from 'pinia'
import {champDict} from "@/resources/champList";
import {isStoreageHas} from "@/lcu/utils";
import {ItemBuild, Rune} from "@/main/pages/assist/views/rune/runeTypes";
import {QueryRune} from "@/main/pages/assist/views/rune/queryRune";

export const useRuneStore = defineStore('useRuneStore', {
  state: () => {
    return {
      currentChamp: 0,
      currentChampImgUrl: '',
      currentChampAlias: '',
      currentChampTitle: '',
      isAutoRune: '',
      runeDataList: [] as Rune[],
      blockDataList: [] as {position:string,buildItems:ItemBuild,ps:string} [],
      skillsList: [] as string[][],
    }
  },
  actions: {
    mapChampInfo(champId: number) {
      this.currentChamp = champId
      this.currentChampImgUrl = `https://game.gtimg.cn/images/lol/act/img/champion/${champDict[champId].alias}.png`
      this.currentChampAlias = champDict[champId].alias
      this.currentChampTitle = champDict[champId].title
      this.isAutoRune = isStoreageHas('autoRune',this.currentChampAlias) == true ?
        'auto' : ''
    },
    async initStore(champId: number){
      this.mapChampInfo(champId)
      const queryRune = new QueryRune(0)
      const runesData = await queryRune.getRunesData(this.currentChampAlias)

      if (runesData !== null){
        this.skillsList = runesData.skillsList
        this.runeDataList = runesData.runeDataList
        this.blockDataList = runesData.blockDataList
        return false
      }else {
        return true
      }
    },
    clearStore() {
      this.runeDataList = []
      this.blockDataList = []
      this.skillsList = []
    }
  }
})
