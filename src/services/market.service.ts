import { MOCK_RECENTLY_SOLD } from '@/constants/recentlySold'
import { IEonUserDetail, IPackageStreamer, IPresalePackage, RO_ZERO_PC_GAME_ID, ZERO_ETERNAL_LOVE_GAME_ID } from '@/types/eonhub'
import axios, { AxiosInstance } from 'axios'
import { ca, id } from 'date-fns/locale'
import { toast } from 'react-toastify'

export type MarketResponse = {
  status: number
  data: any | undefined
  message: string | undefined
}
export type UserInfoResponseDTO = {
  gameUserId: string
  characterNames: CharacterInfoResponseDTO[]
}

export type MyLotteryResponseDTO = {
  lotteryNumber: string;
  purchasedTime: Date;
  status: string;
}

export type CharacterInfoResponseDTO = {
  characterId: number
  characterName: string
  level: number
  isOnline: boolean
  zeny: number
}

export type MarketItemResponseDTO = {
  characterBag: ItemDetail[]
}

export type ItemDetail = {
  charId: number
  charName: string
  itemId: number
  itemName: string
  refineLevel: number
  itemOption: number
  itemEffectCode: number
  itemEffectMessage: string
  itemPictureUrl: string
  itemBag: WhiteListItemBag
  itemType: WhiteListItemType
  itemAmount: number
}

export type IUserWalletHistory = {
  topupId: number;
  userId: number,
  txnType: string;
  transactionHash: string,
  transactionAmount: number,
  eonAmount: number;
  destinationUserEmail: string;
  status: string;
  failMessage: string;
  createdTime: Date;
  updatedTime: Date;
}

export type MarketPlaceTaxResponse = {
  marketplaceTax: number
  totalReferralSystem: number
  totalTax: number
}

export enum WhiteListItemType {
  COSTUME = 'COSTUME',
  MONEY = 'MONEY',
}

export enum WhiteListItemBag {
  CHARACTER_CASH_INVENTORY = 'CHARACTER_CASH_INVENTORY',
  CHARACTER_IN_GAME_INVENTORY = 'CHARACTER_IN_GAME_INVENTORY',
  ACCOUNT_CASH_INVENTORY = 'ACCOUNT_CASH_INVENTORY',
  IN_GAME_ITEM_INVENTORY = 'IN_GAME_ITEM_INVENTORY',
}

export type IConvertableRom2PcResponseDTO = {
  inventoryId: number;
  convertFromItemId: number;
  convertFromItemName: string;
  convertFromItemAmount: number;
  convertFromItemPictureUrl: string;
  convertToItemId: number;
  convertToItemName: string;
  convertToItemAmount: number;
  convertToItemPictureUrl: string;
}

export type InventoryResponseDTO = {
  inventoryId: number
  itemId: number
  itemName: string
  itemAmount: number
  itemOption: number
  itemRefinedLevel: number
  itemEffectCode: number
  itemEffectMessage: string
  itemPictureUrl: string
  itemType: WhiteListItemType
  itemBag: WhiteListItemBag
  status: string
  addedTime: Date
  updatedTime: Date
}

export type AddInventoryRequestDTO = {
  walletToken: string
  characterId: number
  itemId: number
  itemName: string
  itemOption: number
  itemEffectCode: number
  itemRefine: number
  itemBag: WhiteListItemBag
  itemAmount: number
  itemType: WhiteListItemType
}

export type MarketList = {
  marketItemId: number
  itemName: string
  itemEffectMessage: string
  itemPictureUrl: string
  itemType: string
  itemBag: string
  itemAmount: number
  eonPriceForEach: number
  sellerGameUserId: string
  createdTime: Date
  updatedTime: Date
  sellerWalletId: string
}

export type MarketHistoryResponse = {
  marketHistoryId: number
  historyType: string
  itemName: string
  itemEffectMessage: string
  itemPictureUrl: string
  itemAmount: number
  price: number
  actionByUserId: number
  actionTime: Date
}

export type TransferEonHistory = {
  destinationUserEmail: string
  eonAmount: number
  failMessage: string | null
  status: string
  actionTime: Date
}

export default class MarketService {
  private axiosInstance: AxiosInstance

  public getUserGameInfo = (gameId: number, token: string, callBack: Function) => {
    axios
      .get(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/user/${gameId}/info`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as MarketResponse

        if (payload.status == 200) {
          callBack(payload?.data)
          return payload.data as UserInfoResponseDTO
        }
      })
      .catch((error) => {
        // toast.error(error.response.data.message)
        return undefined
      })
  }


  public getUserMarketInfo = (gameId: number, token: string) => {
    return axios
      .get(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/market/${gameId}/userinfo`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as MarketResponse
        if (payload.status == 200) {
          return payload.data as UserInfoResponseDTO
        }
      })
      .catch((error) => {
        // toast.error(error.response.data.message)
        return undefined
      })
  }

  public getUserWhiteListItem = (gameId: number, token: string, serverId: number) => {
    if(!gameId || !token || !serverId) return
    return axios
      .get(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/market/${gameId}/useritem?serverId=${serverId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as MarketResponse
        if (payload.status == 200) {
          return payload.data as MarketItemResponseDTO
        }
      })
      .catch((error) => {
        // do something
        // toast.error(error.response.data.message)
      })
  }

  public getMyInventory = (gameId: number, token: string, callBack?: Function) => {
    return axios
      .get(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/market/${gameId}/inventory`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as MarketResponse
        if (payload.status == 200) {
          return payload.data as InventoryResponseDTO[]
        }
      })
      .catch((error) => {
        // do something
        toast.error(error.response.data.message)
        return undefined
      })
  }

  public getUserWalletHistory = (token: string, callBack?: Function) => {
    return axios
      .get(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/wallet/history?page=1&perPage=30`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as any
        if (payload.status == 200) {
          return payload.data as IUserWalletHistory
        }
      })
      .catch((error) => {
        // do something
        toast.error(error.response.data.message)
        return undefined
      })
  }


  public getMarketItemList = (gameId: number, token: string, callBack?: Function) => {
    if(!gameId || !token) return
    return axios
      .get(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/market/${gameId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as MarketResponse
        if (payload.status == 200) {
          return payload.data as MarketList[]
        }
      })
      .catch((error) => {
        // do something
        toast.error(error.response.data.message)
      })
  }

  public getIngameMarketTax = (serverId: number, token: string, period: number, callBack?: Function) => {
    return axios
      .get(`${process?.env?.NEXT_PUBLIC_EONHUB_ONLINE_API_URL || ''}rom/api/market/ingame-tax?serverId=${serverId}&period=${period}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as any
        if (payload.status == 200) {
          return payload.data as any
        }
      })
      .catch((error) => {
        // do something
        // toast.error(error.response.data.message)
      })
  }

  public getIngameMarketTaxV2 = (serverId: number, token: string, callBack?: Function) => {
    return axios
      .get(`${process?.env?.NEXT_PUBLIC_ROM_API_URL || ''}/api/treasury/tax?serverId=${serverId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as any
        if (payload.status == 200) {
          return payload.data as any
        }
      })
      .catch((error) => {
        // do something
        // toast.error(error.response.data.message)
      })
  }


  public getMarketTax = (gameId: number, token: string, callBack?: Function) => {
    if(!gameId) return
    return axios
      .get(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/market/${gameId}/tax`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as any
        if (payload.status == 200) {
          return payload.data as number
        }
      })
      .catch((error) => {
        // do something
        toast.error(error.response.data.message)
      })
  }

  public addMyInventory = (gameId: number, token: string, walletToken: string,
    characterId: number, itemId: number, itemName: string, itemOption: number,
    itemEffectCode: number, itemRefine: number, itemBag: WhiteListItemBag,
    itemAmount: number, itemType: WhiteListItemType, serverID: number) => {

    return axios
      .post(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/market/${gameId}/inventory`, {
        walletToken: walletToken,
        characterId: characterId,
        itemId: itemId,
        itemName: itemName,
        itemOption: itemOption,
        itemEffectCode: itemEffectCode,
        itemRefine: itemRefine,
        itemBag: itemBag,
        itemAmount: itemAmount,
        itemType: itemType,
        serverId: serverID
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as MarketResponse

        if (payload.status == 200) {
          // add item success
          toast.success(`Minting item Success`)
        }
      })
      .catch((error) => {
        // do something
        toast.error(error.response.data.message)
      })

  }

  public sellItem = (gameId: number, token: string, inventoryId: number, eonPriceForEach: number, amount: number, serverID: number) => {

    return axios
      .post(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/market/${gameId}/sell`, {
        inventoryId: inventoryId,
        eonPriceForEach: eonPriceForEach,
        amount: amount,
        serverId: serverID
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as MarketResponse

        if (payload.status == 200) {
          // sell item success
          toast.success('Listing item Succes')
        }
      })
      .catch((error) => {
        // do something
        toast.error(error.response.data.message)
      })
  }

  public buyItem = (gameId: number, token: string, marketItem: MarketList, amount: number, serverID: number, walletToken?: string, callBack?: Function) => {
    if (!marketItem) return
    return axios
      .post(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/market/${gameId}/buy`, walletToken ? {
        walletToken,
        marketId: marketItem.marketItemId,
        amount: amount || 1,
        serverId: serverID
      } : {
        // walletToken,
        marketId: marketItem.marketItemId,
        amount: amount || 1,
        serverId: serverID
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as MarketResponse

        if (payload.status == 200) {
          // buy item success
          toast.success(`Buy ${marketItem.itemName} Success!`)
          callBack()
          // this.getMarketItemList(gameId,token,callBack)
          // this.getMyInventory(gameId,token,callBack)
        }
      })
      .catch((error) => {
        // do something
        toast.error(error.response.data.message)
      })
  }

  public cancelItem = (gameId: number, token: string, marketId: number) => {

    return axios
      .post(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/market/${gameId}/cancel`, {
        marketId: marketId
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as MarketResponse

        if (payload.status == 200) {
          // sell item success
          toast.success('Cancel listing success')
        }
      })
      .catch((error) => {
        // do something
        toast.error(error.response.data.message)
      })
  }
 
    public convertItemRomToPC = (gameId: number, token: string, inventoryId: number, convertFromAmount: number, convertFromGameId: number, convertToGameId: number) => {
      return axios
        .post(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/market/${gameId}/convert-item`, {
          inventoryId: inventoryId,
          convertFromAmount: Number(convertFromAmount),
          convertFromGameId: convertFromGameId,
          convertToGameId: convertToGameId
        }, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const payload = response.data as MarketResponse

          if (payload.status == 200) {
            // conversion success
            toast.success('Item conversion success')
          }
        })
        .catch((error) => {
          // do something
          toast.error(error.response.data.message)
        })
    } 

  public addItemToGame = (gameId: number, token: string, inventoryId: number, characterId: number, amount: number, serverID: number, walletToken?: string) => {
    return axios
      .post(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/market/${gameId}/retrive`, walletToken ? {
        walletToken: walletToken,
        inventoryId: inventoryId,
        characterId: characterId,
        amount: amount || 1,
        serverId: serverID
      } : {
        // walletToken: walletToken,
        inventoryId: inventoryId,
        characterId: characterId,
        amount: amount || 1,
        serverId: serverID
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as MarketResponse

        if (payload.status == 200) {
          // retrieve item success
          toast.success('Redeem Item Success!')
        }
      })
      .catch((error) => {
        // do something
        toast.error('Redeem Item Error, Logout and try again!')
      })
  }

  public buyPresalePackage = (gameId: number, token: string, walletToken: string, packageData: IPresalePackage, serverId: number) => {

    const req = axios.post(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/package/${gameId}/purchase/${packageData?.packageId}`, {
      walletToken: walletToken,
      serverId: serverId.toString()
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        const payload = response.data as MarketResponse
        toast.success(`Successfully purchased ${packageData?.packageName}`)
      })
      .catch((error) => {
        // do something
        // toast.error(`Error purchasing ${packageData?.packageName}`)
        toast.error(error.response.data.message)
      })
  }

  public topupSealMetaversePackage = (gameId: number, token: string, walletToken: string, packageData: IPresalePackage) => {

    return axios.post(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/package/${gameId}/purchase/${packageData?.packageId}`, {
      walletToken: walletToken,
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        const payload = response.data as MarketResponse
        toast.success(`Successfully purchased ${packageData?.packageName}`)
      })
      .catch((error) => {
        // do something
        // toast.error(`Error purchasing ${packageData?.packageName}`)
        toast.error(error.response.data.message)
      })

  }

  public getTransferEonHistory = (token: string) => {
    return axios
      .get(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/wallet/transfer/history`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as MarketResponse
        if (payload.status == 200) {
          return payload.data as TransferEonHistory[]
        }
      })
      .catch((error) => {
        // do something
        toast.error(error.response.data.message)
      })
  }

  public getTotalTaxHistory = (gameId: number) => {
    if(!gameId) return
    return axios
      .get(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/market/${gameId}/tax`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((response) => {
        const payload = response.data as MarketResponse
        if (payload.status == 200) {
          return payload.data as MarketPlaceTaxResponse
        }
      })
      .catch((error) => {
        // do something
        toast.error(error.response.data.message)
      })
  }

  public topupZeroEternalLovePackage = (gameId: number, token: string, walletToken: string, packageData: IPresalePackage, characterId: string | null, serverID: number) => {

    const payload = walletToken ? {
      walletToken,
      characterId: characterId,
      serverId: serverID
    } : {
      characterId: characterId,
      serverId: serverID
    }

    return axios.post(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/package/${gameId}/purchase/${packageData?.packageId}`, {
      ...payload
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        const payload = response.data as MarketResponse
        toast.success(`Successfully purchased ${packageData?.packageName}`)
      })
      .catch((error) => {
        // do something
        // toast.error(`Error purchasing ${packageData?.packageName}`)
        toast.error(error.response.data.message)
      })

  }

  public redeemZeroEternalLovePackage = (gameId: number, token: string, walletToken: string, packageData: IPresalePackage, characterId: string) => {

    return axios.post(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/package/${gameId}/purchase/${packageData?.packageId}`, {
      walletToken: walletToken,
      characterId: characterId
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        const payload = response.data as MarketResponse
        toast.success(`Successfully purchased ${packageData?.packageName}`)
      })
      .catch((error) => {
        // do something
        // toast.error(`Error purchasing ${packageData?.packageName}`)
        toast.error(error.response.data.message)
      })

  }

  public getMyMarketItemList = (gameId: number, token: string, callBack?: Function) => {
    return axios
      .get(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/market/${gameId}?isMyItem=true`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as MarketResponse
        if (payload.status == 200) {
          return payload.data as MarketList[]
        }
      })
      .catch((error) => {
        // do something
        toast.error(error.response.data.message)
      })
  }

  public getMarketHistory = (gameId: number, token: string, isMyItem: boolean, action: string) => {
    let historyType = 'BUY_FROM_MARKET'
    if (action == 'SELL') {
      historyType = 'SOLD_ON_MARKET'
    }

    return axios
      .get(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/market/${gameId}/history`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        params: {
          isMyItem: isMyItem,
          historyType: historyType
        }
      })
      .then((response) => {
        const payload = response.data as MarketResponse
        if (payload.status == 200) {
          return payload.data as MarketHistoryResponse[]
        }
      })
      .catch((error) => {
        // do something
        toast.error(error.response.data.message)
      })
  }

  public getMarketRecentlySold = (gameId: number, token: string) => {

    return axios
      .get(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/market/${gameId}/history`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        params: {
          // isMyItem: isMyItem,
          historyType: "BUY_FROM_MARKET"
        }
      })
      .then((response) => {
        const payload = response.data as any
        if (payload.status == 200) {
          return payload.data as MarketHistoryResponse[]
        }
      })
      .catch((error) => {
        // do something
        // toast.error(error.response.data.message)
        return [];
      })
  }

  public fetchMyLottery = (token: string, callBack?: Function) => {
    return axios
      .get(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/lottery/my-ticket`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as MarketResponse
        if (payload.status == 200) {
          if (callBack) {
            callBack(payload.data)
          }
          return payload.data as MyLotteryResponseDTO[]
        }
      })
      .catch((error) => {
        // do something
        toast.error(error.response.data.message)
      })
  }

  public purchaseLottery = (token: string, lotteryNumber: string) => {
    return axios
      .post(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/lottery/buy-ticket`, {
        lotteryNumber: lotteryNumber
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as MarketResponse
        if (payload.status == 200) {
          toast.success(`Purchase Lottery [${lotteryNumber}] Success`)
        }
      })
      .catch((error) => {
        // do something
        toast.error(error.response.data.message)
      })
  }
  
  public getMyConvertItemFromZeroEL2ZeroPC = (token: string, callBack?: Function) => {
    return axios
      .get(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/market/${ZERO_ETERNAL_LOVE_GAME_ID}/my-convert-item?convertToGameId=${RO_ZERO_PC_GAME_ID}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as any 
        if (payload.status == 200) {
          if (callBack) {
            callBack(payload.data)
          }
          return payload.data as InventoryResponseDTO[]
        }
      })
      .catch((error) => {
        // do something 
        toast.error(error.response.data.message)
      })
  }

  public getStreamerPacks = (token: string, gameId: number, callBack?: Function) => {
    return axios
      .get(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/streamer/${gameId}/my-privilege`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as any 
        if (payload.status == 200) {
          if (callBack) {
            callBack(payload.data)
          }
          return payload.data as IPackageStreamer[]
        }
      })
      .catch((error) => {
        // do something 
        // toast.error(error.response.data.message)
      })
  }
  
  public useZenCoin = (gameId: number, token: string, inventoryId: number, convertFromAmount: number, convertFromGameId: number, convertToGameId: number) => {
    return axios
    .post(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/market/${gameId}/convert-item`, {
      inventoryId: inventoryId,
      convertFromAmount: Number(convertFromAmount),
      convertFromGameId: convertFromGameId,
      convertToGameId: convertToGameId
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      const payload = response.data as MarketResponse

      if (payload.status == 200) {
        // conversion success
        toast.success('Item conversion success')
      }
    })
    .catch((error) => {
      // do something
      toast.error(error.response.data.message)
    })
  }

  public convertMyItem = (token: string, body: requestBodyConvertMyItem) => {
    if(!body || !body?.convertFromAmount || !body?.convertFromGameId || !body?.convertToGameId || !body?.inventoryId) return
    return axios
      .post(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/lottery/buy-ticket`, {
        ...body
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const payload = response.data as MarketResponse
        if (payload.status == 200) {
          toast.success(`Convert Item Success`)
        }
      })
      .catch((error) => {
        // do something
        toast.error(error.response.data.message)
      })
  }


  public claimStreamerPackage = (gameId: number, token: string, walletToken: string, packageData: IPackageStreamer, characterId: string | null, serverID: number) => {

    const payload = walletToken ? {
      walletToken,
      characterId: characterId,
      serverId: serverID
    } : {
      characterId: characterId,
      serverId: serverID
    }

    return axios.post(`${process?.env?.NEXT_PUBLIC_EONHUB_API_URL || ''}api/package/${gameId}/purchase/${packageData?.packageId}`, {
      ...payload
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        const payload = response.data as MarketResponse
        toast.success(`Successfully purchased ${packageData?.packageName}`)
      })
      .catch((error) => {
        // do something
        // toast.error(`Error purchasing ${packageData?.packageName}`)
        toast.error(error.response.data.message)
      })

  }

}

export type requestBodyConvertMyItem = {
  inventoryId: number;
  convertFromAmount: number;
  convertFromGameId: number;
  convertToGameId: number;
}

export type GetMyConvertItemResponseDTO = {
  inventoryId: number
  convertFromItemId: number
  convertFromItemName: string
  convertFromItemAmount: number
  convertFromItemPictureUrl: string
  convertToItemId: number
  convertToItemName: string
  convertToItemAmount: number
  convertToItemPictureUrl: string
}