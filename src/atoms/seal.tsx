import { IPresalePackage, IVote } from "@/types/eonhub";
import { atom } from "jotai";
import { ZERO_CASH_PACKAGES, presaleListMock } from "./mock";
import { OBT_DAILY_REWARD, OBT_DAILY_REWARD_PREMIUM, OBT_FIRST_PROMOTION, TOPUP_PACKAGE } from "@/constants/rom";

export const topupPackageListAtom = atom<IPresalePackage[] | undefined>([]);
export const selectedTopupPackageAtom = atom<IPresalePackage | undefined>(presaleListMock[0]);
export const mallListAtom = atom<IPresalePackage[] | undefined>(presaleListMock);

export const topupZeroPackageListAtom = atom<IPresalePackage[] | undefined>(TOPUP_PACKAGE);

export interface IZeroEternalLoveHistory {
    purchaseId: number,
    packageType: string,
    packageName: string,
    packagePictureUrl: string,
    itemCode: string,
    price: number,
    usedItemCodeCounts: number,
    usedItemCodeMaxCond: number,
    purchaseTime: string,
    isUseable: boolean
}
export const zeroEternalLoveHistoryAtom = atom<IZeroEternalLoveHistory[]>([]);


export interface ISealMetaverseHistory {
    purchaseId: number,
    packageType: string,
    packageName: string,
    packagePictureUrl: string,
    itemCode: string,
    price: number,
    usedItemCodeCounts: number,
    usedItemCodeMaxCond: number,
    purchaseTime: string
}
export const sealMetaverseHistoryAtom = atom<ISealMetaverseHistory[]>([]);


// export interface IZeroEternalLoveDailyReward {
//     purchaseId: number,
//     packageType: string,
//     packageName: string,
//     packagePictureUrl: string,
//     itemCode: string,
//     price: number,
//     usedItemCodeCounts: number,
//     usedItemCodeMaxCond: number,
//     purchaseTime: string
// }
export const zeroEternalLoveDailyRewardAtom = atom<IPresalePackage[]>(OBT_DAILY_REWARD);
export const zeroPresalePackagesAtom = atom<IPresalePackage[]>([]);
export const zeroVotePackagesAtom = atom<IPresalePackage[]>([]);
export const zeroVoteCountAtom = atom<IVote[]>([]);

export const zeroPremiumDailyPackagesAtom = atom<IPresalePackage[]>(OBT_DAILY_REWARD_PREMIUM);


export const zeroBigbroPackagesAtom = atom<IPresalePackage[]>([]);
export const zeroBigbroPremiumPackagesAtom = atom<IPresalePackage[]>([]);


export const zeroPcPackagesAtom = atom<IPresalePackage[]>([]);

