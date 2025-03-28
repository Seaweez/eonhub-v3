
export interface IEonUserDetail {
    email: string;
    eonPoint: string;
    lastLoginTime: string;
    referralPoint: number;
    userId: number;
    userParty: string;
    userStatus: string;
    username: string;
    walletAddress: string;
    refCode: string | undefined;
    shortenUrl: string | undefined;
    token: string;
    totalUsedRefCodeCount: number;
    bonusPoint: number;
}
// "userId": 5,
// "username": "eonhub888@gmail.com",
// "userStatus": "ACTIVE",
// "userParty": "ADMIN",
// "email": "eonhub888@gmail.com",
// "lastLoginTime": "2024-05-21T13:08:17.000Z",
// "eonPoint": 18800.169999999995,
// "bonusPoint": 0,
// "walletAddress": "0x43c067b955ad3f32d27282e506465f20303589e6",
// "reservedEonPoint": "0",
// "totalUsedRefCodeCount": 0

// Pre-Sale Packages
export interface IPresalePackage {
    isPurchaseable: boolean;
    packageDescription: string;
    packageDetails: IPackageDetail[];
    packageId: number;
    packageName: string;
    packageType: string;
    price: number;
    priceZeny?: number;
    packagePictureUrl: string;
    isFirstTopup?: boolean;
    totalPurchaseCount?: number;
    totalPurchaseLimit?: number;
}

export interface IPackageDetail {
    itemAmount: number;
    itemDescription: string;
    itemId: string;
    itemUrl: string
    itemType?: string;
}


export enum TOKEN_LIST {
    USDT = 'USDT',
    EON = 'EON',
    BNB = 'BNB'
}

export const SEAL_METAVERSE_GAME_ID = 1;
export const ZERO_ETERNAL_LOVE_GAME_ID = 2;
export const RO_ZERO_PC_GAME_ID = 3;

export interface IVote {
    count: number;
    packageId: number;
}


export interface IClaimedItem {
    itemCode: string;
    claimedAt: string;
    expireAt: string | null;
    isUsable: boolean;
}

export interface IPackageStreamer {
    claimedItemCodes: IClaimedItem[];
    dailyCount: number;
    dailyLimit: number;
    isClaimable: boolean;
    packageId: number;
    packageName: string;
    weeklyCount: number;
    weeklyLimit: number;
}
