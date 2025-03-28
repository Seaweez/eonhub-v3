"use client";

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

import { useAtom } from "jotai";
import React, { FC, useEffect, useState } from "react";
import { useEthers } from "@usedapp/core";
import { eonhubApiCreate } from "../../axios";
import { useCookies } from "react-cookie";
import { IPackageStreamerAtom, SealMetaverseAccountInfoAtom, ZeroEternalLoveAccountInfoAtom, ZeroPCAccountInfoAtom, displayMarketZeroHistoryAtom, googleAuthTokenAtom, inventoryZeroAtom, isLoadingAtom, isRefreshingAtom, marketZeroInventoryAtom, selectedServerAtom, userRefcodeSealAtom, userRefcodeZeroAtom } from "@/atoms/eonhub";
import { sealMetaverseHistoryAtom, zeroEternalLoveHistoryAtom } from "@/atoms/seal";
import { IEonUserDetail, RO_ZERO_PC_GAME_ID, SEAL_METAVERSE_GAME_ID, ZERO_ETERNAL_LOVE_GAME_ID } from "@/types/eonhub";
import { cn } from "@/utils/styling";
import { useWalletSigner } from "@/hooks/useWeb3Token";
import MarketService from "@/services/market.service";
import UserService from "@/services/user.service";
import { providers } from "ethers";
import Swal from "sweetalert2";
import Image from 'next/image'
import IconArrowSquare from "@/components/icons/icon-arrow-square";
import Button from '@/components/base/button'
import { toast } from "react-toastify";
import { TopHeroSection } from "@/constants/homepage";
import { Pagination } from "swiper/modules";
import { SwiperSlide, Swiper } from "swiper/react";
import { IZeroEternalLoveCharInfo } from '@/types/zero-eternal-love';
import { useQRCode } from 'next-qrcode';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faLink } from '@fortawesome/free-solid-svg-icons';
import { useSearchParams } from 'next/navigation';
import Countdown from 'react-countdown';
import { RO_PC_SERVERS, ROM_SERVERS, ZeroSelectServer } from '@/components/zero-eternal-love/inventoryWhitelist';
import Footer from '../footer';
import { images } from '@/components/steamer/ImgStreamer';
import Carousel from 'react-multi-carousel';
import { responsive } from '../page';
import ZeroPresaleCard from '@/components/cards/zero-pc-presale-card';
import { roZeroPcPresaleDeadline } from '@/constants/rom';
import { ZERO_PC_PRESALE_MOCK } from '@/constants/zero-pc-presale';
import StreamerPackCard from '@/components/cards/streamer-pack';

export const DAI_TOKEN_ADDRESS = "0x6b175474e89094c44da98b954eedeac495271d0f";

function PackagesList() {
    const [hideUI, setHideUI] = useState(true);
    const { account, library } = useEthers();
    const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
    const userCookie: IEonUserDetail = cookie["eonhub-auth"];
    const eonhubAPI = eonhubApiCreate(userCookie?.token);
    const [zeroEternalLoveHistory, setZeroEternalLoveHistory] = useAtom(zeroEternalLoveHistoryAtom);
    const [isLoading, setisLoading] = useAtom(isLoadingAtom);

    const [inventoryZero, setInventoryZero] = useAtom(inventoryZeroAtom);

    const [sealMetaverseAccountInfo, setSealMetaverseAccountInfo] = useAtom(SealMetaverseAccountInfoAtom);
    const [zeroEternalLoveAccountInfo, setZeroEternalLoveAccountInfo] = useAtom(ZeroEternalLoveAccountInfoAtom);
    const [zeroPCAccountInfoAtom, setZeroPCAccountInfoAtom] = useAtom(ZeroPCAccountInfoAtom);
    const [packageStreamer, setPackageStreamer] = useAtom(IPackageStreamerAtom);
    
    const userService = new UserService();
    const marketService = new MarketService()

    const { sign: signWallet } = useWalletSigner(
        library as providers.Web3Provider
    );

    const [inputItemcodeZero, setInputItemcodeZero] = useState(``);
    const [inputItemcodeSeal, setInputItemcodeSeal] = useState(``);
    const [selectedServer, setSelectedServer] = useAtom(selectedServerAtom);

    const fetchStreamPacks = async () => {
      marketService.getStreamerPacks(userCookie?.token, selectedServer?.gameId,setPackageStreamer).then(res => {
      })
    }
    useEffect(()=>{
      console.log('packageStreamer: ',packageStreamer)
    },[packageStreamer])

    const fetchPurchaseHistory = async () => {
        const response = await eonhubAPI.get(
            `/api/package/${selectedServer?.gameId}/history?packageType=PRE_SALES`,
            {
                // token: codeResponse.access_token,
                // email: userInfoReq.data.email,
                // gameId: SealMetaverseGameID,
                // refererCode: refCode ? refCode : ``,
            }
        );
        if (response && response?.data && response?.data?.data) {
            const result = response?.data?.data || []
            setZeroEternalLoveHistory(result)
        }
    }

    const requestRedeemItemcode = async (code: string, character?: IZeroEternalLoveCharInfo) => {
        setisLoading(true);
        return await eonhubAPI.post(
            `api/package/apply`, {
            itemCode: code,
            characterId: character?.characterId,
            serverId: selectedServer.serverID,
            gameId: selectedServer.gameId
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userCookie?.token}`
            }
        },).then(res => {
            toast.success(`${res?.data?.status === 200 && `Redeem itemcode Succes`}`)

            setisLoading(false);
        }).catch(error => {
            toast.error(`${error?.response?.data?.message}`)

            setisLoading(false);
        })

    }

    const onRedeemConfirm = async (redeemGameId: number) => {

        if (isLoading) return toast.error(`Waiting for response!`);

        // const gameId = redeemGameId
        const gameId = selectedServer?.gameId;
        const requiredSelectChar = redeemGameId === ZERO_ETERNAL_LOVE_GAME_ID ? true : false;
        if (gameId === ZERO_ETERNAL_LOVE_GAME_ID) {
            if (!inputItemcodeZero) return toast.error('Itemcode not found')
            if (!zeroEternalLoveAccountInfo?.characterNames.length) return toast.error('Please create a character !')
        } else if (gameId === SEAL_METAVERSE_GAME_ID) {
            if (!inputItemcodeSeal) return toast.error('Itemcode not found')
        }

        Swal.fire({
            title: `Redeem ${`${userCookie?.email}`}`,
            input: "radio",
            inputOptions: requiredSelectChar ? zeroEternalLoveAccountInfo?.characterNames.map(char => char.characterName) :
                [sealMetaverseAccountInfo?.gameUserId],
            showCancelButton: true,
            confirmButtonText: "Confirm",
            confirmButtonColor: 'rgb(253 120 118 / 1.0)',
            showLoaderOnConfirm: true,
            inputValidator: (value) => {
                const result = requiredSelectChar ? zeroEternalLoveAccountInfo?.characterNames[value] : sealMetaverseAccountInfo?.characterNames[value]
                return new Promise((resolve) => {
                    if (value === null) {
                        requiredSelectChar ? resolve("Please select a character.") : resolve("Please select an account.");
                    } else {
                        if (requiredSelectChar) {
                            const req = requestRedeemItemcode(inputItemcodeZero, result).finally(() => {

                                const inventoryZero = marketService.getMyInventory(ZERO_ETERNAL_LOVE_GAME_ID, userCookie?.token)
                                    .then(res => {

                                        setInventoryZero(res)
                                    })
                                    .catch(err => {
                                        removeCookie(`eonhub-auth`)
                                    })

                                setisLoading(false);
                            })
                        } else {
                            requestRedeemItemcode(inputItemcodeSeal)
                        }
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
    }


    const [userRefcodeZero, setUserRefcodeZero] = useAtom(userRefcodeZeroAtom)
    const [userRefcodeSeal, setUserRefcodeSeal] = useAtom(userRefcodeSealAtom)
    const [googleOAuthToken, setGoogleOAuthToken] = useAtom(googleAuthTokenAtom)
    const [isRefreshing, setIsRefreshing] = useAtom(isRefreshingAtom)

    useEffect(() => {
        if (!userCookie || !userCookie?.token) return

        // requestSealUserInfo()
        // requestZeroUserInfo()

        // fetchPurchaseHistory()
        // fetchSealPurchaseHistory()

        if (!userRefcodeZero && googleOAuthToken) {
            userService.registerZeroRefCode(userCookie?.token, googleOAuthToken);
        } else {
            userService.fetchZeroRefCode(userCookie?.token, setCookie, removeCookie, setUserRefcodeZero);
        }


        // fetchPurchaseHistory();
        if (!userRefcodeSeal && googleOAuthToken) {
            // userService.registerSealRefCode(userCookie?.token, googleOAuthToken);
        }

        // userService.fetchSealRefCode(userCookie?.token, setCookie, removeCookie, setUserRefcodeSeal);

        // userService.fetchSealInfo(userCookie?.token, setCookie, removeCookie, setSealMetaverseAccountInfo);

    }, [userCookie])


    useEffect(() => {
        if (!userCookie || !userCookie?.token || !selectedServer.gameId) return
        fetchPurchaseHistory();
        fetchStreamPacks();
    }, [userCookie?.token, selectedServer])

    const [serverRo, setServerRo] = useState<string>('Click Select Your Game');
    const [ServerModal, setServierModal] = useState<boolean>(false);
    const handleClickServer = (server: string) => {
        // Update the value when the button is clicked
        setServerRo(server);
        // console.log(serverRo);
        setServierModal(!ServerModal);
    };
    const handleServierModal = () => {
        // Open the modal
        setServierModal(!ServerModal);
    };


    const [selectedDisplayHistory, setSelectedDisplayHistory] = useState(`usable-history`)
    const [historyType, setHistoryType] = useAtom(displayMarketZeroHistoryAtom);

    return (
        <>


            <div className='relative w-screen overflow-hidden'>


                <div className=" lg:h-screen w-screen overflow-hidden">
                    <div className="flex justify-center items-center h-full">
                        <img
                            src="/images/games/bg-redeem.png"
                            alt=""
                            className="object-cover object-center h-full lg:opacity-80"
                            style={{ objectPosition: '50% 50%' }}
                        />
                    </div>
                </div>


                <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center">
                    <div>
                        <h2 className={cn(`text-[64px] font-bold ${selectedServer?.serverName ? `text-gray-700` : ` `}  bg-white bg-opacity-85 backdrop-blur-sm   px-6 rounded-xl`, `lg:text-3xl`)}>ZERO Redeem Code</h2>


                    </div>
                    <div className="mt-4 w-full px-40 lg:px-10 flex flex-col justify-center items-center">
                        <div className={`min-w-[300px] flex items-center justify-center focus:outline-none focus:ring focus:ring-gray-700 duration-300 cursor-pointer border-4 border-white bg-white text-md bg-opacity-60 rounded-full px-10 py-2 h-15 backdrop-blur-lg text-center ${serverRo === 'Click Select Your Game' ? 'text-gray-500' : 'text-gray-700 font-bold border-gray-700'
                            }`} onClick={() => {
                                if (!userCookie?.token) return toast.error(`Please login with Google`);
                                handleServierModal()
                            }}>
                            {serverRo}
                        </div>

                        <div className={ServerModal ? 'w-screen h-100 text-center bg-none duration-300 z-40 scale-100 absolute ' : 'absolute scale-0'}>
                            <div className='lg:w-[300px] min-w-[500px] min-h-[300px] p-10 rounded-3xl relative  '>
                                <div className="absolute inset-0  flex items-center justify-center">
                                    <div className=" ">


{/* Games */}
<section className={cn(` shadow-inner  pb-20 shadow-sm  pt-24 `, `lg:py-10 `)}>
          <div className={cn(`container flex justify-center gap-4 overflow-auto`, `lg:!px-0`)}>
            {/* <Swiper
                autoplay={true}
                draggable={true}
                centeredSlides={true}
              slidesPerView={'auto'}
              breakpoints={{
                319: {
                  slidesOffsetBefore: 20,
                  slidesOffsetAfter: 20,
                },
                641: {
                  slidesOffsetBefore: 32,
                  slidesOffsetAfter: 32,
                },
                1025: {
                  slidesOffsetBefore: 0,
                  slidesOffsetAfter: 0,
                },
              }}
            > */}
              {[
                {
                    name: ROM_SERVERS[0].serverName,
                    game: ROM_SERVERS[0],
                    available: true,
                    href: `https://zeroeternalnexus.eonhub.games/`,
                    image: '/images/games/02.png',
                  },
                //   {
                //     name: ROM_SERVERS[1].serverName,
                //     game: ROM_SERVERS[1],
                //     available: true,
                //     href: `https://zero-rom.eonhub.games/`,
                //     image: '/images/games/02.png',
                //   },
                //   {
                //     name: ROM_SERVERS[2].serverName,
                //     game: ROM_SERVERS[2],
                //     available: true,
                //     href: `https://zero-rom.eonhub.games/`,
                //     image: '/images/games/02.png',
                //   },
                {
                  name: 'Tales Of ZERO - RO',
                  game: RO_PC_SERVERS[0],
                  available: true,
                  href: `https://zero-pc.eonhub.games/`,
                  image: '/images/games/toz-logo-edit.png',
                },
                // {
                //   name: 'Seal online',
                //   available: true,
                //   href: `https://www.sealonlinethai.com/`,
                //   image: '/images/games/seal-p2w.png',
                // },
                { name: '', available: false, href: `#`, image: '/images/games/wood-texture.jpg' },
                { name: '', available: false, href: `#`, image: '/images/games/wood-texture.jpg' },
                // { name: 'Getamped m', available: false, href: `#`, image: '/images/games/03.jpg' },
              ].map((game, gameIdx) => (
                <div
                  key={`game-slide-${gameIdx}`}
                  className={cn(`cursor-pointer self-center transition-all overflow-hidden `, {
                    // '!w-[30%] rounded-[48px] border border-border p-[10px] lg:!w-[256px]': game.available,
                    // '!w-[23.3333333333%]   border border-border p-[20px] lg:!w-[256px] ': !game.available,
                    // '!w-[23.3333333333%] shadow-xl lg:!w-[220px]': !game.available,
                  })}
                >
                  <div
                    onClick={() => {
                      // game.href && window.open(game.href)
                      setSelectedServer(game.game)
                      setServerRo(game?.game?.serverName);
                      handleServierModal()
                    }}
                    className={cn(`text-center transition-all duration-200 text-white ${selectedServer?.serverID == game?.game?.serverID ? `bg-neutral-700` : `bg-neutral-700/50 hover:-translate-y-1 hover:bg-neutral-900/75`}`, {
                      'rounded-[40px] border-[8px] border-border  p-2': game.available,
                      'bg-foreground': !game.available && gameIdx === 1,
                      'hidden': !game.available,
                    //   'bg-primary': !game.available && gameIdx === 2,
                    //   'bg-primary/75': !game.available && gameIdx === 3,
                    })}
                  >
                    <Image
                      src={game.image}
                      alt=""
                      width={304}
                      height={330}
                      className={cn(`aspect-[304/330] w-full object-cover border-2 `, {
                        'rounded-[26px]': game.available,
                        'opacity-50 ': !game.available && gameIdx === 1,
                        'opacity-10 ': !game.available && (gameIdx === 2 || gameIdx === 3),
                      })}
                    />
                    <div
                      className={cn(`py-3`, {
                        'absolute inset-0 flex flex-col items-center justify-center ': !game.available,
                        'drop-shadow-text': !game.available && gameIdx === 1,
                      })}
                    >
                      <div className={cn(`text-[32px] font-extrabold`, `lg:text-2xl`)}>{game.name}</div>
                      {game.available ? (
                        <>
                        
                          <div
                            className={cn(
                              `flex items-center justify-center space-x-2 text-2xl font-light`,
                              `lg:text-base`,
                            )}
                          >
                            <div className={cn(`h-4 w-4 rounded-full bg-success`)}></div>
                            {/* <span>Available now</span> */}
                          </div>
                          {/* <div
                          className={cn(
                            `flex items-center justify-center space-x-2 text-2xl font-light`,
                            `lg:text-base`,
                          )}
                        >
                          <span className="">
                            <button
                              type="button"
                              className="px-auto mt-2 rounded-2xl border-2 bg-secondary px-10 py-1 font-bold transition-all hover:scale-105 hover:shadow-lg"
                            >
                              Play NOW
                            </button>
                          </span>
                        </div> */}
                        </>
                      ) : (
                        <div className={cn(`text-2xl font-bold`, `lg:text-base`)}></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            {/* </Swiper> */}
          </div>
        </section>
                                        {/* รอ Map เอาชื่อ Server มาใส่ */}
                                        {/* <button
                                            className={cn(
                                                'focus:outline-none focus:ring py-2 px-5 rounded-xl',
                                                serverRo === 'Server 011' ? 'bg-gray-700 text-white font-bold scale-110' : 'bg-none border-2 border-black text-black'
                                            )}
                                            onClick={() => {
                                                // if (isRefreshing) return
                                                setSelectedServer(ROM_SERVERS[0]);
                                                handleServierModal();
                                                setServerRo(ROM_SERVERS[0].serverName);
                                            }}
                                        >
                                            New World
                                        </button>
                                        <button
                                            className={cn(
                                                'focus:outline-none focus:ring py-2 px-5 rounded-xl',
                                                serverRo === 'Server 012' ? 'bg-gray-700 text-white font-bold scale-110' : 'bg-none border-2 border-black text-black'
                                            )}
                                            // onClick={() => handleClickServer('Server 012')}
                                            onClick={() => {
                                                // if (isRefreshing) return
                                                setSelectedServer(ROM_SERVERS[1]);
                                                handleServierModal();
                                                setServerRo(ROM_SERVERS[1].serverName);
                                            }}
                                        >
                                            {ROM_SERVERS[1].serverName}
                                        </button>

                                        <button
                                            className={cn(
                                                'focus:outline-none focus:ring py-2 px-5 rounded-xl',
                                                serverRo === 'Server 012' ? 'bg-gray-700 text-white font-bold scale-110' : 'bg-none border-2 border-black text-black'
                                            )}
                                            // onClick={() => handleClickServer('Server 012')}
                                            onClick={() => {
                                                // if (isRefreshing) return
                                                setSelectedServer(RO_PC_SERVERS[0]);
                                                handleServierModal();
                                                setServerRo(RO_PC_SERVERS[0].serverName);
                                            }}
                                        >
                                            {RO_PC_SERVERS[0].serverName}
                                        </button> */}

                                        {/* <button
                                            className={cn(
                                                'focus:outline-none focus:ring py-2 px-5 rounded-xl',
                                                serverRo === 'Server 013' ? 'bg-gray-700 text-white font-bold scale-110' : 'bg-none border-2 border-black text-black'
                                            )}
                                            onClick={() => handleClickServer('Server 012')}
                                        >
                                            Coming Soon
                                        </button> */}


                                        {/* Add more buttons here */}
                                        {/* Add more buttons here */}
                                        {/* Add more buttons here */}
                                    </div>
                                </div>
                            </div>


                        </div>

                        {serverRo !== 'Click Select Your Game' ?
                            <input
                                type="text"
                                className="focus:outline-none focus:ring focus:ring-gray-700 duration-300 border-4 border-white bg-white text-gray-700 text-3xl lg:text-xl bg-opacity-60 rounded-full px-4 py-2 lg:text-md w-[1000px] lg:w-fit lg:h-fit backdrop-blur-lg text-center mt-5"
                                placeholder="Enter your redeem code"
                                onChange={e => setInputItemcodeZero(e?.target?.value)}
                            /> :
                            ""
                        }





                    </div>
                    {serverRo !== 'Click Select Your Game' ?
                        <button className='mt-4 bg-gray-700 text-white py-4 lg:py-2 px-2 w-full rounded-full max-w-[300px]'
                            onClick={() => onRedeemConfirm(TopHeroSection[0].gameId)}
                        >CONFIRM</button>
                        : ""}
                </div>

            </div>

            


            <div
                        className={cn(`mt-2 transition-all ${selectedServer?.gameId ? `scale-100`:`scale-0 hidden`} flex items-end px-20 space-x-12 max-w-full relative scrollable-content overflow-x-auto gap-4 `, `lg:gap-6  lg:items-center lg:space-x-0 lg:space-y-8`)}
                    >
                        <div className={cn(`text-center mb-[4rem] mt-0 lg:mb-0 lg:mt-[8rem] ${userCookie?.token?` scale-100`:`hidden scale-0`}`)}>
                            <h2 className={cn(`text-[64px] font-bold leading-tight text-[#ed6049]`, `lg:text-[32px]`)}>
                                {packageStreamer?.length ? `Streamer!` :``}
                            </h2>
                            {/* <div className={cn(`text-[40px] font-bold`, `lg:text-2xl`)}>for all packages</div> */}
                            <div className={cn(`text-[16px] text-center font-semibold my-4 ${packageStreamer?.length ? `scale-100`:`hidden scale-0`}`, `lg:text-md`)}>( {selectedServer?.serverName} | Available Packages )</div>
                        </div>
 
                        {packageStreamer ? packageStreamer?.map((presalePackage, index) => presalePackage?.packageName ? (
                            <StreamerPackCard
                                gameId={RO_ZERO_PC_GAME_ID}
                                // detail={presalePackage}
                                key={presalePackage.packageId}
                                id={presalePackage.packageId}
                                name={presalePackage.packageName}
                                // price={presalePackage.price / 10}
                                // image={presalePackage.packagePictureUrl}
                                item={presalePackage}
                                // isActive={presalePackage.isPurchaseable}
                                isActive={!presalePackage?.isClaimable}
                                className={cn(`w-full   `)}
                            closeDate={roZeroPcPresaleDeadline}
                            />
                        ) : (<></>)): []?.map((presalePackage, index) => presalePackage?.packageName ? (
                            <StreamerPackCard
                                gameId={RO_ZERO_PC_GAME_ID} 
                                key={presalePackage.packageId}
                                id={presalePackage.packageId}
                                name={presalePackage.packageName} 
                                item={presalePackage}
                                // isActive={presalePackage.isPurchaseable}
                                isActive={true}
                                className={cn(`w-full max-w-[400px] flex-1`)}
                            closeDate={roZeroPcPresaleDeadline}
                            />
                        ) : (<></>))}

                        </div>



            
            <section className={cn(`  transition-all ${selectedServer.serverID ? `translate-y-10` : `scale-0 hidden`}`, `lg:pt-navbar`)}>
                <Swiper
                    spaceBetween={0}
                    slidesPerView={1}
                    pagination={{
                        clickable: true,
                        el: '#hero-bullet-slide',
                    }}
                    autoplay={true}
                    loop={true} 
                    modules={[Pagination]}
                > 
                    {TopHeroSection.map((n, index) => (
                        <SwiperSlide key={`hero-slide-${n}`}>
                            <div
                                className={cn(
                                    `container relative   flex min-h-[573px] items-center hidden`,
                                    `lg:min-h-[auto] lg:flex-col-reverse lg:justify-center`,
                                )}
                            >
                                {/* Content */}

                                <div className="container my-8 flex flex-col md:flex-row  ">
                                    {/* Left side: Image */}


                                    {/* Right side: Content */}
                                    <div className="md:w-1/2 md:pl-8 flex flex-col justify-center">
                                        <div className="md:mt-6">
                                            <div className={`text-lg text-center font-bold bg-secondary ${selectedServer.serverID ? '' : 'bg-opacity-70'} text-white rounded-sm -mt-1 md:text-base`}>
                                                {/* Your content */}
                                            </div>

                                            <div className="mr-10 mt-6">
                                                <ZeroSelectServer />
                                            </div>

                                        </div>
                                        <div className={`mt-6 flex items-center ${selectedServer.serverID ? '' : 'hidden'} space-x-3 rounded-full border border-white md:mt-4 md:flex-col md:space-x-0 md:space-y-3 md:rounded-[32px]`}>
                                            <div className={`flex-1 overflow-hidden rounded-full bg-white px-6 shadow md:w-full`}>
                                                <input
                                                    type="text"
                                                    className="h-14 w-screen font-semibold text-foreground focus:outline-none"
                                                    placeholder="Enter your itemcode"
                                                    onChange={e => {
                                                        if (n?.gameId === ZERO_ETERNAL_LOVE_GAME_ID) {
                                                            setInputItemcodeZero(e?.target?.value)
                                                        } else {
                                                            setInputItemcodeSeal(e?.target?.value)
                                                        }
                                                    }}
                                                    required
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                variant="primary-outline"
                                                className="uppercase bg-secondary md:w-full md:justify-between"
                                                onClick={() => onRedeemConfirm(n?.gameId)}
                                            >
                                                CONFIRM <IconArrowSquare className="ml-4 text-2xl" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="container">
                                {/* <h2 className={cn(`text-[48px] font-bold leading-tight`, `lg:text-2xl`)}>
                                    Top-rated Streamers
                                </h2> */}
                                <Carousel
                                    swipeable={false}
                                    draggable={false}
                                    showDots={true}
                                    responsive={responsive}
                                    ssr={true} // means to render carousel on server-side.
                                    infinite={true}
                                    autoPlay={true}
                                    autoPlaySpeed={500}
                                    keyBoardControl={true}
                                    customTransition="all .5"
                                    transitionDuration={1000}
                                    containerClass="carousel-container min-h-[200px] max-w-[100%] py-8"
                                    removeArrowOnDeviceType={["tablet", "mobile"]}
                                    // deviceType={this.props.deviceType}
                                    dotListClass="custom-dot-list-style"
                                    itemClass="carousel-item-padding-40-px"
                                >
                                    {images?.map((image, index) => (
                                        <div key={index} className="h-40 relative w-40  ">
                                            <img
                                                className="mt-5 hover:mt-0   border border-gray-200 rounded-lg hover:rounded-2xl inset-0 w-full h-full object-cover hover:scale-110 duration-150 cursor-pointer rounded-lg"
                                                src={image.src}
                                                alt={image.alt}
                                                onClick={() => window.location.href = image.href}
                                            />
                                        </div>
                                    ))}
                                </Carousel>
                            </div>

                            <RefferalCode gameId={n.gameId} />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Bullet */}
                {/* <div id="hero-bullet-slide" className={cn(`container`, `lg:mt-4 lg:flex lg:justify-center`)}></div> */}
            </section>



            <div className="container">
                <section className={cn(`py-16`, `lg:py-10 ${!zeroEternalLoveHistory?.length && `hidden`}`)}>
                    {/* <h2 className="font-bold mb-10 text-center">
                        Purchase History
                    </h2>
                    <table className="table-fixed mt-5 w-full text-center">
                        <thead className="border-[1px]">
                            <tr className="mx-auto">
                                <th className=" lg:block"></th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Itemcode</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody className="mt-10 max-h-[4rem]">
                            {zeroEternalLoveHistory?.filter(e => e.isUseable)?.map(item => (
                                <tr className={`text-xs overflow-auto my-4 border-[1px] ${item.isUseable ? `` : `text-red-500`}`} key={`${item.purchaseId}-${item.purchaseTime}`}>
                                    <div className="text-center">
                                        <img src={`${item?.packagePictureUrl}`} alt={`${item?.packagePictureUrl}`} className="mx-auto max-h-20" />
                                    </div>
                                    <td className="hidden lg:block"><img src={`${item?.packagePictureUrl}`} alt={`${item?.packagePictureUrl}`} className="mx-auto w-8 h-8" /></td>
                                    <td className="px-2">{item?.packageName}</td>
                                    <td className="px-2">{item?.price}</td>
                                    <td className={`px-2 blur cursor-pointer hover:blur-0`}>{item?.itemCode}</td>
                                    <td className="px-2">{item?.purchaseTime}</td>

                                </tr>
                            ))}
                        </tbody>
                    </table> */}
                    <div className="rounded-xl  p-10">
                        <div className={`flex rounded-xl my-4 bg-info border-2 pt-4 w-fit text-white rounded-tr-2xl transition-all ${zeroEternalLoveHistory?.length || zeroEternalLoveHistory?.length ? `scale-100` : `scale-0`}`}>
                            <div className="relative">
                                <h2 className={`text-center mb-4  mx-4 cursor-pointer ${selectedDisplayHistory == `usable-history` ? `font-bold` : ``}`}
                                    onClick={() => setSelectedDisplayHistory(`usable-history`)}>Usable History</h2>
                            </div>
                            <div className="flex">
                                <h2 className={`text-center   mx-4 cursor-pointer ${selectedDisplayHistory == `applied-history` ? `font-bold` : ``}`}
                                    onClick={() => setSelectedDisplayHistory(`applied-history`)}>Applied History</h2>

                                <div className={`text-sm font-medium text-center   border- border-gray-200 transition-all ${selectedDisplayHistory == `market-history` ? `scale-100` : `-translate-x-full scale-x-0`}`}>
                                    <ul className="flex flex-wrap justify-center -mb-px -mb-4">
                                        <li className="me-2">
                                            <div onClick={() => { setHistoryType(`BUY`) }} className={`cursor-pointer inline-block px-4  border-2 rounded-full hover:text-white hover:font-bold hover:border-white pb-[2px] ${historyType === `BUY` ? `active text-white  border-white   shadow-md` : ` border-transparent`}`}>Buy</div>
                                        </li>
                                        <li className="me-2">
                                            <div onClick={() => { setHistoryType(`SELL`) }} className={`cursor-pointer inline-block px-4  border-2 rounded-full hover:text-white hover:font-bold hover:border-white  pb-[2px] ${historyType === `SELL` ? `active text-white  border-white   shadow-md` : ` border-transparent`}`} aria-current="page">Sell</div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* xxxxxxx */}
                        {zeroEternalLoveHistory && zeroEternalLoveHistory?.length && selectedDisplayHistory == `usable-history` ? (<>
                            {/* <h2 className="text-center font-bold my-4">Wallet History</h2> */}
                            <div className="relative overflow-x-auto sm:rounded-lg max-h-80 ">
                                <table className="w-full mx-auto overflow-x-auto shadow-md text-sm text-left rtl:text-right  rounded-2xl border-2">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50    ">
                                        <tr className=''>
                                            <th scope='col' className={`px-6 py-3`}>Type</th>
                                            <th scope='col' className={`px-6 py-3`}>Amount</th>
                                            <th scope='col' className={`px-6 py-3`}>Status</th>
                                            <th scope='col' className={`px-6 py-3`}>Destination</th>
                                            <th scope='col' className={`px-6 py-3`}>Created</th>
                                            {Object.keys(history).map(historyKey =>
                                                historyKey?.toString().includes(`img`) ? (<th scope="row" className="px-6 py-4 font-medium text-red-500 whitespace-nowrap "><Image alt={`${historyKey}`} src={`${historyKey}`} height={40} width={40} /></th>) : (<td className="px-6 py-4">{historyKey?.toString()}</td>)
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className={`  overflow-y-auto`}>
                                        {zeroEternalLoveHistory && zeroEternalLoveHistory?.filter(e => e.isUseable).map(history => (
                                            <tr className="odd:bg-white even:bg-gray-50 even:    border-b  hover:bg-info hover:text-white">
                                                {Object.values(history).map(historyVal =>
                                                    historyVal?.toString().includes(`imagekit`) ? (<th scope="row" className="px-6 py-4 font-medium text-red-500 whitespace-nowrap "><Image alt={`${historyVal}`} src={`${historyVal}`} height={40} width={40} /></th>) : (<td className="px-6 py-4">{historyVal?.toString()}</td>)
                                                )}
                                            </tr>
                                        ))}
                                        {/* {zeroEternalLoveHistory && zeroEternalLoveHistory?.filter(e => e.isUseable).map(history => (
                                            <tr className={`odd:bg-white even:bg-gray-50 border-b  hover:bg-info hover:text-white ${!history.isUseable && `text-red-500`}`}>
                                                <td className="px-6 py-4">
                                                    {history?.packageName}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {history?.price}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {history?.itemCode}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {history.purchaseTime.toString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {history.purchaseTime.toString()}
                                                </td>
                                            </tr>
                                        ))} */}
                                    </tbody>
                                </table>
                            </div>
                        </>) : (<></>)}

                        {zeroEternalLoveHistory && zeroEternalLoveHistory.length && selectedDisplayHistory == `applied-history` ? (<>


                            <div className="relative overflow-x-auto   sm:rounded-lg max-h-80">
                                <table className=" text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 w-full mx-auto overflow-x-auto shadow-md ">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50    ">
                                        <tr>
                                            {(zeroEternalLoveHistory && zeroEternalLoveHistory.length) ? Object.keys(zeroEternalLoveHistory[0]).map(key => (<th scope='col' className={`px-6 py-3`}>{`${key}`}</th>)) : ``}

                                        </tr>
                                    </thead>
                                    <tbody className={`  overflow-y-auto`}>

                                        {zeroEternalLoveHistory && zeroEternalLoveHistory?.filter(e => !e.isUseable).map(history => (
                                            <tr className="odd:bg-white even:bg-gray-50 even:    border-b  hover:bg-info hover:text-white">
                                                {Object.values(history).map(historyVal =>
                                                    historyVal.toString().includes(`imagekit`) ? (<th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"><Image alt={`${historyVal}`} src={`${historyVal}`} height={40} width={40} /></th>) : (<td className="px-6 py-4">{historyVal.toString()}</td>)
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>) : (<></>)}



                    </div>
                </section>
            </div>

            <Footer />
        </>
    );
}

export default PackagesList;


interface IRefferalCode {
    gameId: number
}

export const RefferalCode: FC<IRefferalCode> = ({ gameId }) => {
    const [copy, setCopy] = useState({ value: '', copied: false });
    const { Canvas } = useQRCode();
    const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
    const userCookie: IEonUserDetail = cookie["eonhub-auth"];

    const [userRefcodeZero, setUserRefcodeZero] = useAtom(userRefcodeZeroAtom)
    const [userRefcodeSeal, setUserRefcodeSeal] = useAtom(userRefcodeSealAtom)
    const [inputRefZero, setInputRefZero] = useState(``);
    const displayReferralCode = gameId === ZERO_ETERNAL_LOVE_GAME_ID ? userRefcodeZero : userRefcodeSeal

    const [inputRef, setInputRef] = useState(``);
    const [searchParams, setSearchParams] = useSearchParams();
    useEffect(() => {
        const key = searchParams?.[0];
        const val = searchParams?.[1];
        if (key === `promo` && !inputRef) {
            setInputRef(val)
        }
    }, [searchParams])


    const userService = new UserService();


    const firstSubmitPROMO = async (refCode: string) => {
        userService.submitZeroRefCode(userCookie?.token, inputRef, setCookie, removeCookie, setUserRefcodeZero).then(e => {
            if (e) {
                // setInputRefZero(inputRef)
                // if (!userRefcodeZero ) {
                //     userService.registerZeroRefCode(userCookie?.token, googleOAuthToken);
                // }
                userService.fetchZeroRefCode(userCookie?.token, setCookie, removeCookie, setUserRefcodeZero);

            }
        })
    }

    return (<>
        {displayReferralCode?.shortenUrl && (
            <div className="flex justify-center mb-3">
                <Canvas
                    text={`${displayReferralCode?.shortenUrl}`}
                    options={{
                        errorCorrectionLevel: 'M',
                        margin: 3,
                        scale: 4,
                        width: 200,
                        color: {
                            dark: '#000',
                            light: '#fff',
                        },
                    }}
                />
            </div>
        )}

        <div className="flex justify-center gap-2">
            {displayReferralCode?.shortenUrl && <div className={`text-sm flex mb-1 text- border w-fit   p-2 ${copy.copied && `bg-primary text-white `} border-green-600 rounded ${false ? `hidden` : ``}`}>
                <p className="mr-2 font-extrabold">My Referral Code</p>
                <p className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2">{`https://eonhub.games/redeem/?promo=${displayReferralCode?.refCode}`}</p>
                <CopyToClipboard text={`https://eonhub.games/redeem/?promo=${displayReferralCode?.refCode}`}
                    onCopy={() => setCopy({ value: `https://eonhub.games/redeem/?promo=${displayReferralCode?.refCode}`, copied: true })}>
                    <p className={`ml-4 transition-all hover:scale-110 cursor-pointer ${copy.copied && `text-green-900`}`}>

                        <FontAwesomeIcon icon={faCopy} /></p>
                </CopyToClipboard>
                <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded   border border-green-400 mx-2">+{userCookie?.totalUsedRefCodeCount}</span>

            </div>}

            {displayReferralCode?.shortenUrl && <div className={`text-sm flex mb-1 text- border w-fit p-2 ${copy.copied && `bg-primary text-white `} border-green-600 rounded ${false ? `hidden` : ``}`}>
                <p className="mr-2 font-bold">Referer</p>
                {/* <p className="1">{`https://eonhub.net/redeem/?promo=${displayReferralCode?.refCode}`}</p>
                <CopyToClipboard text={`https://eonhub.net/redeem/?promo=${displayReferralCode?.refCode}`}
                    onCopy={() => setCopy({ value: `https://eonhub.net/redeem/?promo=${displayReferralCode?.refCode}`, copied: true })}> */}
                <div className="relative w-full">

                    {/* <input type="text" defaultValue={userRefcodeZero.referrer} disabled={userRefcodeZero.referrer.length > 0} id="simple-search" className={!userRefcodeZero.referrer && `text-center bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full`} placeholder="PROMO-CODE" onChange={e => setInputRefZero(e?.target?.value)} /> */}


                    <input type="text" defaultValue={userRefcodeZero.referrer ? userRefcodeZero.referrer : inputRef ? inputRef : ``} disabled={userRefcodeZero?.referrer?.length > 0} id="simple-search" className={!userRefcodeZero.referrer && `text-center bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full`} placeholder="PROMO-CODE" onChange={e => setInputRef(e?.target?.value)} />

                </div>
                {!userRefcodeZero.referrer && <p className={`ml-2 pt-[1px] transition-all hover:scale-110 cursor-pointer`} onClick={() => firstSubmitPROMO(inputRefZero)}><FontAwesomeIcon icon={faLink} /></p>}
            </div>}
        </div>


        <div className={`px-6 flex gap-2 justify-center ${copy.copied ? 'text-gray-200' : 'text-gray-700'} pt-4 pb-2 lg:flex-wrap lg:justify-start`}>
            <span className={`inline-block lg:flex lg:mr-2 lg:mb-2 ${copy.copied ? 'bg-primary' : 'bg-gray-200'} rounded-full px-3 py-1 text-sm font-semibold mb-2`}>🌏 Let's contribute together</span>
            <span className={`inline-block lg:flex lg:mr-2 lg:mb-2 ${copy.copied ? 'bg-primary' : 'bg-gray-200'} rounded-full px-3 py-1 text-sm font-semibold mb-2`}>🆓 Referral CODE System</span>
            <span className={`inline-block lg:flex lg:mr-2 lg:mb-2 ${copy.copied ? 'bg-primary' : 'bg-gray-200'} rounded-full px-3 py-1 text-sm font-semibold mb-2`}>🚀 Referral: Cash Bonus +5%</span>
            <span className={`inline-block lg:flex lg:mr-2 lg:mb-2 ${copy.copied ? 'bg-primary' : 'bg-gray-200'} rounded-full px-3 py-1 text-sm font-semibold mb-2`}>🚀 Referrer: Revenue Share +10% from EON Spend</span>
        </div>



    </>)
}