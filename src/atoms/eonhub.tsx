import { MOCK_RECENTLY_SOLD } from "@/constants/recentlySold";
import { IUserWalletHistory, InventoryResponseDTO, ItemDetail, MarketHistoryResponse, MarketItemResponseDTO, MarketList, MarketPlaceTaxResponse, MyLotteryResponseDTO, UserInfoResponseDTO } from "@/services/market.service";
import { IEonUserDetail, IPackageStreamer, IPresalePackage } from "@/types/eonhub";
import { ISealAccountInfo } from "@/types/seal";
import { IZeroEternalLoveAccountInfo } from "@/types/zero-eternal-love";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// - Google Login RESPONSE
export interface IGoogleOAuthResponse {
    access_token: string;
    authuser: string;
    expires_in: number;
    prompt: string;
    scope: string;
    token_type: string;
}

// - Google UserInfo
export interface IGoogleUserInfoResponse {
    email: string;
    family_name: string;
    given_name: string;
    id: string;
    locale: string;
    name: string;
    picture: string;
    verified_email: boolean;
}

// GoogleAuthUserInfo
export interface IGoogleAuthUserInfo {
    email: string;
    family_name: string;
    given_name: string;
    id: string;
    locale: string;
    name: string;
    picture: string;
    verified_email: boolean;
    userInfo: IGoogleUserInfoResponse
}

export const GoogleAuthUserInfoInitValue = {
    id: "",
    email: "",
    verified_email: true,
    name: "",
    given_name: "",
    family_name: "",
    picture: "",
    locale: "",
    // userInfo: undefined
} as IGoogleAuthUserInfo;
export const GoogleAuthUserInfoAtom = atom<IGoogleAuthUserInfo | null>(null);



// Seal Info
// export interface IEonUserDetail {
//     email: string;
//     eonPoint: string;
//     lastLoginTime: string;
//     referralPoint: number;
//     userId: number;
//     userParty: string;
//     userStatus: string;
//     username: string;
//     walletAddress: string;
//     refCode: string | undefined;
//     shortenUrl: string | undefined;
//     token: string;
// }

export const eonhubUserDetailAtomInitValue = {
    email: "",
    eonPoint: "",
    lastLoginTime: "",
    referralPoint: 0,
    userId: 0,
    userParty: "",
    userStatus: "",
    username: "",
    walletAddress: "",
    refCode: "",
    shortenUrl: "",
    bonusPoint: 0,
    totalUsedRefCodeCount: 0
} as IEonUserDetail;
export const eonhubUserDetailAtom = atom<IEonUserDetail | undefined>(undefined);


export const usdtContractAtom = atom<any | undefined>(``);
export const usdtBalanceAtom = atom<string | undefined>(``);
export const web3TokenAtom = atom("");

export const presaleZeroEternalLoveAtom = atom<IPresalePackage | undefined>(undefined);
export const isLoadingAtom = atom(false);

const initialSealAccountData = {
    gameUserId: '',
    characterNames: [],
    cpAmount: 0,
    cegelAmount: 0,
    topUpCredit: 0,
    highestLevel: 0
}

export const initialZeroEternalLoveAccountData = {
    gameUserId: '',
    characterNames: [],
}
export const SealMetaverseAccountInfoAtom = atom<ISealAccountInfo>(initialSealAccountData);
export const ZeroEternalLoveAccountInfoAtom = atom<IZeroEternalLoveAccountInfo>(initialZeroEternalLoveAccountData);
export const ZeroPCAccountInfoAtom = atom<any>(initialZeroEternalLoveAccountData);

export const inventoryZeroAtom = atom<InventoryResponseDTO[]>([]);
export const inventoryInGameWhitelistZeroAtom = atom<MarketItemResponseDTO>({ characterBag: [] });
export const marketZeroInventoryAtom = atom<UserInfoResponseDTO[]>([]);
export const marketZeroAtom = atom<MarketList[]>([]);
export const userMarketListZeroAtom = atom<MarketList[]>([]);
export const userMarketHistoryZeroAtom = atom<MarketHistoryResponse[]>([]);
export const marketHistoryZeroAtom = atom<any[]>(MOCK_RECENTLY_SOLD);
export const userWalletHistoryAtom = atom<IUserWalletHistory[]>([]);
export const displayMarketZeroHistoryAtom = atom(`Recommended`);

export const marketZeroTaxAtom = atom<MarketPlaceTaxResponse>({
    marketplaceTax: 0,
    totalReferralSystem: 0,
    totalTax: 0
});

export interface IEonhub_Ref_System {
    refCode: string;
    shortenUrl: string;
    referrer: string;
}
export const userRefcodeZeroAtom = atom({ refCode: ``, shortenUrl: ``, referrer: ``});
export const userRefcodeSealAtom = atom({ refCode: ``, shortenUrl: ``, referrer: `` });

export const googleAuthTokenAtom = atom(``);


export const selectedServerAtom = atom({ serverID: 0, serverName: ``, gameId: 0 });
export const isRefreshingAtom = atom(false); 
export const isHideMarketWalletAtom = atom(true);
export const selectedGameIdAtom = atom(0);


export const userMyLotteryAtom = atom<MyLotteryResponseDTO[]>([]);


export const isHideEonhubPanelAtom = atom(true);


export interface ZeroEternalTaxe { prviousTax: 0, currentTax: 0, last_update: 0 };
export const asia011IngameTaxAtom = atomWithStorage("asia011IngameTax",{ prviousTax: 0, currentTax: 0, last_update: 0 });
export const asia012IngameTaxAtom = atomWithStorage("asia012IngameTax",{ prviousTax: 0, currentTax: 0, last_update: 0});
export const asia013IngameTaxAtom = atomWithStorage("asia012IngameTax",{ prviousTax: 0, currentTax: 0, last_update: 0});

export const IPackageStreamerAtom = atom<IPackageStreamer[] | undefined>(undefined);