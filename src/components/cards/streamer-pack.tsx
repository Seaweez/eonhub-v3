import { useEffect, useState, type FC } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import Button from '../base/button'
import IconArrow from '../icons/icon-arrow'
import TextOutlinePack from '../text-outline-pack'
import { cn } from '@/utils/styling'
import { IEonUserDetail, IPackageStreamer, IPresalePackage, SEAL_METAVERSE_GAME_ID, ZERO_ETERNAL_LOVE_GAME_ID } from '@/types/eonhub'
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
import { IPackageStreamerAtom, SealMetaverseAccountInfoAtom, ZeroEternalLoveAccountInfoAtom, selectedServerAtom, userRefcodeZeroAtom } from '@/atoms/eonhub'
import { useAtom } from 'jotai'
import Countdown from 'react-countdown'
import { luckyPackDeadline } from '@/constants/rom'
import { zeroPresalePackagesAtom } from '@/atoms/seal'
import { user } from '@nextui-org/react'

interface IStreamerPackCardProps {
    className?: string
    id: number
    name: string
    // image: string
    // price: number
    // detail: IPresalePackage
    gameId: number
    isActive?: boolean
    closeDate?: Date
    item: IPackageStreamer
}

// const pack = {
//   1: SoloPackText,
//   2: DuoPackText,
//   3: KingPackText,
// }

const StreamerPackCard: FC<IStreamerPackCardProps> = ({ className, id, name, gameId, isActive, closeDate, item }) => {
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
    const [userRefcodeZero, setUserRefcodeZero] = useAtom(userRefcodeZeroAtom)
    const [packageStreamer, setPackageStreamer] = useAtom(IPackageStreamerAtom);

    const userService = new UserService();
    const marketService = new MarketService()
    const { library, account, chainId, activate, deactivate } = useWeb3React();

    const { sign: signWallet } = useWalletSigner(
        library as providers.Web3Provider
    );

    const [selectedServer, setSelectedServer] = useAtom(selectedServerAtom);

    const [zeroPresalePackages, setZeroPresalePackages] = useAtom(zeroPresalePackagesAtom)
    const [currentItem, setCurrentItem] = useState<IPresalePackage | undefined>(undefined)

    useEffect(() => {
        const item = zeroPresalePackages.find(item => item.packageId === id)
        if (item) {
            setCurrentItem(item)
        }
    }, [zeroPresalePackages])

    const onBuyButtonClick = async () => {

        if (userCookie?.walletAddress && !account) return toast.error(`Please connect your wallet`);
        if (!userCookie?.token) return toast.error(`Please login with Google`);
        let token = '';
        if (userCookie?.walletAddress) {
            token = await signWallet(); // signWallet is a function from useWalletSigner hook
        }
        // const user = marketService.getUserGameInfo(gameId, userCookie?.token, () => { })


        // const inputType = gameId === ZERO_ETERNAL_LOVE_GAME_ID ? ({
        //     input: "radio",
        //     inputOptions: sealMetaverseAccountInfo?.characterNames.map(name => name),
        // }) : ({

        // })

        Swal.fire({
            title: `Purchase ${item.packageName}`,
            input: "radio",
            // inputOptions: gameId === ZERO_ETERNAL_LOVE_GAME_ID ? zeroEternalLoveAccountInfo?.characterNames.map(char => char.characterName) :
            //     [sealMetaverseAccountInfo?.gameUserId],
            showCancelButton: true,
            confirmButtonText: "Confirm",
            confirmButtonColor: 'rgb(253 120 118 / 1.0)',
            showLoaderOnConfirm: true,
            inputValidator: (value) => {
                const result = gameId === ZERO_ETERNAL_LOVE_GAME_ID ? zeroEternalLoveAccountInfo?.characterNames[value] : sealMetaverseAccountInfo?.characterNames[value]

                return new Promise((resolve) => {
                    // if (value === null) {
                    //     gameId === ZERO_ETERNAL_LOVE_GAME_ID ? resolve("Please select a character.") : resolve("Please select an account.");
                    // } else {
                    marketService.claimStreamerPackage(selectedServer?.gameId, userCookie?.token, token, item, null, selectedServer.serverID).then(res => {
                        userService.fetchUserInfo(userCookie?.token, setCookie, removeCookie, () => { });
                        marketService.getStreamerPacks(userCookie?.token, selectedServer.gameId, setPackageStreamer)
                    })
                    resolve();
                    // }
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
    }

    function isExpired(dateString: string): boolean {
        const buddhistYearOffset = 543; // Difference between Buddhist and Gregorian year

        // Split the date and time parts
        const [datePart, timePart] = dateString?.split(' ');

        if (!datePart || !timePart) {
            throw new Error("Invalid date format");
        }

        // Split the date part (day/month/year)
        const [day, month, buddhistYear] = datePart.split('/').map(Number);

        if (!day || !month || !buddhistYear) {
            throw new Error("Invalid date format");
        }

        // Adjust the year to the Gregorian calendar
        const year = buddhistYear - buddhistYearOffset;

        // Create a date object
        const dateTimeString = `${year}-${month}-${day}T${timePart}`;
        const itemDate = new Date(dateTimeString);

        // Get the current date
        const currentDate = new Date();

        // Check if the item date is in the past
        return itemDate.getTime() < currentDate.getTime();
    }


    const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
    const userCookie: IEonUserDetail = cookie["eonhub-auth"];
    const eonhubAPI = eonhubApiCreate(userCookie?.token);

    // const isDeadlineActive = name.includes(`Lucky`) ? true : false;

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
                {/* <Image
                    src={image}
                    alt=""
                    width={250}
                    height={250}
                    className={cn(`mx-auto drop-shadow-pack`, {
                        '-mt-[100px]   lg:-mt-[80px]  ': isActive,
                        '-mt-[80px]  ': !isActive,
                    })}
                /> */}


                <div className={cn(`px-8 pb-8 pt-4`)}>
                    {/* {renderLabel} */}
                    <TextOutlinePack
                        text={name}
                        className={cn({
                            'h-[32px] lg:h-[24px] lg:stroke-width-5 ': isActive,
                            'h-[24px] stroke-width-5 ': !isActive,
                        })}
                    />

                    <div className={` my-2 max-h-40 overflow-auto`}>
                        {item?.claimedItemCodes?.map(item => (<>
                            <div className={`flex gap-1 my-2 `}>
                                <div className={`truncate  overflow-auto my-auto  ${item?.isUsable ? `text-white`:``}`}>
                                    {item?.itemCode}
                                </div>
                            </div>
                        </>))}
                    </div>

                    <div className={cn(`mt-6 flex items-center justify-between space-x-3`)}>
                        <span
                            className={cn(`text-2xl flex gap-2 font-bold`, {
                                'text-white lg:text-foreground': isActive,
                            })}
                        >

                            {/* <span
                                className={cn(`text-2xl font-bold`, {
                                    'text-white lg:text-foreground': isActive,
                                })}
                            >
                                {item?.dailyCount}
                            </span> */}

                            <span
                                className={cn(`text-sm font-bold`, {
                                    'text-white lg:text-foreground': isActive,
                                })}
                            >
                                Daily: {item?.dailyCount} / {item?.dailyLimit}
                            </span>
                            <span
                                className={cn(`text-sm font-bold`, {
                                    'text-white lg:text-foreground': isActive,
                                })}
                            >
                                Weekly: {item?.weeklyCount} / {item?.weeklyLimit}
                            </span>

                            {/* {userRefcodeZero?.referrer ? (<>
                                <div className="referral-activate">
                                    <span className={`inline-block ${`bg-green-400 text-white`} rounded-full px-3 py-1 text-sm font-semibold mx-auto`}>
                                        Discount +5%
                                    </span>
                                </div>
                            </>) : (<>
                                
                            </>)} */}
                        </span>

                    </div>

                    <div className="flex justify-center mt-4">
                        <Button onClick={onBuyButtonClick} variant="light"  >
                            {/* <Link href={`/pack/${id}`}> */}
                            Claim <IconArrow className={cn(`ml-4 text-2xl text-secondary`)} />
                            {/* </Link> */}
                        </Button>
                    </div>

                    {/* <div className="flex justify-end"> */}
                    {/* {closeDate ? <Countdown className='text-white mx-auto mt-1' date={closeDate} /> : <></>} */}
                    {/* <div className="flex text-white lg:text-secondary font-semibold mt-2 lg:mt-1">
                        {closeDate ? <Countdown className='  mr-1' date={closeDate} /> : <></>}
                        <div className="  ">- ({item?.dailyCount}/{item?.dailyLimit})</div>
                    </div> */}
                    {/* </div> */}
                </div>
            </div>
        </div>
    )
}

export default StreamerPackCard
