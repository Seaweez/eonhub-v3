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
import { SealMetaverseAccountInfoAtom, ZeroEternalLoveAccountInfoAtom, selectedServerAtom } from '@/atoms/eonhub'
import { useAtom } from 'jotai'
import Countdown from 'react-countdown'
import { zeroVoteCountAtom } from '@/atoms/seal'

interface IPollingPackProps {
    className?: string
    id: number
    name: string
    image: string
    price: number
    detail: IPresalePackage
    gameId: number
    isActive?: boolean
    closeDate?: Date
}

// const pack = {
//   1: SoloPackText,
//   2: DuoPackText,
//   3: KingPackText,
// }

const PollingPack: FC<IPollingPackProps> = ({ className, id, name, image, price, detail, gameId, isActive, closeDate }) => {
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

    const [sealMetaverseAccountInfo, setSealMetaverseAccountInfo] = useAtom(SealMetaverseAccountInfoAtom);
    const [zeroEternalLoveAccountInfo, setZeroEternalLoveAccountInfo] = useAtom(ZeroEternalLoveAccountInfoAtom);
    const [selectedServer, setSelectedServer] = useAtom(selectedServerAtom);


    const userService = new UserService();
    const marketService = new MarketService()
    const { library, account, chainId, activate, deactivate } = useWeb3React();

    const { sign: signWallet } = useWalletSigner(
        library as providers.Web3Provider
    );


    const onBuyButtonClick = async () => {

        userService.fetchZeroInfo(userCookie?.token, setCookie, removeCookie, setZeroEternalLoveAccountInfo, selectedServer?.gameId, selectedServer.serverID).then((res: any) => {
            const zeroCharNames = res?.data?.data?.characterNames || []
            if (!zeroCharNames) return
            Swal.fire({
                title: `Vote ${detail.packageName}`,
                input: "radio",
                inputOptions: gameId === ZERO_ETERNAL_LOVE_GAME_ID ? zeroCharNames.map(char => char.characterName) :
                    [sealMetaverseAccountInfo?.gameUserId],
                showCancelButton: true,
                confirmButtonText: "Confirm",
                confirmButtonColor: 'rgb(253 120 118 / 1.0)',
                showLoaderOnConfirm: true,
                inputValidator: (value) => {
                    const result = gameId === ZERO_ETERNAL_LOVE_GAME_ID ? zeroCharNames[value] : sealMetaverseAccountInfo?.characterNames[value]
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

    const [zeroVoteCount, setZeroVoteCount] = useAtom(zeroVoteCountAtom);

    const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
    const userCookie: IEonUserDetail = cookie["eonhub-auth"];
    const eonhubAPI = eonhubApiCreate(userCookie?.token);


    return (
        <div
            className={cn(
                {
                    'pt-[100px] lg:pt-[80px]': isActive,
                    'pt-[80px]': !isActive,
                },
                className,
            )}
        >

            <div
                className={cn(
                    `relative rounded-[40px] border border-secondary p-2`,
                    `before:absolute before:inset-2 before:-z-10 before:rounded-[32px] before:shadow-pack`,
                    {
                        'before:bg-secondary/20': !isActive,
                        'before:bg-secondary lg:before:bg-secondary/20': isActive,
                    },
                )}
            >
                <Image
                    src={image}
                    alt=""
                    width={250}
                    height={250}
                    className={cn(`mx-auto drop-shadow-pack`, {
                        '-mt-[100px] h-[200px] w-[200px] lg:-mt-[80px] lg:h-[160px] lg:w-[160px]': isActive,
                        '-mt-[80px] h-[160px] w-[160px]': !isActive,
                    })}
                />

                <div className={cn(`px-8 pb-8 pt-4`)}>
                    {/* {renderLabel} */}
                    <TextOutlinePack
                        text={name}
                        className={cn({
                            'h-[32px] lg:h-[24px] lg:stroke-width-5  ': isActive,
                            'h-[24px] stroke-width-5 ': !isActive,
                        })}
                    />

                    <div className="font- my-2 h-20 overflow-auto">
                        {detail.packageId === 187 ? (<>
                            <div className={`flex gap-1 my-1 font-bold`}>
                                <div className="truncate  overflow-auto my-auto">
                                    Allow Travel After 28 Days
                                </div>
                            </div>
                            <div className={`flex gap-1 my-1 font-bold `}>
                                <div className="truncate  overflow-auto my-auto">
                                    EXP x4 | JOB x4
                                </div>
                            </div>
                            <div className={`flex gap-1 my-1  `}>
                                <div className="truncate  overflow-auto my-auto">
                                    DROP x2 CARD x2 MVP x3
                                </div>
                            </div>
                        </>) : (<>
                            <div className={`flex gap-1 my-1  `}>
                                <div className="truncate  overflow-auto my-auto font-bold">
                                    Allow Travel After 0 Days
                                </div>
                            </div>
                            <div className={`flex gap-1 my-1 font-bold `}>
                                <div className="truncate  overflow-auto my-auto">
                                    EXP x2 | JOB x2
                                </div>
                            </div>
                            <div className={`flex gap-1 my-1  `}>
                                <div className="truncate  overflow-auto my-auto">
                                    DROP x2 CARD x2 MVP x3
                                </div>
                            </div>
                        </>)}
                        {/* {detail?.packageDetails.map(item => (item?.itemDescription == `Premium` || item?.itemType != `DISPLAY`) ? (<></>) : (<>
                            <div className={`flex gap-1 my-1  `}>
                                <Image alt={``} className='h-8 my-auto' src={`${item.itemUrl}`} width={30} height={5} />
                                <div className="truncate  overflow-auto my-auto">
                                    x{item?.itemAmount} {item?.itemDescription}
                                </div>
                            </div>
                        </>))} */}
                        {/* <div className={`flex gap-1 my-1  `}>
                            <div className="truncate  overflow-auto my-auto">
                                Bought: {zeroVoteCount.find(e => e.packageId === detail.packageId).count}
                            </div>
                        </div> */}
                    </div>

                    <div className={cn(`mt-6 flex items-center justify-between space-x-3`)}>
                        <span
                            className={cn(`text-2xl grid font-bold`, {
                                'text-white lg:text-foreground': isActive,
                            })}
                        >

                            <span
                                className={cn(`text-2xl font-bold`, {
                                    'text-white lg:text-foreground': isActive,
                                })}
                            >
                                {price.toLocaleString('en-US', {})} Zeny
                            </span>

                            <span
                                className={cn(`text-sm font-bold `, {
                                    'text-white lg:text-foreground': isActive,
                                })}
                            >
                                Bought: {zeroVoteCount.find(e => e.packageId === detail.packageId)?.count}
                            </span>
                        </span>
                        <Button onClick={() => { return; }} disabled variant="light"  >
                            {/* <Link href={`/pack/${id}`}> */}
                            DONE <IconArrow className={cn(`ml-4 text-2xl text-secondary`)} />
                            {/* </Link> */}
                        </Button>
                    </div>
                    {/* <div className="flex justify-end"> */}
                    {closeDate ? <Countdown className='text-white mx-auto mt-1' date={closeDate} /> : <></>}
                    {/* </div> */}
                </div>
            </div>
        </div>
    )
}

export default PollingPack
