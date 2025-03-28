export interface IZeroEternalLoveAccountInfo {
    gameUserId: string,
    characterNames: IZeroEternalLoveCharInfo[],
}

export interface IZeroEternalLoveCharInfo{
    characterId: number,
    characterName: string,
    level: number,
    isOnline: boolean,
    zeny: number
}