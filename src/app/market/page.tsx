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
import { SealMetaverseAccountInfoAtom, ZeroEternalLoveAccountInfoAtom, displayMarketZeroHistoryAtom, inventoryInGameWhitelistZeroAtom, inventoryZeroAtom, isHideMarketWalletAtom, marketHistoryZeroAtom, marketZeroAtom, marketZeroInventoryAtom, marketZeroTaxAtom, selectedGameIdAtom, selectedServerAtom, userMarketHistoryZeroAtom, userMarketListZeroAtom, userWalletHistoryAtom } from '@/atoms/eonhub'
import marketService from '@/services/market.service'
import Swal from 'sweetalert2'
import UserService from '@/services/user.service'
import { IZeroEternalLoveAccountInfo, IZeroEternalLoveCharInfo } from '@/types/zero-eternal-love'
import { useWalletSigner } from '@/hooks/useWeb3Token'
import { useWeb3React } from '@web3-react/core'
import { providers } from 'ethers'
import { toast } from 'react-toastify'
import { COINS_LIST } from '@/constants/eonhub'
import { InventoryInGameZero, ZeroSelectServer } from '@/components/zero-eternal-love/inventoryWhitelist'
import { InventoryNft } from '@/components/zero-eternal-love/inventoryNFT'
import { MarketplaceZeroUserListingItems } from '@/components/zero-eternal-love/userMarketListing'
import Footer from '../footer'
import { InventoryInGameZeroPC } from '@/components/zero-pc/inventoryWhitelist'
import { ZeroPcMarket } from '@/components/zero-pc/market'
import { InventoryNftCharacter } from '@/components/zero-eternal-love/inventoryNftCharacter'
import { ConvertableItems } from '@/components/zero-eternal-love/convertableItems'

interface IPageProps { }


export const availableGames = [
  {
    gameId: ZERO_ETERNAL_LOVE_GAME_ID, gameName: `ZERO - Eternal Nexus`, imgUrl: `/images/games/bg-redeem.png`,
    serverID: 10002,
    serverName: `Eternal Nexus M`,
  },
  // { gameId: SEAL_METAVERSE_GAME_ID, gameName: `Seal Metaverse`, imgUrl: `/images/games/seal-metaverse.png` },
  {
    gameId: RO_ZERO_PC_GAME_ID, gameName: `Tales Of ZERO`, imgUrl: `/images/games/toz-logo-edit.png`,
    serverID: 1,
    serverName: `Tales Of ZERO`,
  },
]

const Page = ({ }: IPageProps) => {

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
  const [selectedServer, setSelectedServer] = useAtom(selectedServerAtom);

  useEffect(() => {
    if (!userCookie || !userCookie?.token) return
    const zeroRecentlySold = marketService.getMarketRecentlySold(selectedServer.gameId, userCookie?.token)
      .then(res => {
        const recentlySold = res as any
        setMarketHistoryZero(recentlySold)
      })
      const marketZeroTax = marketService
      .getTotalTaxHistory(ZERO_ETERNAL_LOVE_GAME_ID)
      .then((res) => {
        setMarketZeroTax(res || { totalReferralSystem: 0, totalTax: 0, marketplaceTax: 0 })
        // setIsAllowRefreshData(false)
      })
      .catch((err) => {
        console.log('marketZeroInventory: ', err)
        setMarketZeroTax({ totalReferralSystem: 0, totalTax: 0, marketplaceTax: 0 })
      })
  }, [selectedServer])

  useEffect(() => {
    if (!userCookie || !userCookie?.token) return
    const zeroUserMarketHistory = marketService.getMarketHistory(selectedServer.gameId, userCookie?.token, true, historyType)
      .then(res => {
        const userMarketHistory = res as MarketHistoryResponse[]
        setUserMarketHistoryZero(userMarketHistory)
      })
      .catch(err => { console.log(': ', err) })
  }, [historyType, selectedServer])

  const [isHide, setIsHide] = useAtom(isHideMarketWalletAtom)

  const [zeroEternalLoveAccountInfo, setZeroEternalLoveAccountInfo] = useAtom(ZeroEternalLoveAccountInfoAtom);
  const [gameId, setGameId] = useAtom(selectedGameIdAtom);
 

  return (
    <Fragment>
      <div className={`flex justify-center items-center animate-fade-right animate-delay-300 animate-once ${selectedServer?.gameId ? `mt-40 -translate-x-[0%] bg-[url('${availableGames.find(e => e?.gameId == gameId)?.imgUrl}')]` : `h-screen`}`}>
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-4">Choose a Game</h1>
          <div className="flex justify-center">
            {availableGames.map(game => (
              <div className="flex justify-center" key={game.gameId}>
                <button onClick={() => setSelectedServer(game)} className={`bg-primary text-white transition-all hover:scale-110 hover:mx-1 bg-contain  p-2 m-2 rounded-lg hover:bg-primary-dark`}  >{game.gameName}</button>

              </div>
            ))}
            {/* {gameId !== 0 && <img src={availableGames.find(e => e?.gameId == gameId)?.imgUrl} alt={availableGames.find(e => e?.gameId == gameId)?.imgUrl} className=" w-20 h-20 mx-2" />} */}
          </div>
        </div>
      </div>
      <Fragment>
        {selectedServer?.gameId === ZERO_ETERNAL_LOVE_GAME_ID && <ZeroRomMarket />}
        {/* <ZeroRomMarket /> */}
        {selectedServer?.gameId === RO_ZERO_PC_GAME_ID && <ZeroPcMarket />}
      </Fragment>

    <Footer />
    </Fragment>
  )
}


export const ZeroRomMarket = () => {

  const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
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
  const [selectedServer, setSelectedServer] = useAtom(selectedServerAtom);
  const [isHide, setIsHide] = useAtom(isHideMarketWalletAtom)

  useEffect(() => {
    if (!userCookie || !userCookie?.token) return
    const zeroUserMarketHistory = marketService.getMarketHistory(selectedServer?.gameId, userCookie?.token, true, historyType)
      .then(res => {
        const userMarketHistory = res as MarketHistoryResponse[]
        setUserMarketHistoryZero(userMarketHistory)
      })
      .catch(err => { console.log(': ', err) })
  }, [historyType])

  // const [zeroEternalLoveAccountInfo, setZeroEternalLoveAccountInfo] = useAtom(ZeroEternalLoveAccountInfoAtom); 

  return (<>

   {/* {selectedServer?.gameId === RO_ZERO_PC_GAME_ID && <ConvertableItems />} */}

    <div className="relative z-10 mt-28">
      <RecentlySold />
    </div>

    <div className={`relative z-10 mt-4`}>
      <MarketplaceROM />
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


    {/* <div className="fixed z-100 right-0 top-[40%]">
        <Image src={`/images/rom/give_bg_01.png`} alt={`bg-[url('/images/rom/give_bg_01.png')]`} height={100} width={100} />
      </div> */}

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

      <section className={cn(`section border-4    border-neutral-700  ${isHide ? `  bg-[url('/images/games/inventory-cover.jpeg')]  bg-opacity-100 shadow-2xl border-2    rounded-2xl mx-8` : ` ${selectedServer.serverID ? `bg-[url('/images/games/inventory-cover.jpeg')]` : `bg-neutral-800 bg-opacity-80 shadow pt-24`} lg:mx-0 mx-12 rounded-[40px]`} bg-cover min-w-fit flex min-h-[20rem]`,
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

          {!selectedServer.serverID || !selectedServer.gameId ?
            (<>
              <div className="relative h-fit  p-10 lg:p-4 rounded-2xl">
                <ZeroSelectServer />
              </div>
            </>)
            : (<>
              <div className="relative z-[5] h-fit  p-10 lg:p-4 rounded-2xl">

                <InventoryInGameZero data={inventoryIngameWhitelistZero} gameId={selectedServer.gameId} />

              </div>
              <div className=" relative z-[5] h-fit  p-10 lg:p-4 rounded-2xl">
                <InventoryNft data={inventoryZero} gameId={selectedServer.gameId} />
              </div>

              <div className=" relative z-[5] h-fit  p-10 lg:p-4 rounded-2xl">
                <InventoryNftCharacter data={inventoryZero} gameId={selectedServer.gameId} />
              </div>

            </>)}

          {/* <div className="absolute  -left-6 -bottom-9 p-10 lg:p-4 rounded-2xl">
                <ZeroSelectServer />
              </div> */}

        </div>


        {selectedServer.serverID ? (<div className={`absolute left-13 bottom-6 transition-all duration-500 z-50 ${isHide ? `translate-x-full` : ``}`}>
          <ZeroSelectServer />
        </div>) : (<></>)}

      </section>


    </Swiper>



    {selectedServer?.gameId == ZERO_ETERNAL_LOVE_GAME_ID && <MarketplaceZeroUserListingItems />}

    <div className="rounded-xl  p-10">
      <div className={`flex rounded-xl my-4 bg-info border-2 pt-4 w-fit text-white rounded-tr-2xl transition-all ${userWalletHistory?.length || userWalletHistory?.length ? `scale-100` : `scale-0`}`}>
        <div className="relative">
          <h2 className={`text-center mb-4  mx-4 cursor-pointer ${selectedDisplayHistory == `wallet-history` ? `font-bold` : ``}`}
            onClick={() => setSelectedDisplayHistory(`wallet-history`)}>Wallet History</h2>
        </div>
        <div className="flex">
          <h2 className={`text-center   mx-4 cursor-pointer ${selectedDisplayHistory == `market-history` ? `font-bold` : ``}`}
            onClick={() => setSelectedDisplayHistory(`market-history`)}>Transaction History</h2>

          <div className={`text-sm font-medium text-center  border- border-gray-200 transition-all ${selectedDisplayHistory == `market-history` ? `scale-100` : `-translate-x-full scale-x-0`}`}>
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

export const ExchangeToken = ({ gameId }: { gameId: number }) => {

  const [cookie, setCookie] = useCookies(["eonhub-auth"]);
  const userCookie: IEonUserDetail = cookie["eonhub-auth"];
  const eonhubAPI = eonhubApiCreate(userCookie?.token);

  const [swapDirection, setSwapDirection] = useState(false);
  const coinsList = COINS_LIST[gameId];
  // const [cashSpendSound] = useSound(
  //   '/images/sound/Cash_Register.mp3',
  //   { volume: 1.00 }
  // );

  return (<>
    <div className={`border-2 w-full rounded-2xl bg-white h-fit my-auto transition-all duration-500 ${gameId !== SEAL_METAVERSE_GAME_ID && `opacity-40`}`}>
      <div className="border-2 h-auto text-center rounded-2xl py-6 px-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="text-center">
              <Image alt='' src={`${coinsList[0].imgUrl}`} height={50} width={50} />
              {/* <div className="absolute bottom-0 right-2">111</div> */}
              <div className="absolute -bottom-2 -right-1 bg-black bg-opacity-50 py-1 px-2 rounded-lg">{0}</div>
            </div>
          </div>
        </div>
        <div className="flex justify-center py-4 transition-all">
          {swapDirection ?
            <FontAwesomeIcon icon={faCircleArrowUp} className={`h-12 opacity-70 text-neutral-600 hover:text-neutral-800 hover:opacity-90 cursor-pointer`} onClick={() => {
              // cashSpendSound();
              setSwapDirection(!swapDirection)
            }} />
            : <FontAwesomeIcon icon={faCircleArrowDown} className={`h-12 opacity-70 text-neutral-600 hover:text-neutral-800 hover:opacity-90 cursor-pointer`} onClick={() => setSwapDirection(!swapDirection)} />
          }
        </div>
        <div className="flex justify-center ">
          <div className="relative">
            <div className="text-center">
              {/* <Image alt='' src={`/images/zenyCoin.png`} height={125} width={125} /> */}
              <Image alt='' src={`${coinsList[1].imgUrl}`} height={75} width={75} />
              <div className="absolute -bottom-2 -right-1 bg-black bg-opacity-50 py-1 px-2 rounded-lg">{userCookie?.eonPoint || 0}</div>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-6 border-2 rounded-2xl transition-all duration-500 bg-primary  hover:font-extrabold bg-opacity-60 hover:bg-opacity-100 hover:border-neutral-400">
          <button type='button' className={`h-14 `}>EXCHANGE</button>
        </div>
      </div>
    </div>
  </>)
}


export const MarketplaceROM = () => {

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
          const req = marketService?.buyItem(ZERO_ETERNAL_LOVE_GAME_ID, userCookie?.token, item, amount, selectedServer.serverID, token)
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
    const marketZeroTax = marketService.getMarketTax(ZERO_ETERNAL_LOVE_GAME_ID, userCookie?.token)
      .then(res => {
        console.log('marketZeroTax: ', res)
        // setmarketZeroInventory(res)
      })
      .catch(err => { console.log('marketZeroInventory: ', err) })
      const zeroUserMarketHistory = marketService.getMarketRecentlySold(selectedServer?.gameId, userCookie?.token)
      .then(res => {
        const recentlySold = res as any
        setMarketHistoryZero(recentlySold)
      })
      .catch(err => { console.log(': ', err) })
  }


  useEffect(() => {
    if(selectedServer?.gameId){
      refrestData() 
    }
  }, [selectedServer])
 

  const [marketZeroTax, setMarketZeroTax] = useAtom(marketZeroTaxAtom);
  const [marketZeroFilter, setMarketZeroFilter] = useState({ type: `MONEY`, subtype: `` })
  const ROM_MARKET_TYPE = [`GIFT_ITEM`, `MONEY`]
  const ROM_MARKET_SUB_TYPE = [
    { type: `MONEY`, subtype: [] },
    { type: `GIFT_ITEM`, subtype: [`Card`] }
  ]
 
  const [hideCategory, setHideCategory] = useState(false);

  return (<>
    {/* Recently Sold */}
    <section className={cn(`pb-10 w-fit mx-auto ${!marketZero?.length && `hidden`}`, `lg:pt-0`)}>
      <div className={cn(`container `)}> 
        <h2 className={cn(`text-[64px] font-bold leading-tight text-white bg-info   w-fit px-10 py-4 rounded-2xl`, `lg:text-[32px]`)}>
          ZERO - Marketplace
        </h2>
      </div>

      <div className={cn(`container relative mt-4`, `lg:mt-6 lg:!px-0`)}>
        <div className="flex lg:grid justify-between text-center gap-4 ">
          <div className="market-filter-type-section w-1/4 lg:w-[90%] mx-auto border-2 rounded-2xl border-neutral-800    ">
            <div className={`${marketZeroFilter.subtype || `flex`} justify-center  py-4 border-neutral-800 rounded-t-xl w-full bg-opacity-90 r`} onClick={() => setHideCategory(!hideCategory)}>
              <h2 className={cn(`text-[28px]  font-bold leading-tight    py-1  `, `lg:text-2xl`)}>{marketZeroFilter.type || `CATEGORIES`} </h2>
              <h2 className={cn(`text-[14px] my-auto ml-1 font-bold leading-tight transition-all ${marketZeroFilter.subtype ? `scale-100` : `scale-y-0`}   py-1  `, `lg:text-2xl`)}>{marketZeroFilter.subtype || ``} </h2>
              {/* <h2 className={cn(`text-[28px] block lg:hidden font-bold leading-tight    py-1  `, `lg:text-2xl`)}>CATEGORIES</h2> */}
              <div className="hidden lg:block my-auto ml-2"> {hideCategory ? (<FontAwesomeIcon icon={faArrowDownWideShort} />) : (<FontAwesomeIcon icon={faArrowUpWideShort} />)}</div>
            </div>
            <div className={`p-4    block transition-all duration-250 border-t-2 border-neutral-800 lg:grid ${hideCategory ? `lg:scale-y-0 lg:h-0 lg:p-0 lg:border-t-0` : `scale-100 lg:p-4`}`}>
              {ROM_MARKET_TYPE.map(type => (<>
                <div className="flex justify-center mb-2 text-xl">
                  <div className={`flex w-fit py-2 pl-6 pr-8  rounded-xl cursor-pointer  transition-all  ${marketZeroFilter.type == type ? `font-extrabold bg-info bg-opacity-80 text-white scale-105` : ` bg-white`}`} onClick={() => setMarketZeroFilter({ type, subtype: `` })}>

                    <div className="my-auto ml-1"> {type}</div>
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
        <div className="mt-4 ml-0 lg:ml-6">
          <p className="inline  ">
            Accumulated Trading Volumes:
          </p>
          <p className="2 inline ml-1 font-bold">
            {(marketZeroTax.marketplaceTax * 5).toLocaleString('en-US', { maximumFractionDigits: 0 })} EON
          </p>
          <h4 className={`text-right -mt-6 lg:mt-0 font-semibold text-secondary`}>80% Import Fee on Redeem Zeny </h4>
          <h4 className={`text-right font-semibold text-secondary`}>into different Servers ~ approximately 800k</h4>
        </div>
      </div>



    </section>
 
  </>)
}

export const RecentlySold = () => {
  const [marketHistoryZero, setMarketHistoryZero] = useAtom(marketHistoryZeroAtom);
  const [historyType, setHistoryType] = useAtom(displayMarketZeroHistoryAtom);
  return (<>
    {/* Recently Sold */}
    <section className={cn(`py- `, `lg:pt-0 `)}>
      {!marketHistoryZero || !marketHistoryZero.length ? (<></>) : (<>
        <div className={cn(`container  `)}>
          <h2 className={cn(`text-[48px] font-bold leading-tight`, `lg:text-2xl`)}>Recently Sold</h2>
          <div className="flex gap-4">
            <h5 className={`cursor-pointer ${historyType == `Recommended` && `font-bold`}`} onClick={() => setHistoryType(`Recommended`)}>Recommended</h5>
            <h5 className={`cursor-pointer ${historyType == `Latest` && `font-bold`}`} onClick={() => setHistoryType(`Latest`)}>Lastest</h5>
          </div>
        </div>
      </>)}

      <div className={cn(`container relative mt-4`, `lg:mt-6 lg:!px-0`)}>
        <Swiper
          navigation={{
            prevEl: '#recently-navigation-prev',
            nextEl: '#recently-navigation-next',
          }}
          modules={[Navigation]}
          className={cn(`[&>.swiper-wrapper]:pb-4`)}
          breakpoints={{
            319: {
              slidesPerView: 1.35,
              spaceBetween: 4,
              slidesOffsetBefore: 20,
              slidesOffsetAfter: 20,
            },
            641: {
              slidesPerView: 2.5,
              spaceBetween: 10,
              slidesOffsetBefore: 32,
              slidesOffsetAfter: 32,
            },
            1025: {
              slidesPerView: 5,
              spaceBetween: 8,
            },
          }}
        >
          {/* {[...Array(5).keys()] */}
          {/* <div className="grid grid-cols-3 gap-2 max-h-[38rem] overflow-auto"> */}
          {!marketHistoryZero?.length ? (<></>) :
            marketHistoryZero.sort((a, b) => historyType == `Recommended` ? (b.price / b.itemAmount) - (a.price / a.itemAmount) : b.marketHistoryId - a.marketHistoryId)
              .map((n) => ({
                id: `${n.marketHistoryId}`,
                image: `${n.itemPictureUrl.length > 10 ? n.itemPictureUrl : `/images/chains/bsc.png`}`,
                collection: 'ZERO - Eternal Nexus M',
                name: `${n.itemName}`,
                price: n.price,
                priceUSD: n.price,
                createdAt: new Date(`${n.actionTime}`),
                amount: n.itemAmount,
                chain: {
                  symbol: 'bsc',
                },
              }))
              .map((recently, recentlyIdx) => (
                <SwiperSlide
                  key={`recently-slide-${recentlyIdx}`}
                  className={cn(
                    `relative p-2`,
                    `[&:hover>div]:bg-info`,
                    `[&:hover>div]:shadow-recently`,
                    `[&:hover>div>.recently-id]:bg-white`,
                    `[&:hover>div>.recently-id]:text-info`,
                    `[&:hover>div>.recently-id]:rounded-none`,
                    `[&:hover]:text-white`,
                    `[&:hover_.price]:text-white`,
                    // pseudo class
                    `[&:hover]:before:rounded-[40px]`,
                    `[&:hover]:before:inset-0`,
                    `[&:hover]:before:absolute`,
                    `[&:hover]:before:pointer-events-none`,
                    `[&:hover]:before:-z-10`,
                    `pt-10`,
                    `[&:hover]:pt-0`,

                  )}
                >
                  <div className={cn(`rounded-[32px] bg-card p-4`, `transition-all duration-300 `, `lg:p-5`)}>
                    <div className={cn(`recently-id inline-block bg-white px-2 text-info`)}>
                      #{recently.id}
                    </div>
                    <div className={cn(`mt-2 flex items-center space-x-2`)}>
                      <div className={cn(`flex-1 truncate font-semibold`)}>{recently.collection}</div>
                      <Image src={`/images/chains/${recently.chain.symbol}.png`} alt="" width={24} height={24} />
                    </div>
                    <div className={cn(`mt-4 flex aspect-square items-center justify-center rounded-2xl bg-white p-2`)}>
                      <Image
                        src={recently.image || `ggg`}
                        alt=""
                        width={176}
                        height={176}
                        className={cn(`h-full w-full object-contain`)}
                        priority
                      />
                    </div>
                    <div className={cn(`mt-4 space-y-2 overflow-hidden max-w-[300px]`)}>
                      <p className={cn(`text-[22px] font-bold inline whitespace-nowrap overflow-ellipsis`)}>
                        {recently.name}
                      </p>
                      {recently.amount > 1 && <div className={cn(`text-[18px] font-bold inline ml-1`)}>x{recently.amount}</div>}
                      <div>
                        <div className={cn(`price text-xl font-bold text-success`, `transition-all duration-300`)}>
                          {recently.amount > 1 ? `${recently.amount}x ${(recently.price) / recently.amount} EON` : `${recently.price} EON`}
                        </div>
                        <div>{recently.amount > 1 ? `${recently.amount}x ${((recently.priceUSD / 10) / recently.amount).toFixed(2)} USD` : ` ${(recently.priceUSD / 10).toFixed(2)} USD`}</div>
                      </div>
                      <div className={cn(`text-xs whitespace-nowrap overflow-ellipsis`)}>
                        {format(recently.createdAt, 'MMM dd yyyy, HH:mm')}
                      </div>
                    </div>


                  </div>
                </SwiperSlide>
              ))}
          {/* </div> */}
        </Swiper>

        {/* Navigation */}
        <div
          className={cn(
            `pointer-events-none absolute -left-10 -right-10 top-1/2 z-10 -translate-y-1/2`,
            `3xl:-left-6 3xl:-right-6`,
            `lg:relative lg:left-0 lg:right-0 lg:top-0 lg:translate-y-0 lg:px-8`,
            `sm:px-5`,
          )}
        >
          <div className={cn(`flex items-center justify-between`)}>
            <button id="recently-navigation-prev" className={cn(`pointer-events-auto disabled:opacity-40`)}>
              <IconArrowCircleLeft className={cn(`text-[56px] text-info`)} />
            </button>
            <button id="recently-navigation-next" className={cn(`pointer-events-auto disabled:opacity-40`)}>
              <IconArrowCircleRight className={cn(`text-[56px] text-info`)} />
            </button>
          </div>
        </div>
      </div>
    </section>
  </>)
}

export default Page
