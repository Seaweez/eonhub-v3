"use client"
import { Fragment, useEffect, useState } from 'react'

import { cn } from '@/utils/styling'
import Image from 'next/image'

import { Pagination, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { format } from 'date-fns'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowDownWideShort, faArrowUp, faArrowUpWideShort, faCircleArrowDown, faCircleArrowUp } from '@fortawesome/free-solid-svg-icons'
import useSound from 'use-sound'
import IconArrowCircleLeft from '@/components/icons/icon-arrow-circle-left'
import IconArrowCircleRight from '@/components/icons/icon-arrow-circle-right'
import { eonhubApiCreate } from '@/axios'
import { IEonUserDetail, RO_ZERO_PC_GAME_ID, SEAL_METAVERSE_GAME_ID, ZERO_ETERNAL_LOVE_GAME_ID } from '@/types/eonhub'
import { useCookies } from 'react-cookie'
import MarketService, { InventoryResponseDTO, MarketHistoryResponse, MarketItemResponseDTO, MarketList, UserInfoResponseDTO } from '@/services/market.service'
import { useAtom } from 'jotai'
import { SealMetaverseAccountInfoAtom, ZeroEternalLoveAccountInfoAtom, displayMarketZeroHistoryAtom, inventoryInGameWhitelistZeroAtom, inventoryZeroAtom, isHideMarketWalletAtom, isRefreshingAtom, marketHistoryZeroAtom, marketZeroAtom, marketZeroInventoryAtom, marketZeroTaxAtom, selectedGameIdAtom, selectedServerAtom, userMarketHistoryZeroAtom, userMarketListZeroAtom, userWalletHistoryAtom } from '@/atoms/eonhub'
import marketService from '@/services/market.service'
import Swal from 'sweetalert2'
import UserService from '@/services/user.service'
import { IZeroEternalLoveAccountInfo, IZeroEternalLoveCharInfo } from '@/types/zero-eternal-love'
import { useWalletSigner } from '@/hooks/useWeb3Token'
import { useWeb3React } from '@web3-react/core'
import { providers } from 'ethers'
import { toast } from 'react-toastify'
import { COINS_LIST } from '@/constants/eonhub'
import { InventoryInGameZero, RO_PC_SERVERS, ROM_SERVERS } from '@/components/zero-eternal-love/inventoryWhitelist'
import { InventoryNft } from '@/components/zero-eternal-love/inventoryNFT'
import { MarketplaceZeroUserListingItems } from '@/components/zero-eternal-love/userMarketListing'
import { InventoryInGameZeroPC, ZERO_PC_SERVERS } from '@/components/zero-pc/inventoryWhitelist'
import { availableGames, RecentlySold } from '@/app/market/page'
import { InventoryNftZeroPC } from './inventoryNFT'
import { ConvertableItems } from '../zero-eternal-love/convertableItems'
import { InventoryNftCharacter } from '../zero-eternal-love/inventoryNftCharacter'

export const ZeroPcMarket = () => {

  const [cookie, setCookie] = useCookies(["eonhub-auth"]);
  const userCookie: IEonUserDetail = cookie["eonhub-auth"];
  const eonhubAPI = eonhubApiCreate(userCookie?.token);

  const marketService = new MarketService()
  const [marketZeroInventory, setmarketZeroInventory] = useAtom(marketZeroInventoryAtom);
  const [inventoryZero, setInventoryZero] = useAtom(inventoryZeroAtom);
  const [marketZero, setMarketZeroAtom] = useAtom(marketZeroAtom);
  const [inventoryIngameWhitelistZero, setInventoryIngameWhitelistZero] = useAtom(inventoryInGameWhitelistZeroAtom);
  const [userMarketListZero, setUserMarketListZero] = useAtom(userMarketListZeroAtom);
  const [userMarketHistoryZero, setUserMarketHistoryZero] = useAtom(userMarketHistoryZeroAtom);
  const [marketHistoryZero, setMarketHistoryZero] = useAtom(marketHistoryZeroAtom);
  const [marketZeroTax, setMarketZeroTax] = useAtom(marketZeroTaxAtom);
  const [historyType, setHistoryType] = useState(`SELL`)
  const [userWalletHistory, setUserWalletHistory] = useAtom(userWalletHistoryAtom);

  const [selectedDisplayHistory, setSelectedDisplayHistory] = useState(`wallet-history`)

  useEffect(() => {
    if (!userCookie || !userCookie?.token || true) return


    // const abcd = marketService?.getMyConvertItemFromZeroEL2ZeroPC(userCookie?.token)
    // .then(res => {
    //   // setInventoryZero(res)
    //   // setUserWalletHistory(res)
    // })
    // .catch(err => { console.log('getMyConvertItem: ', err) })

  }, [userCookie])

  useEffect(() => {
    if (!userCookie || !userCookie?.token) return
    const zeroUserMarketHistory = marketService.getMarketHistory(ZERO_ETERNAL_LOVE_GAME_ID, userCookie?.token, true, historyType)
      .then(res => {
        const userMarketHistory = res as MarketHistoryResponse[]
        setUserMarketHistoryZero(userMarketHistory)
      })
      .catch(err => { console.log(': ', err) })
  }, [historyType])

  const [isHide, setIsHide] = useAtom(isHideMarketWalletAtom)

  const [zeroEternalLoveAccountInfo, setZeroEternalLoveAccountInfo] = useAtom(ZeroEternalLoveAccountInfoAtom);
  const [selectedServer, setSelectedServer] = useAtom(selectedServerAtom);


  const [gameId, setGameId] = useAtom(selectedGameIdAtom);
  // const [convertableItems, setConvertableItems] = useState<InventoryResponseDTO[]>([])
  // useEffect(() => {

  //   const abcd = marketService?.getMyConvertItemFromZeroEL2ZeroPC(userCookie?.token, setConvertableItems)
  //     .then(res => {
  //       // setConvertableItems(res)
  //       console.log('res: ', res)
  //       // setUserWalletHistory(res)
  //     })
  //     .catch(err => { console.log('getMyConvertItem: ', err) })
  // }, [gameId])

  return (<>
    <div className="relative z-10 mt-28">
        <RecentlySold />
      </div>
  
      <div className="relative z-10 mt-4">
        <MarketplaceROPC />
      </div>




    <div className={`fixed z-100 h-fit  ${isHide ? `  right-1 top-[30%] ` : ` top-[34%] right-2`}    `} style={{ zIndex: 1000 }}>
      <div
        onClick={() => {
          if (!userCookie?.token) return toast.error(`Please login with Google`);
          setIsHide(!isHide)
        }}
        className={`mt-[8.25rem]  ${selectedServer.serverID ? `` : `  hover:animate-none`} 
               hover:font-extrabold cursor-pointer  hover:scale-110 bg-none text-white transition-all ${isHide ? ` hover:-translate-x-1   pb-4 pt-3 px-3 rounded-full` : `-translate-x-1 hover:translate-x-0   px-2 py-1 rounded-2xl`}     h-fit `}>
        {isHide ? (<Image alt={`gift.png`} src={`/images/rom/Backpack_icon.png`} height={80} width={80} className={``} />) : `>`}

      </div>
    </div>



    <div className={`fixed z-[20] top-0 left-0 w-screen h-screen bg-neutral-800 transition-all ${isHide ? `scale-0 opacity-0` : `opacity-20`}`} onClick={() => setIsHide(true)}></div>
    <Swiper
      loop={true}
      navigation={{
        prevEl: '#news-navigation-prev',
        nextEl: '#news-navigation-next',
      }}
      modules={[Navigation]}
      style={{ position: `fixed`, zIndex: `100` }}
      className={cn(`[&>.swiper-wrapper]:pb-0  -right-2 transition-all w-fit    ${isHide ? (selectedServer.serverID ? `translate-x-[96%]  ` : `translate-x-[90%]`) : `left-0`}  top-[20%]`)}
      breakpoints={{
        319: {
          slidesPerView: 1.1,
          spaceBetween: 20,
          slidesOffsetBefore: 20,
          slidesOffsetAfter: 20,
        },
        641: {
          slidesPerView: 1.1,
          spaceBetween: 20,
          slidesOffsetBefore: 32,
          slidesOffsetAfter: 32,
        },
        1025: {
          slidesPerView: 1,
          spaceBetween: 40,
        },
      }}
    >



      {/* <SwiperSlide
            key={`news-slide-${1}`}
            className={cn(
              `rounded-[40px]   `,
              `[&.swiper-slide-active>div]:bg-pink`,
              `[&.swiper-slide-active>div]:shadow-news`,
              `[&.swiper-slide-active]:border`,
              `${isHide ? `[&.swiper-slide-active]:border-neutral-800` : `[&.swiper-slide-active]:border-pink shadow`}`,
              `[&.swiper-slide-active]:p-2`,
              `[&.swiper-slide-active]: `,
              `[&:not(.swiper-slide-active)_a]:hidden`,
            )}
          > */}

      <section className={cn(`section border-4    border-neutral-700  ${isHide ? `  bg-[url('/images/games/inventory-cover.jpeg')]  bg-opacity-100 shadow-2xl border-2    rounded-2xl mx-8` : ` ${selectedServer.serverID ? `bg-[url('/images/games/inventory-cover.jpeg')]` : `bg-neutral-800 bg-opacity-80 shadow pt-24`} mx-12 rounded-[40px]`} bg-cover min-w-fit flex min-h-[20rem]`,
        `   `,
        `[&.swiper-slide-active>div]:bg-pink`,
        `[&.swiper-slide-active>div]:shadow-news`,
        `[&.swiper-slide-active]:border`,
        `[&.swiper-slide-active]:border-pink`,
        `[&.swiper-slide-active]:p-2`,
        `[&.swiper-slide-active]: `,
        `[&:not(.swiper-slide-active)_a]:hidden`)}>
        {/* <div className="w-full flex justify-center">
                <Image alt='' src={`/images/games/02.png`} className={`rounded-2xl h-24`} height={100} width={100} />
              </div> */}
        {/* <div className="bg-black">123123123</div> */}
        <div className={`${selectedServer.serverID ? `grid grid-cols-2` : ` `}  relative lg:block text-center  justify-between`}>

          {!selectedServer.serverID ?
            (<>
              <div className="relative h-fit  p-10 lg:p-4 rounded-2xl">
                <ZeroPcSelectServer />
              </div>
            </>)
            : (<>
              <div className="relative z-[5] h-fit  p-10 lg:p-4 rounded-2xl">

                <InventoryInGameZero data={inventoryIngameWhitelistZero} gameId={selectedServer?.gameId} />

              </div>
              <div className=" relative z-[5] h-fit  p-10 lg:p-4 rounded-2xl">
                <InventoryNftZeroPC data={inventoryZero} gameId={selectedServer?.gameId} />
              </div>


              <div className=" relative z-[5] h-fit  p-10 lg:p-4 rounded-2xl">
                <InventoryNftCharacter data={inventoryZero} gameId={selectedServer?.gameId} />
              </div>

            </>)}


        </div>

        {selectedServer.serverID ? (<div className={`absolute left-13 bottom-6 transition-all duration-500 z-50 ${isHide ? `translate-x-full` : ``}`}>
          {/* <ZeroPcSelectServer /> */}
        </div>) : (<></>)}

      </section>


    </Swiper>



    <MarketplaceZeroUserListingItems />
    <div className="container my-4">
      <ConvertableItems />
    </div>
    <div className="flex px-10 my-6">
      {/* {convertableItems?.map(e => (<div>{e.inventoryId}</div>))} */}
    </div>


    <div className="rounded-xl  p-10 pt-0">
      <div className={`flex rounded-xl my-4 bg-info border-2 pt-4 w-fit text-white rounded-tr-2xl transition-all ${userWalletHistory?.length || userWalletHistory?.length ? `scale-100` : `scale-0`}`}>
        <div className="relative">
          <h2 className={`text-center mb-4  mx-4 cursor-pointer ${selectedDisplayHistory == `wallet-history` ? `font-bold` : ``}`}
            onClick={() => setSelectedDisplayHistory(`wallet-history`)}>Wallet History</h2>
        </div>
        <div className="flex">
          <h2 className={`text-center   mx-4 cursor-pointer ${selectedDisplayHistory == `market-history` ? `font-bold` : ``}`}
            onClick={() => setSelectedDisplayHistory(`market-history`)}>Transaction History</h2>

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
      {userWalletHistory && userWalletHistory?.length && selectedDisplayHistory == `wallet-history` ? (<>
        {/* <h2 className="text-center font-bold my-4">Wallet History</h2> */}
        <div className="relative overflow-x-auto sm:rounded-lg max-h-80 ">
          <table className="w-full mx-auto overflow-x-auto shadow-md text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 rounded-2xl border-2">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50    ">
              <tr className=''>
                <th scope='col' className={`px-6 py-3`}>Type</th>
                <th scope='col' className={`px-6 py-3`}>Amount</th>
                <th scope='col' className={`px-6 py-3`}>Status</th>
                <th scope='col' className={`px-6 py-3`}>Destination</th>
                <th scope='col' className={`px-6 py-3`}>Created</th>
              </tr>
            </thead>
            <tbody className={`  overflow-y-auto`}>
              {userWalletHistory && userWalletHistory.map(history => (
                <tr className="odd:bg-white even:bg-gray-50 border-b  hover:bg-info hover:text-white">
                  <td className="px-6 py-4">
                    {history.txnType}
                  </td>
                  <td className="px-6 py-4">
                    {history.eonAmount}
                  </td>
                  <td className="px-6 py-4">
                    {history.status}
                  </td>
                  <td className="px-6 py-4">
                    {history.destinationUserEmail}
                  </td>
                  <td className="px-6 py-4">
                    {history.createdTime.toString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>) : (<></>)}

      {userMarketHistoryZero && userMarketHistoryZero.length && selectedDisplayHistory == `market-history` ? (<>


        <div className="relative overflow-x-auto   sm:rounded-lg max-h-80">
          <table className=" text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 w-full mx-auto overflow-x-auto shadow-md ">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50    ">
              <tr>
                {(userMarketHistoryZero && userMarketHistoryZero.length) ? Object.keys(userMarketHistoryZero[0]).map(key => (<th scope='col' className={`px-6 py-3`}>{`${key}`}</th>)) : ``}

              </tr>
            </thead>
            <tbody className={`  overflow-y-auto`}>

              {userMarketHistoryZero && userMarketHistoryZero.map(history => (
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
  </>)
}

export const ZeroPcSelectServer = ({ className }: { className?: string }) => {

  const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
  const userCookie: IEonUserDetail = cookie["eonhub-auth"];
  const eonhubAPI = eonhubApiCreate(userCookie?.token);
  const userService = new UserService();
  const [zeroEternalLoveAccountInfo, setZeroEternalLoveAccountInfo] = useAtom(ZeroEternalLoveAccountInfoAtom);

  const activeClass = `translate-x-1/2   text-[1.5rem]  font-medium me-2 px-2.5 py-0.5 rounded bg-secondary text-white`
  const deactiveClass = `   text-[1.3rem]  font-medium me-2 px-2.5 py-0.5 rounded bg-white hover:bg-secondary ${className ? `${className}` : `text-neutral-500`} hover:text-white  shadow-md  rounded-md border-neutral-100  `
  const [selectedServer, setSelectedServer] = useAtom(selectedServerAtom);
  const [isToggle, setIsToggle] = useState(false);
  const [isRefreshing, setIsRefreshing] = useAtom(isRefreshingAtom)

  return (<>

    <div className=" px-10  w-fit  ">

      <div className={`z-10 text-white transition-all ${isToggle ? `scale-y-100` : `scale-y-100`}     rounded-lg   min-w-44  `}>
 
        {/* Games */}
        <section className={cn(` shadow-inner  pb-20 shadow-sm  pt-24 `, `lg:py-10 `)}>
          <div className={cn(`container  `, `lg:!px-0`)}>
            <Swiper
              loop={true} 
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
            >
              {[
                {
                  name: 'Tales Of ZERO',
                  game: RO_PC_SERVERS[0],
                  available: true,
                  href: `https://zero-pc.eonhub.games/`,
                  image: '/images/games/toz-logo-edit.png',
                },
                {
                  name: 'Eternal Nexus M',
                  game: ROM_SERVERS[0],
                  available: true,
                  href: `https://zeroeternalnexus.eonhub.games/`,
                  image: '/images/games/02.png',
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
                <SwiperSlide
                  key={`game-slide-${gameIdx}`}
                  className={cn(`cursor-pointer self-center transition-all overflow-hidden `, {
                    '!w-[30%] rounded-[48px] border border-border p-[10px] lg:!w-[256px]': game.available,
                    // '!w-[23.3333333333%]   border border-border p-[20px] lg:!w-[256px] ': !game.available,
                    '!w-[23.3333333333%]   lg:!w-[220px]': !game.available,
                  })}
                >
                  <div
                    onClick={() => {
                      // game.href && window.open(game.href)
                      setSelectedServer(game.game)
                    }}
                    className={cn(`text-center text-white ${selectedServer?.gameId == game?.game?.gameId ? `bg-primary` : `bg-primary/50 hover:-translate-y-4`}`, {
                      'rounded-[40px] border-[8px] border-border  p-2': game.available,
                      'bg-foreground': !game.available && gameIdx === 1,
                      'bg-primary': !game.available && gameIdx === 2,
                      'bg-primary/75': !game.available && gameIdx === 3,
                    })}
                  >
                    <Image
                      src={game.image}
                      alt=""
                      width={1000}
                      height={1000}
                      className={cn(`aspect-[304/330] w-full object-cover   ${selectedServer?.gameId == game?.game?.gameId ? `` : `opacity-50 `} `, {
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
                            <span>Available now</span>
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
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>


      </div>

    </div>

  </>)
}

export const MarketplaceROPC = () => {

  const { library, account, chainId, activate, deactivate } = useWeb3React();

  const [sealMetaverseAccountInfo, setSealMetaverseAccountInfo] = useAtom(SealMetaverseAccountInfoAtom);
  const [zeroEternalLoveAccountInfo, setZeroEternalLoveAccountInfo] = useAtom(ZeroEternalLoveAccountInfoAtom);

  const marketService = new MarketService()
  const [marketZero, setMarketZeroAtom] = useAtom(marketZeroAtom);


  const { sign: signWallet } = useWalletSigner(
    library as providers.Web3Provider
  );


  const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
  const userCookie: IEonUserDetail = cookie["eonhub-auth"];
  const eonhubAPI = eonhubApiCreate(userCookie?.token);

  const [marketZeroInventory, setmarketZeroInventory] = useAtom(marketZeroInventoryAtom);
  const [inventoryZero, setInventoryZero] = useAtom(inventoryZeroAtom);
  const [selectedServer, setSelectedServer] = useAtom(selectedServerAtom);

  const onBuyMarketItemClick = async (item: MarketList) => {
    // alert(userCookie.walletAddress)
    if (userCookie?.walletAddress && !account) return toast.error(`Please connect your wallet`);
    let token = null;

    if (userCookie?.walletAddress) {
      if (account.toLowerCase() == userCookie?.walletAddress?.toLowerCase()) {
        token = await signWallet(); // signWallet is a function from useWalletSigner hook 
      }
      if (!token) return;
    } 

    Swal.fire({
      title: `Buying ${item.itemName}`,
      input: "number",
      inputValue: 1, 
      showCancelButton: true,
      confirmButtonText: "Confirm",
      confirmButtonColor: 'rgb(253 120 118 / 1.0)',
      showLoaderOnConfirm: true,
      inputValidator: (value) => { 
        return new Promise((resolve) => {
          if (!value) {
            resolve("Please input an amount to buy.");
          } else {

            resolve();
          }
          resolve()
        });
      },
      preConfirm: async (amount) => {
        try {
          // After Confirm 
          const req = marketService?.buyItem(selectedServer?.gameId, userCookie?.token, item, amount, selectedServer.serverID, token)
            .finally(() => {
              refrestData()
              UserService
            })
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


  const userService = new UserService();
  const [marketHistoryZero, setMarketHistoryZero] = useAtom(marketHistoryZeroAtom);
  const refrestData = () => {

    if (!userCookie || !userCookie?.token || !selectedServer.gameId) return
    const inventoryZero = marketService.getMyInventory(selectedServer.gameId, userCookie?.token)
      .then(res => {
        setInventoryZero(res)
      })
      .catch(err => { console.log('inventoryZero: ', err) })
    const marketZeroInventory = marketService.getUserMarketInfo(selectedServer.gameId, userCookie?.token)
      .then(res => {
        setmarketZeroInventory(res)
      })
      .catch(err => { console.log('marketZeroInventory: ', err) })
    const marketItemlist = marketService.getMarketItemList(selectedServer.gameId, userCookie?.token)
      .then(res => {
        const marketItem = res as MarketList[] || [];
        setMarketZeroAtom(marketItem)
        // setmarketZeroInventory(res)
      })
      .catch(err => { console.log('marketZeroInventory: ', err) })
    userService.fetchUserInfo(userCookie?.token, setCookie, removeCookie, () => { });
    // const marketZeroTax = marketService.getMarketTax(ZERO_ETERNAL_LOVE_GAME_ID, userCookie?.token)
    //   .then(res => {
    //     console.log('marketZeroTax: ', res)
    //     // setmarketZeroInventory(res)
    //   })
    //   .catch(err => { console.log('marketZeroInventory: ', err) })
    //   const zeroUserMarketHistory = marketService.getMarketRecentlySold(selectedServer?.gameId, userCookie?.token)
    //   .then(res => {
    //     const recentlySold = res as any
    //     setMarketHistoryZero(recentlySold)
    //   })
    //   .catch(err => { console.log(': ', err) })
  }


  useEffect(() => {
    refrestData() 
  }, [selectedServer])

  const [marketZeroTax, setMarketZeroTax] = useAtom(marketZeroTaxAtom);
  const [marketZeroFilter, setMarketZeroFilter] = useState({ type: `GIFT_ITEM`, subtype: `` })
  const ROM_MARKET_TYPE = [`GIFT_ITEM`]
  const ROM_MARKET_SUB_TYPE = [
    { type: `x`, subtype: [] },
    { type: `GIFT_ITEM`, subtype: [`Zeny`] }
  ]
  const [hideCategory, setHideCategory] = useState(false);

  return (<>
    {/* Recently Sold */}
    <section className={cn(`pb-10 w-fit mx-auto ${!marketZero?.length && `hidden`}`, `lg:pt-0`)}>
      <div className={cn(`container `)}> 
        <h2 className={cn(`text-[64px] font-bold leading-tight text-white bg-info   w-fit px-10 py-4 rounded-2xl`, `lg:text-[32px]`)}>
          ZERO PC - Marketplace
        </h2>
      </div>

      <div className={cn(`container relative mt-4`, `lg:mt-6 lg:!px-0`)}>
        <div className="flex lg:grid justify-between text-center gap-4 ">
          <div className="market-filter-type-section w-1/4 lg:w-[90%] mx-auto border-2 rounded-2xl border-neutral-800    ">
            <div className={`${marketZeroFilter.subtype || `flex`} justify-center  py-4 border-neutral-800 rounded-t-xl w-full bg-opacity-90 r`} onClick={() => setHideCategory(!hideCategory)}>
              <h2 className={cn(`text-[28px]  font-bold leading-tight    py-1  `, `lg:text-2xl`)}>{`CATEGORIES`} </h2>
              <h2 className={cn(`text-[14px] my-auto ml-1 font-bold leading-tight transition-all ${marketZeroFilter.subtype ? `scale-100` : `scale-y-0`}   py-1  `, `lg:text-2xl`)}>{marketZeroFilter.subtype || ``} </h2>
              {/* <h2 className={cn(`text-[28px] block lg:hidden font-bold leading-tight    py-1  `, `lg:text-2xl`)}>CATEGORIES</h2> */}
              <div className="hidden lg:block my-auto ml-2"> {hideCategory ? (<FontAwesomeIcon icon={faArrowDownWideShort} />) : (<FontAwesomeIcon icon={faArrowUpWideShort} />)}</div>
            </div>
            <div className={`p-4    block transition-all duration-250 border-t-2 border-neutral-800 lg:grid ${hideCategory ? `lg:scale-y-0 lg:h-0 lg:p-0 lg:border-t-0` : `scale-100 lg:p-4`}`}>
              {ROM_MARKET_TYPE.map(type => (<>
                <div className="flex justify-center mb-2 text-xl">
                  <div className={`flex w-fit py-2 pl-6 pr-8  rounded-xl cursor-pointer  transition-all  ${marketZeroFilter.type == type ? `font-extrabold bg-info bg-opacity-80 text-white scale-105` : ` bg-white`}`} onClick={() => setMarketZeroFilter({ type, subtype: `` })}>

                    <div className="my-auto ml-1"> {type == "GIFT_ITEM" ? `USABLE` : type}</div>
                  </div>
                </div>
                {ROM_MARKET_SUB_TYPE.find(sub => sub.type == type)?.subtype.map(subtype => (
                  <div className={`flex   transition-all duration-200  ${marketZeroFilter.type == type ? `scale-100 mb-3 mt-1` : `h-0 scale-y-0`}`}>
                    <div className={`w-full flex justify-center -ml-2 cursor-pointer ${marketZeroFilter.subtype == subtype ? `font-bold ` : ``}`} onClick={() => setMarketZeroFilter({ type: marketZeroFilter.type, subtype })} >

                      {/* <Image alt={`cards.png`} src={`/images/rom/cards.png`} height={40} width={40} /> */}
                      - <div className="my-auto ml-1 text-lg"> {subtype}</div>
                    </div>
                  </div>
                ))}
              </>))}
            </div>

          </div>
          <div className=" w-full lg:w-[90%] mx-auto border-2 rounded-2xl p-3 bg-sky-100 bg-opacity-20 border-neutral-800 ">
            <div className="grid lg:grid-cols-2 grid-cols-4 gap-2 max-h-[38rem] overflow-auto">
              {marketZero.sort((a, b) => a.eonPriceForEach - b.eonPriceForEach)
                .map((item, n) => ({
                  id: `${item?.marketItemId}`,
                  image: item?.itemPictureUrl || '/images/zenyCoin.jpeg',
                  collection: `${item?.itemType}`,
                  name: item?.itemName || ``,
                  price: item?.eonPriceForEach,
                  priceUSD: (item?.eonPriceForEach / 10),
                  createdAt: new Date(item?.createdTime),
                  sellerGameUserId: item?.sellerGameUserId,
                  chain: {
                    symbol: 'bsc',
                  },
                  item: item
                }))
                .map((recently, recentlyIdx) => marketZeroFilter.type == recently.collection && (
                  <SwiperSlide
                    onClick={async () => await onBuyMarketItemClick(recently.item)}
                    key={`recently-slide-${recentlyIdx}`}
                    className={cn(
                      `relative p-2 transition-all duration-[${(recentlyIdx+1) *100}ms] scale-100`,
                      `[&:hover>div]:bg-info`,
                      `[&:hover>div]:shadow-recently`,
                      `[&:hover>div>.recently-id]:bg-white`,
                      `[&:hover>div>.recently-id]:text-info`,
                      `[&:hover>div>.recently-id]:rounded-none`,
                      `[&:hover]:text-white`,
                      `[&:hover_.price]:text-white`,
                      // pseudo class
                      `[&:hover]:before:rounded-[40px]`,
                      `[&:hover]:before:border`,
                      `[&:hover]:before:border-info`,
                      `[&:hover]:before:inset-0`,
                      `[&:hover]:before:absolute`,
                      `[&:hover]:before:pointer-events-none`,
                      `[&:hover]:before:-z-10`,
                    )}
                  >
                    <div className={cn(`rounded-[32px] bg-card p-8`, `transition-all duration-300`, `lg:p-5`)}>
                      {/* {recently.sellerGameUserId} */}
                      <div className={cn(`recently-id inline-block rounded-full bg-info px-2 text-white`)}>
                        #{recently.id}
                      </div>
                      <div className={cn(`mt-2 flex items-center space-x-2`)}>
                        <div className={cn(`flex-1 truncate font-semibold`)}>{recently.collection}</div>
                        <Image src={`/images/chains/${recently.chain.symbol}.png`} alt="" width={24} height={24} />
                      </div>
                      <div className={cn(`mt-4 flex aspect-square items-center justify-center rounded-2xl bg-white p-2`)}>
                        <Image
                          src={recently.image}
                          alt=""
                          width={176}
                          height={176}
                          className={cn(`h-full w-full object-contain`)}
                          priority
                        />
                      </div>
                      <div className={cn(`mt-4 space-y-2`)}>
                        {/* {recently?.sellerGameUserId} */}
                        <h5 className={cn(`text-[32px] font-bold`)}>{recently.name}</h5>
                        <div>Quantity: {recently.item.itemAmount.toLocaleString('en-US', {})}</div>
                        <div>
                          <div className={cn(`price text-xl font-bold text-success`, `transition-all duration-300`)}>
                            {recently.price} EON
                          </div>
                          <div>{(recently.priceUSD).toFixed(2)} USD</div>
                        </div>
                        <div className={cn(`text-xs`)}>{format(recently.createdAt, 'MMM dd yyyy, HH:mm')}</div>
                      </div>
                    </div>
                  </SwiperSlide>
                )
                )
              }
            </div>
          </div>
        </div>
        {/* <div className="mt-4 ml-0 lg:ml-6 hidden">
          <p className="inline  ">
            Accumulated Trading Volumes:
          </p>
          <p className="2 inline ml-1 font-bold">
            {(marketZeroTax.marketplaceTax * 5).toLocaleString('en-US', { maximumFractionDigits: 0 })} EON
          </p>
          <h4 className={`text-right -mt-6 lg:mt-0 font-semibold text-secondary`}>50% Import Fee on Redeem Zeny </h4>
          <h4 className={`text-right font-semibold text-secondary`}>into different Servers ~ approximately 500k</h4>
        </div> */}
      </div>



    </section>
 
  </>)
}