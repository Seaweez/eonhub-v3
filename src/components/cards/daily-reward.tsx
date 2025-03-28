import type { FC } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import Button from '../base/button'
import IconArrow from '../icons/icon-arrow'
import TextOutlinePack from '../text-outline-pack'
import { cn } from '@/utils/styling'
import { IEonUserDetail, IPresalePackage, SEAL_METAVERSE_GAME_ID, ZERO_ETERNAL_LOVE_GAME_ID } from '@/types/eonhub'
import Swal from 'sweetalert2'
import { useWalletSigner } from '@/hooks/useWeb3Token'
import { useWeb3React } from '@web3-react/core'
import { providers } from 'ethers'
import { useCookies } from 'react-cookie'
import { eonhubApiCreate } from '@/axios'
import userService from '@/services/user.service'
import { toast } from 'react-toastify'
import UserService from '@/services/user.service'
import MarketService from '@/services/market.service'
import useSound from 'use-sound'
import { SealMetaverseAccountInfoAtom, ZeroEternalLoveAccountInfoAtom, googleAuthTokenAtom, isLoadingAtom, selectedServerAtom } from '@/atoms/eonhub'
import { useAtom } from 'jotai'
import { ZeroSelectServer } from '../zero-eternal-love/inventoryWhitelist'

interface IDailyRewardCardProps {
    className?: string
    id: number
    name: string
    image: string
    price: number
    detail: IPresalePackage
    gameId: number
    isActive?: boolean
}

// const pack = {
//   1: SoloPackText,
//   2: DuoPackText,
//   3: KingPackText,
// }

const DailyRewardCard: FC<IDailyRewardCardProps> = ({ className, id, name, image, price, detail, gameId, isActive }) => {
    // _Memo
    // TODO: เป็นแค่ตัวอย่าง
    // const renderLabel = useMemo(() => {
    //   const Text = pack[id] as typeof SoloPackText
    //   return (
    //     <Text
    //       className={cn({
    //         'text-[28px] lg:text-[23px]': isActive,
    //         'text-[23px]': !isActive,
    //       })}
    //       strokeWidth={10}
    //     />
    //   )
    // }, [id, isActive])

    const userService = new UserService();
    const marketService = new MarketService()
    const { library, account, chainId, activate, deactivate } = useWeb3React();

    const { sign: signWallet } = useWalletSigner(
        library as providers.Web3Provider
    );

    // const [cashSpendSound] = useSound(
    //     '/images/sound/Cash_Register.mp3',
    //     { volume: 1.00 }
    // );

    const [isLoading, setisLoading] = useAtom(isLoadingAtom);

    const [sealMetaverseAccountInfo, setSealMetaverseAccountInfo] = useAtom(SealMetaverseAccountInfoAtom);
    const [zeroEternalLoveAccountInfo, setZeroEternalLoveAccountInfo] = useAtom(ZeroEternalLoveAccountInfoAtom);

    const [googleOAuthToken, setGoogleOAuthToken] = useAtom(googleAuthTokenAtom);

    const onClaimButtonClick = async () => {
        if (!userCookie?.token) return toast.error(`Please login with Google`);

        userService.fetchZeroInfo(userCookie?.token, setCookie, removeCookie, setZeroEternalLoveAccountInfo, selectedServer.gameId, selectedServer.serverID).then((res: any) => {
            const zeroCharNames = res?.data?.data?.characterNames || []
            if (!zeroCharNames) return
            Swal.fire({
                title: `Claim ${detail.packageName}`,
                input: "radio",
                inputOptions: gameId === ZERO_ETERNAL_LOVE_GAME_ID ? zeroCharNames.map(char => char.characterName) :
                    [sealMetaverseAccountInfo?.gameUserId],
                showCancelButton: true,
                confirmButtonText: "Confirm",
                confirmButtonColor: 'rgb(253 120 118 / 1.0)',
                showLoaderOnConfirm: true,
                inputValidator: (value) => {
                    const result = gameId === ZERO_ETERNAL_LOVE_GAME_ID ? zeroEternalLoveAccountInfo?.characterNames[value] : sealMetaverseAccountInfo?.characterNames[value]
                    return new Promise((resolve) => {
                        if (value === null) {
                            gameId === ZERO_ETERNAL_LOVE_GAME_ID ? resolve("Please select a character.") : resolve("Please select an account.");
                        } else {
                            const req = gameId === ZERO_ETERNAL_LOVE_GAME_ID ?
                                marketService.topupZeroEternalLovePackage(gameId, userCookie?.token, `token`, detail, result?.characterId, selectedServer.serverID) :
                                marketService.topupSealMetaversePackage(gameId, userCookie?.token, `token`, detail)
                            resolve();
                        }
                    });
                },
                preConfirm: async (amount) => {
                    try {


                        return amount
                    } catch (error) {
                        Swal.showValidationMessage(`
                    Request failed: ${error}
                  `);
                    }
                },
                allowOutsideClick: () => !Swal.isLoading()
            }).then((result) => { });
        })

    }


    const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
    const userCookie: IEonUserDetail = cookie["eonhub-auth"];
    const eonhubAPI = eonhubApiCreate(userCookie?.token);
    const [selectedServer, setSelectedServer] = useAtom(selectedServerAtom);




    return (
        <div
            className={cn(
                {
                    // 'pt-[100px] lg:pt-[80px]': isActive,
                    'lg:pt-[80px]': isActive,
                    'pt-[80px]': !isActive,
                },
                className,
            )}
        >
            <div
                className={cn(
                    `relative rounded-[40px] border border-primary p-2`,
                    `before:absolute before:inset-2 before:-z-10 before:rounded-[32px] before: `,
                    {
                        'before:bg-primary/20 border-white bg-neutral-100': !isActive,
                        'before:bg-primary lg:before:bg-primary/20 text-white': isActive,
                    },
                )}
            >
                <Image
                    src={image}
                    alt=""
                    width={250}
                    height={250}
                    className={cn(`mx-auto -mt-[80px] h-[160px] w-[180px]`, {
                        // '-mt-[100px] h-[200px] w-[200px] lg:-mt-[80px] lg:h-[160px] lg:w-[160px]': isActive,
                        // '-mt-[80px] h-[160px] w-[160px]': isActive,
                        // '-mt-[80px] h-[160px] w-[160px]': !isActive,
                    })}
                />

                <div className={cn(`px-8 pb-8 pt-4 `)}>
                    {/* {renderLabel} */}
                    <TextOutlinePack
                        text={name}
                        className={cn({
                            'h-[32px] lg:h-[24px] lg:stroke-width-5  ': isActive,
                            'h-[24px] stroke-width-5 ': !isActive,
                        })}
                    />

                    <div className="font-bold my-2 h-20 overflow-y-auto">
                        {detail?.packageDetails.map(item => <>
                            <div className={`flex gap-1 my-1 ${item.itemType == `DISPLAY` ? `` : `hidden`}`}>
                                <Image alt={``} className='h-8 my-auto' src={`${item.itemUrl}`} width={30} height={5} />
                                <div className="whitespace-nowrap my-auto">
                                    {item.itemAmount}{` ${item?.itemDescription}`}
                                </div>
                            </div>
                        </>)}
                    </div>

                    <div className={cn(`mt-6 flex items-center justify-between space-x-3`)}>
                        <span
                            className={cn(`text-2xl font-bold`, {
                                'text-white lg:text-foreground': isActive,
                            })}
                        >
                            {price}$
                        </span>
                        {(<Button onClick={onClaimButtonClick} variant="light" disabled={isActive} >
                            Claim
                        </Button>)}
                    </div>


                    <div className={` p-2 rounded-lg w-full mt-4 text-center font-bold ${isActive ? `bg-primary text-white border-white border-2` : ` shadow-md bg-white `}`}>{`DAY ${id + 1}`}</div>
                </div>
            </div>
        </div>
    )
}

export default DailyRewardCard
