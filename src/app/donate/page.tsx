'use client'

import useEagerConnect from '../../hooks/useEagerConnect'
// import { GoogleAuthUserInfoAtom, authAtom, eonhubUserDetailAtom, hideSealMetaverseAtom, isLoadingAtom, topupPackageListAtom, selectedPresalePackAtom, mallListAtom } from "../../atoms";
import { useAtom } from 'jotai'
import React, { useEffect, useState } from 'react'
import { useEthers } from '@usedapp/core'
import { eonhubApiCreate, googleApiCreate } from '../../axios'
// import { IUserCookie, SealMetaverseGameID } from "../../components/Auth/Google";
// import { Web3Panel } from "../../../components/Web3Panel";
// import { SealMetaverseSection } from "../../components/Auth";
import { useCookies } from 'react-cookie'
// import { IPresalePackage } from "../../types";
// import { PresalePackage } from "../../components/Presale";

// import "react-multi-carousel/lib/styles.css";
import Image from 'next/image'
import { TopupPackage } from '../../components/topup/package'
import {
  eonhubUserDetailAtom,
  GoogleAuthUserInfoAtom,
  isLoadingAtom,
  selectedServerAtom,
  userMyLotteryAtom,
  userRefcodeZeroAtom,
} from '@/atoms/eonhub'
import {
  mallListAtom,
  topupPackageListAtom,
  topupZeroPackageListAtom,
  zeroBigbroPackagesAtom,
  zeroBigbroPremiumPackagesAtom,
  zeroEternalLoveDailyRewardAtom,
  zeroEternalLoveHistoryAtom,
  zeroPcPackagesAtom,
  zeroPremiumDailyPackagesAtom,
  zeroPresalePackagesAtom,
} from '@/atoms/seal'
import {
  IEonUserDetail,
  IPresalePackage,
  RO_ZERO_PC_GAME_ID,
  SEAL_METAVERSE_GAME_ID,
  ZERO_ETERNAL_LOVE_GAME_ID,
} from '@/types/eonhub'
import { presaleListMock, ZERO_CASH_PACKAGES } from '@/atoms/mock'
import PackCard from '@/components/cards/pack-card'
import ChainTab from '@/components/tabs/chain-tab'
import { cn } from '@/utils/styling'
import TopupCard from '@/components/cards/topup-card'
import DailyRewardCard from '@/components/cards/daily-reward'
import { beginerDeadline, luckyPackDeadline, OBT_DAILY_REWARD, rom888Deadline, roTozPcPresaleDeadline, TOZ_BATTLE_PASS_SS3_END, valkyrieDeadline } from '@/constants/rom'
import { ZeroSelectServer } from '@/components/zero-eternal-love/inventoryWhitelist'
import MarketService from '@/services/market.service'
import { toast } from 'react-toastify'
import UserService from '@/services/user.service'
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Footer from '../footer'
import { ZeroPcSelectServer } from '@/components/zero-pc/market'
import Countdown from 'react-countdown'
import ReactorROM from '@/components/zeno-reactor'

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 5,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
}

export const DAI_TOKEN_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f'

function PackagesList() {
  const [hideUI, setHideUI] = useState(true)
  const { account, library } = useEthers()

  const triedToEagerConnect = useEagerConnect()

  const [eonhubUserDetail, setEonhubUserDetailAtom] = useAtom(eonhubUserDetailAtom)

  const isConnected = typeof account === 'string' && !!library

  const [googleAuth, setGoogleAuth] = useAtom(GoogleAuthUserInfoAtom)
  const googleAPI = googleApiCreate()
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom)
  const [cookie, setCookie, removeCookie] = useCookies(['eonhub-auth'])
  const userCookie: IEonUserDetail = cookie['eonhub-auth']
  const eonhubAPI = eonhubApiCreate(userCookie?.token)
  // const userService = new UserService();

  const [topupPackageList, settopupPackageList] = useAtom(topupPackageListAtom)
  const [mallList, setMallList] = useAtom(mallListAtom)

  const [topupZeroPackageList, setTopupZeroPackageList] = useAtom(topupZeroPackageListAtom)
  const [zeroEternalLoveHistory, setZeroEternalLoveHistory] = useAtom(zeroEternalLoveHistoryAtom)

  const fetchPurchaseHistory = async () => {
    const response = await eonhubAPI.get(`/api/package/${selectedServer?.gameId}/history?packageType=PRE_SALES`, {
      // token: codeResponse.access_token,
      // email: userInfoReq.data.email,
      // gameId: SealMetaverseGameID,
      // refererCode: refCode ? refCode : ``,
    })
    if (response && response?.data && response?.data?.data) {
      const result = response?.data?.data || []
      setZeroEternalLoveHistory(result)
    }
  }

  const requestMallPackage = async () => {
    await eonhubAPI
      .get(`/api/package/${selectedServer?.gameId}?packageType=MALL&page=1&perPage=5`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userCookie?.token}`,
        },
      })
      .then((res) => {
        if (res.status == 200) {
          if (res?.data?.data) {
            setMallList(res?.data?.data)
            // setEonhubUserDetail({ ...eonhubUserDetail, ...res.data });
          }
        } else {
          // console.log("No status");
        }
      })
  }

  const requestZeroCashPackage = async () => {
    await eonhubAPI
      .get(`/api/package/${selectedServer?.gameId}?packageType=CASH`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userCookie?.token}`,
        },
      })
      .then((res) => {
        if (res.status == 200) {
          if (res?.data?.data) {
            setTopupZeroPackageList(res?.data?.data)
            // setEonhubUserDetail({ ...eonhubUserDetail, ...res.data });
          }
        } else {
          // console.log("No status");
        }
      })
  }

  const requestZeroPresalePackage = async () => {
    await eonhubAPI
      .get(`/api/package/${selectedServer?.gameId}?packageType=PRE_SALES`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userCookie?.token}`,
        },
      })
      .then((res) => {
        if (res.status == 200) {
          if (res?.data?.data) {
            setZeroPresalePackages(res?.data?.data)
          }
        } else {
          // console.log("No status");
        }
      })
  }

  const [zeroPresalePackages, setZeroPresalePackages] = useAtom(zeroPresalePackagesAtom)

  const [zeroPcPackages, setZeroPcPackages] = useAtom(zeroPcPackagesAtom)

  const requestZeroPcPackage = async () => {
    await eonhubAPI
      .get(`/api/package/${selectedServer?.gameId}?packageType=PRE_SALES`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userCookie?.token}`,
        },
      })
      .then((res) => {
        if (res.status == 200) {
          if (res?.data?.data) {
            setZeroPresalePackages(res?.data?.data)
          }
        } else {
          // console.log("No status");
        }
      })
  }

  const [zeroPremiumDailyPackages, setZeroPremiumDailyPackages] = useAtom(zeroPremiumDailyPackagesAtom)
  const requestZeroPremiumDailyPackage = async () => {
    await eonhubAPI
      .get(`/api/package/${selectedServer?.gameId}?packageType=PREMIUM_DAILY_REWARD`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userCookie?.token}`,
        },
      })
      .then((res) => {
        if (res.status == 200) {
          if (res?.data?.data) {
            setZeroPremiumDailyPackages(res?.data?.data)
            // settopupPackageList(res?.data?.data)
            // setEonhubUserDetail({ ...eonhubUserDetail, ...res.data });
          }
        } else {
          // console.log("No status");
        }
      })
      .catch((err) => {
        console.error('err: ', err)
      })
  }

  const [zeroEternalLoveDailyReward, setZeroEternalLoveDailyReward] = useAtom(zeroEternalLoveDailyRewardAtom)
  const requestZeroDailyPackage = async () => {
    await eonhubAPI
      .get(`/api/package/${selectedServer?.gameId}?packageType=DAILY_REWARD`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userCookie?.token}`,
        },
      })
      .then((res) => {
        if (res.status == 200) {
          if (res?.data?.data) {
            setZeroEternalLoveDailyReward(res?.data?.data)
            // settopupPackageList(res?.data?.data)
            // setEonhubUserDetail({ ...eonhubUserDetail, ...res.data });
          }
        } else {
          // console.log("No status");
        }
      })
      .catch((err) => {
        console.error('err: ', err)
      })
  }

  const [zeroBigbroPremiumPackages, setZeroBigbroPremiumPackages] = useAtom(zeroBigbroPremiumPackagesAtom)
  const requestZeroBigbroPremiumPackages = async () => {
    await eonhubAPI
      .get(`/api/package/${selectedServer?.gameId}?packageType=BIG_BRO_PREMIUM_DAILY_REWARD`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userCookie?.token}`,
        },
      })
      .then((res) => {
        if (res.status == 200) {
          if (res?.data?.data) {
            setZeroBigbroPremiumPackages(res?.data?.data)
            // settopupPackageList(res?.data?.data)
            // setEonhubUserDetail({ ...eonhubUserDetail, ...res.data });
          }
        } else {
          // console.log("No status");
        }
      })
      .catch((err) => {
        console.error('err: ', err)
      })
  }

  const [zeroBigbroPackages, setZeroBigbroPackages] = useAtom(zeroBigbroPackagesAtom)
  const requestZeroBigbroPackages = async () => {
    await eonhubAPI
      .get(`/api/package/${selectedServer?.gameId}?packageType=BIG_BRO_DAILY_REWARD`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userCookie?.token}`,
        },
      })
      .then((res) => {
        if (res.status == 200) {
          if (res?.data?.data) {
            setZeroBigbroPackages(res?.data?.data)
            // settopupPackageList(res?.data?.data)
            // setEonhubUserDetail({ ...eonhubUserDetail, ...res.data });
          }
        } else {
          // console.log("No status");
        }
      })
      .catch((err) => {
        console.error('err: ', err)
      })
  }

  const [userRefcodeZero, setUserRefcodeZero] = useAtom(userRefcodeZeroAtom)
  useEffect(() => {
    if (!userCookie || !selectedServer?.gameId) return
    requestZeroPresalePackage()
    requestZeroDailyPackage()
    requestZeroCashPackage()
    requestZeroPremiumDailyPackage()
    if (!zeroBigbroPremiumPackages.length) requestZeroBigbroPremiumPackages()
    if (!zeroBigbroPackages.length) requestZeroBigbroPackages()

    requestMallPackage()
    fetchPurchaseHistory()

    if (!userRefcodeZero) userService.fetchZeroRefCode(userCookie?.token, setCookie, removeCookie, setUserRefcodeZero)

    marketService
      .fetchMyLottery(userCookie?.token, setUserMyLottery)
      .then((e) => {
        // userService.fetchUserInfo(userCookie?.token, setCookie, removeCookie, () => { });
      })
      .finally(() => {
        // setLotteryInput([``, ``, ``, ``, ``, ``])
      })
  }, [userCookie])

  const dataDisplay = zeroEternalLoveDailyReward ? zeroEternalLoveDailyReward : OBT_DAILY_REWARD
  const [selectedServer, setSelectedServer] = useAtom(selectedServerAtom)
  const [userMyLottery, setUserMyLottery] = useAtom(userMyLotteryAtom)

  const [lotteryInput, setLotteryInput] = useState<string[]>([``, ``, ``, ``, ``, ``])

  const onInputLottery = (e: any) => {
    switch (e?.target?.id) {
      case `code-1`:
        setLotteryInput([
          e?.target?.value,
          lotteryInput[1],
          lotteryInput[2],
          lotteryInput[3],
          lotteryInput[4],
          lotteryInput[5],
        ])
        document.getElementById('code-2').focus()
        break
      case `code-2`:
        setLotteryInput([
          lotteryInput[1],
          e?.target?.value,
          lotteryInput[2],
          lotteryInput[3],
          lotteryInput[4],
          lotteryInput[5],
        ])
        document.getElementById('code-3').focus()
        break
      case `code-3`:
        setLotteryInput([
          lotteryInput[1],
          lotteryInput[1],
          e?.target?.value,
          lotteryInput[3],
          lotteryInput[4],
          lotteryInput[5],
        ])
        document.getElementById('code-4').focus()
        break
      case `code-4`:
        setLotteryInput([
          lotteryInput[1],
          lotteryInput[1],
          lotteryInput[2],
          e?.target?.value,
          lotteryInput[4],
          lotteryInput[5],
        ])
        document.getElementById('code-5').focus()
        break
      case `code-5`:
        setLotteryInput([
          lotteryInput[1],
          lotteryInput[1],
          lotteryInput[2],
          lotteryInput[3],
          e?.target?.value,
          lotteryInput[5],
        ])
        document.getElementById('code-6').focus()
        break
      case `code-6`:
        setLotteryInput([
          lotteryInput[1],
          lotteryInput[1],
          lotteryInput[2],
          lotteryInput[3],
          lotteryInput[4],
          e?.target?.value,
        ])
        document.getElementById('code-6').focus()
        break
      default:
        break
    }
  }

  const isReadyToBuyLottery = () => {
    return (
      lotteryInput[0] && lotteryInput[1] && lotteryInput[2] && lotteryInput[3] && lotteryInput[4] && lotteryInput[5]
    )
  }

  const marketService = new MarketService()
  const userService = new UserService()

  const onPurchaseLottery = () => {
    if (!isReadyToBuyLottery()) return toast.error(`Please input your Lucky Numbers!`)
    const myInputLottery = `${lotteryInput[0] + lotteryInput[1] + lotteryInput[2] + lotteryInput[3] + lotteryInput[4] + lotteryInput[5]}`
    marketService
      .purchaseLottery(userCookie?.token, myInputLottery)
      .then((e) => {
        userService.fetchUserInfo(userCookie?.token, setCookie, removeCookie, () => { })
      })
      .finally(() => {
        setLotteryInput([``, ``, ``, ``, ``, ``])
      })
  }

  const [firstRender, setFirstRender] = useState(false)
  useEffect(() => {
    setFirstRender(true)
  }, [])

  const [showMyLottery, setShowMyLottery] = useState(false)

  useEffect(() => {
    // if (selectedServer?.gameId == ZERO_ETERNAL_LOVE_GAME_ID) {
    if (!userCookie || !selectedServer?.gameId) return
    requestZeroPresalePackage()
    requestZeroDailyPackage()
    requestZeroCashPackage()
    requestZeroPremiumDailyPackage()
    // if (!zeroBigbroPremiumPackages.length)
    requestZeroBigbroPremiumPackages()
    // if (!zeroBigbroPackages.length)
    requestZeroBigbroPackages()

    requestMallPackage()
    fetchPurchaseHistory()
    // }
    // if (selectedServer?.gameId == RO_ZERO_PC_GAME_ID) {
    //     requestZeroPcPackage();
    // }
  }, [selectedServer?.gameId])

  return !selectedServer?.gameId ? (
    <div className="relative flex h-screen justify-center">
      <div className="mx-auto my-auto">
        <ZeroPcSelectServer />
      </div>
    </div>
  ) : (
    <>
      <div className="relative flex h-fit justify-center  rounded-2xl p-10 lg:p-4">
        <ZeroPcSelectServer />
      </div>

      {/* Lottery */}
      {selectedServer?.gameId == ZERO_ETERNAL_LOVE_GAME_ID && (<>
        <section
          className={cn(
            `mt-12   bg-[url('/images/rom/lucky-draw-login-bg.png')] bg-cover backdrop-opacity-10 shadow-md border-[0.75rem] flex duration-30 relative z-10 mx-auto mb-20 w-fit rounded-xl    py-20 px-10 transition-all  lg:p-4 lg:py-10 ${firstRender ? `` : `-translate-y-[200%]`}`,
            `${isReadyToBuyLottery() ? `border-secondary bg-secondary bg-opacity-90 text-white` : `bg-opacity-60`} border-secondary`,
          )}
        >
          <div className={cn(`mt-6 pb-6 flex flex-row lg:flex-col justify-center gap-24 lg:gap-4 text-center`)}>
            <div className="  text-center max-w-[45%] mx-auto h-fit my-auto">

              
            <img src="/images/rom/lucky-draw-login-header.png" alt="lucky-draw-login-header.png lucky-draw" className="" />
          
                
          
              <img src="/images/rom/big-cat-red-hat-right.png" alt="big-cat-red-hat-right.png lucky-draw" className="user-photo absolute -left-[5%] bottom-[15%] lg:bottom-[0%] lg:-left-[20%] z-[-1]" />
            </div>
            {/* <div className='flex flex-col'>  */}
             <ReactorROM />
            {/* </div> */}
          </div>
        </section>
      </>)}

      {/* Launch */}
      <section
        className={cn(
          `relative z-10 pb-4 ${selectedServer?.gameId != ZERO_ETERNAL_LOVE_GAME_ID && `hidden`}`,
          `lg:pb-10`,
        )}
      >
        <div className={cn(`container`)}>
          <ChainTab disabledSymbol="optimistic" className={cn(`mx-auto mt-8 max-w-[464px]`)} />


          {/* <div
            className={cn(
              `scrollable-content relative mt-4 flex max-w-full items-end gap-4 space-x-12 overflow-x-auto `,
              `lg:items-center  lg:gap-6 lg:space-x-0 lg:space-y-8`,
            )}
          >
            {zeroPresalePackages?.map((presalePackage, index) =>
              presalePackage?.packageName?.includes(`Chain`) ? (
                <TopupCard
                  gameId={ZERO_ETERNAL_LOVE_GAME_ID}
                  detail={presalePackage}
                  key={presalePackage.packageId}
                  id={presalePackage.packageId}
                  name={presalePackage.packageName}
                  price={presalePackage.price / 10}
                  image={presalePackage.packagePictureUrl}
                  // isActive={presalePackage.isPurchaseable}
                  isActive={presalePackage.packageName?.includes(`Lucky`) ? true : false}
                  className={cn(`w-full max-w-[400px] flex-1`)}
                  // closeDate={starterDeadline}
                />
              ) : (
                <></>
              ),
            )}
            {topupZeroPackageList.map((presalePackage, index) => (
              <TopupCard
                gameId={ZERO_ETERNAL_LOVE_GAME_ID}
                detail={presalePackage}
                key={presalePackage.packageId}
                id={presalePackage.packageId}
                name={presalePackage.packageName}
                price={presalePackage.price / 10}
                image={presalePackage.packagePictureUrl}
                // isActive={!presalePackage.isPurchaseable}
                isActive={presalePackage.isFirstTopup ? true : false}
                className={cn(`w-full max-w-[400px] flex-1`)}
              />
            ))}
          </div> */}

          <div
            className={cn(
              `scrollable-content relative mt-2 flex max-w-full items-end gap-4 space-x-12 overflow-x-auto `,
              `lg:items-center  lg:gap-6 lg:space-x-0 lg:space-y-8`,
            )}
          >

            <div className={cn(`mb-[4rem] mt-0 text-center lg:mb-0 lg:mt-[8rem]`)}>
              <h2 className={cn(`text-[64px] font-bold leading-tight text-[#ed6049]`, `lg:text-[32px]`)}>
                 Best Seller!
              </h2>
              {/* <div className={cn(`text-[40px] font-bold`, `lg:text-2xl`)}>for all packages</div> */}
              <div className={cn(`my-4 text-center text-[16px] font-semibold`, `lg:text-md`)}>
                ( Seasonal, limited time bonuses )
              </div>
            </div>

            {zeroPresalePackages
              ?.filter((e) => e?.packageName?.includes(`Zero Blessing`))
              .map((presalePackage, index) => (
                <TopupCard
                  gameId={ZERO_ETERNAL_LOVE_GAME_ID}
                  detail={presalePackage}
                  key={presalePackage.packageId}
                  id={presalePackage.packageId}
                  name={presalePackage.packageName}
                  price={presalePackage.price / 10}
                  image={presalePackage.packagePictureUrl}
                  isActive={false}
                  className={cn(`w-full max-w-[400px] flex-1`)}
                  resetDate={
                    !presalePackage?.packageName?.includes(`Zero Blessing Pack II`) ?
                      new Date(new Date().setDate(new Date().getDate() + ((1 + 7 - new Date().getDay()) % 7))) : null}
                />
              ))}

            {zeroPresalePackages
              ?.filter((e) => e?.packageName?.includes(`Time`))
              .map((presalePackage, index) => (
                <TopupCard
                  gameId={ZERO_ETERNAL_LOVE_GAME_ID}
                  detail={presalePackage}
                  key={presalePackage.packageId}
                  id={presalePackage.packageId}
                  name={presalePackage.packageName}
                  price={presalePackage.price / 10}
                  image={presalePackage.packagePictureUrl}
                  isActive={false}
                  className={cn(`w-full max-w-[400px] flex-1`)}
                />
              ))}

            {zeroPresalePackages
              ?.filter((e) => e?.packageName?.includes(`Starter`) || e?.packageName?.includes(`Month`) || e?.packageName?.includes(`Tokyo`))
              .map((presalePackage, index) => (
                <TopupCard
                  gameId={ZERO_ETERNAL_LOVE_GAME_ID}
                  detail={presalePackage}
                  key={presalePackage.packageId}
                  id={presalePackage.packageId}
                  name={presalePackage.packageName}
                  price={presalePackage.price / 10}
                  image={presalePackage.packagePictureUrl}
                  isActive={false}
                  className={cn(`w-full max-w-[400px] flex-1`)}
                />
              ))}
          </div>

          <div className="flex ">
            <div
              className={cn(
                `scrollable-content relative mt-2 flex max-w-full items-end gap-4 space-x-12 overflow-x-auto `,
                `lg:items-center  lg:gap-6 lg:space-x-0 lg:space-y-8`,
              )}
            >


            {zeroPresalePackages
                ?.filter((e) =>  e?.packageName?.includes(`Racing`) )
                .map((presalePackage, index) => (
                  <TopupCard
                    gameId={ZERO_ETERNAL_LOVE_GAME_ID}
                    detail={presalePackage}
                    key={presalePackage.packageId}
                    id={presalePackage.packageId}
                    name={presalePackage.packageName}
                    price={presalePackage.price / 10}
                    image={presalePackage.packagePictureUrl}
                    isActive={false}
                    className={cn(`w-full max-w-[400px] flex-1`)}
                  />
                ))}


            {zeroPresalePackages
                ?.filter((e) =>  e?.packageName?.includes(`Zero Special Pack`) )
                .map((presalePackage, index) => (
                  <TopupCard
                    gameId={ZERO_ETERNAL_LOVE_GAME_ID}
                    detail={presalePackage}
                    key={presalePackage.packageId}
                    id={presalePackage.packageId}
                    name={presalePackage.packageName}
                    price={presalePackage.price / 10}
                    image={presalePackage.packagePictureUrl}
                    isActive={true}
                    className={cn(`w-full max-w-[400px] flex-1`)}
                  />
                ))}


            {zeroPresalePackages
              ?.filter((e) => e?.packageName?.includes(` Treasure`))
              .map((presalePackage, index) => (
                <TopupCard
                  gameId={ZERO_ETERNAL_LOVE_GAME_ID}
                  detail={presalePackage}
                  key={presalePackage.packageId}
                  id={presalePackage.packageId}
                  name={presalePackage.packageName}
                  price={presalePackage.price / 10}
                  image={presalePackage.packagePictureUrl}
                  isActive={true}
                  className={cn(`w-full max-w-[400px] flex-1`)}
                  // resetDate={
                  //   !presalePackage?.packageName?.includes(`Zero Blessing Pack II`) ?
                  //     new Date(new Date().setDate(new Date().getDate() + ((1 + 7 - new Date().getDay()) % 7))) : null}
                />
              ))}

              {zeroPresalePackages
                ?.filter((e) => e?.packageName?.includes(`Newbie`) || e?.packageName?.includes(`Adventure`) || e?.packageName?.includes(`Valkyrie`))
                .map((presalePackage, index) => (
                  <TopupCard
                    gameId={ZERO_ETERNAL_LOVE_GAME_ID}
                    detail={presalePackage}
                    key={presalePackage.packageId}
                    id={presalePackage.packageId}
                    name={presalePackage.packageName}
                    price={presalePackage.price / 10}
                    image={presalePackage.packagePictureUrl}
                    isActive={false}
                    className={cn(`w-full max-w-[400px] flex-1`)}
                  />
                ))}
            </div>

            <div className={cn(`my-auto ml-4 text-center`)}>
              <h2 className={cn(`text-[64px] font-bold leading-tight text-[#ed6049]`, `lg:text-[32px]`)}>
                New Adventures!
              </h2>
              {/* <div className={cn(`text-[40px] font-bold`, `lg:text-2xl`)}>for all packages</div> */}
              <div className={cn(`my-4 text-center text-[16px] font-semibold`, `lg:text-md`)}>
                ( BUY NOW!, and claim your special bonuses )
              </div>
            </div>
          </div>
          <div
            className={cn(
              `scrollable-content relative mt-2 flex max-w-full items-end gap-4 space-x-12 overflow-x-auto `,
              `lg:items-center  lg:gap-6 lg:space-x-0 lg:space-y-8`,
            )}
          >
            <div className={cn(`mb-[4rem] mt-0 text-center lg:mb-0 lg:mt-[8rem]`)}>
              <h2 className={cn(`text-[64px] font-bold leading-tight text-[#ed6049]`, `lg:text-[32px]`)}>
                PRO Players Packages!
              </h2>
              {/* <div className={cn(`text-[40px] font-bold`, `lg:text-2xl`)}>for all packages</div> */}
              <div className={cn(`my-4 text-center text-[16px] font-semibold`, `lg:text-md`)}>
                ( BUY NOW!, and claim your special bonuses )
              </div>
            </div>



            {zeroPresalePackages
              ?.filter((e) => e?.packageName?.includes(`Velocity`))
              .map((presalePackage, index) => (
                <TopupCard
                  gameId={ZERO_ETERNAL_LOVE_GAME_ID}
                  detail={presalePackage}
                  key={presalePackage.packageId}
                  id={presalePackage.packageId}
                  name={presalePackage.packageName}
                  price={presalePackage.price / 10}
                  image={presalePackage.packagePictureUrl}
                  isActive={true}
                  className={cn(`w-full max-w-[400px] flex-1`)}
                  // resetDate={
                  //   !presalePackage?.packageName?.includes(`Zero Blessing Pack II`) ?
                  //     new Date(new Date().setDate(new Date().getDate() + ((1 + 7 - new Date().getDay()) % 7))) : null}
                />
              ))}

            {zeroPresalePackages
              ?.filter((e) => e?.packageName?.includes(`Big Bro`) || e?.packageName?.includes(`Rank`))
              .map((presalePackage, index) => (
                <TopupCard
                  gameId={ZERO_ETERNAL_LOVE_GAME_ID}
                  detail={presalePackage}
                  key={presalePackage.packageId}
                  id={presalePackage.packageId}
                  name={presalePackage.packageName}
                  price={presalePackage.price / 10}
                  image={presalePackage.packagePictureUrl}
                  isActive={false}
                  className={cn(`w-full max-w-[400px] flex-1`)}
                />
              ))}
          </div>
        </div>

        <div className={cn(`mt-16 text-center`)}>
          <h2 className={cn(`text-[64px] font-bold leading-tight text-[#ed6049]`, `lg:text-[32px]`)}>
            Big Cat Coin Package(s) x2
          </h2>
          {/* <div className={cn(`text-[40px] font-bold`, `lg:text-2xl`)}>for all packages</div> */}
          <div className={cn(`my-4 text-center text-[16px] font-semibold text-red-500`, `lg:text-md`)}>
            Big Cat Coins Package(s) x2 ( 1 time Monthly, reset on 1st of the month )
          </div>
        </div>

        <div
          className={cn(
            `scrollable-content relative mt-4 flex max-w-full items-end gap-4 space-x-12 overflow-x-auto `,
            `lg:items-center  lg:gap-6 lg:space-x-0 lg:space-y-8`,
          )}
        >
          {zeroPresalePackages?.map((presalePackage, index) =>
            presalePackage?.packageName?.includes(`Chain`) ? (
              <TopupCard
                gameId={ZERO_ETERNAL_LOVE_GAME_ID}
                detail={presalePackage}
                key={presalePackage.packageId}
                id={presalePackage.packageId}
                name={presalePackage.packageName}
                price={presalePackage.price / 10}
                image={presalePackage.packagePictureUrl}
                // isActive={presalePackage.isPurchaseable}
                isActive={presalePackage.packageName?.includes(`Lucky`) ? true : false}
                className={cn(`w-full max-w-[400px] flex-1`)}
              // closeDate={starterDeadline}
              />
            ) : (
              <></>
            ),
          )}
          {topupZeroPackageList.map((presalePackage, index) => (
            <TopupCard
              gameId={ZERO_ETERNAL_LOVE_GAME_ID}
              detail={presalePackage}
              key={presalePackage.packageId}
              id={presalePackage.packageId}
              name={presalePackage.packageName}
              price={presalePackage.price / 10}
              image={presalePackage.packagePictureUrl}
              // isActive={!presalePackage.isPurchaseable}
              isActive={presalePackage.isFirstTopup ? true : false}
              className={cn(`w-full max-w-[400px] flex-1`)}
            />
          ))}
        </div>
      </section>

      <section className={cn(`py-16 ${selectedServer?.gameId != ZERO_ETERNAL_LOVE_GAME_ID && `hidden`}`, `lg:py-10`)}>
        <div className={cn(`relative mt-2 text-center`)}>
          <h2
            className={cn(
              `text-[64px] font-bold leading-tight text-secondary transition-all duration-300 ${selectedServer.serverID ? `text-secondary` : `animate-pulse opacity-90`}`,
              `lg:text-[32px]`,
            )}
          >
            ZERO - BIG BRO Daily
          </h2>
          <span
            className={`absolute right-1/4 top-0 me-2 rounded bg-[#ed6049] bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-200 text-white  ${selectedServer.serverID ? ` ` : `animate-pulse opacity-90`}`}
          >
            NEW!
          </span>
        </div>

        <div className=" relative z-40 mt-3 flex justify-center">
          <ZeroSelectServer className="text-neutral-500 " />
        </div>
        <div
          className={`container transition-all duration-300 ${selectedServer.serverID ? `scale-y-100` : `h-0 scale-y-0`}`}
        >
          <div
            className={cn(
              ` scrollable-content relative -mt-14 flex max-w-full items-end space-x-12 overflow-hidden overflow-x-auto `,
              ` gap-4 lg:items-center lg:space-x-0 lg:space-y-8`,
            )}
          >
            {zeroBigbroPackages.map((presalePackage, index) => (
              <>
                <div className={`grid-rows grid justify-center pt-20 transition-all   `}>
                  <DailyRewardCard
                    gameId={ZERO_ETERNAL_LOVE_GAME_ID}
                    detail={presalePackage}
                    key={presalePackage.packageId}
                    id={index}
                    name={presalePackage.packageName}
                    price={presalePackage.price / 10}
                    image={presalePackage.packagePictureUrl}
                    isActive={!presalePackage.isPurchaseable}
                    className={cn(`w-full max-w-[400px] flex-1`)}
                  />
                </div>
              </>
            ))}
          </div>
          <div
            className={cn(
              ` scrollable-content relative flex max-w-full items-end space-x-12 overflow-hidden overflow-x-auto  `,
              `lg: gap-4 lg:items-center lg:space-x-0 lg:space-y-8`,
            )}
          >
            {zeroBigbroPremiumPackages?.map((presalePackage, index) => (
              <DailyRewardCard
                gameId={ZERO_ETERNAL_LOVE_GAME_ID}
                detail={presalePackage}
                key={presalePackage.packageId}
                id={index}
                name={presalePackage.packageName}
                price={presalePackage.price / 10}
                image={presalePackage.packagePictureUrl}
                isActive={!presalePackage.isPurchaseable}
                className={cn(`w-full max-w-[400px] flex-1`)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className={cn(`py-16 ${selectedServer?.gameId != ZERO_ETERNAL_LOVE_GAME_ID && `hidden`}`, `lg:py-10`)}>
        <div className={cn(`relative mt-2 text-center`)}>
          <h2
            className={cn(
              `text-[64px] font-bold leading-tight transition-all duration-300 ${selectedServer.serverID ? `text-primary` : `opacity-50`}`,
              `lg:text-[32px]`,
            )}
          >
            ZERO - Daily Reward
          </h2>
        </div>
        {/* <div className=" flex justify-center mt-3 z-40 relative" ><ZeroSelectServer className="text-neutral-500" /></div> */}

        <div
          className={`container transition-all duration-300 ${selectedServer.serverID ? `scale-y-100` : `h-0 scale-y-0`}`}
        >
          <div
            className={cn(
              ` scrollable-content relative -mt-14 flex max-w-full items-end space-x-12 overflow-hidden overflow-x-auto `,
              `lg: gap-4 lg:items-center lg:space-x-0 lg:space-y-8`,
            )}
          >
            {dataDisplay.map((presalePackage, index) => (
              <>
                <div className={`grid-rows grid justify-center pt-20 transition-all   `}>
                  <DailyRewardCard
                    gameId={ZERO_ETERNAL_LOVE_GAME_ID}
                    detail={presalePackage}
                    key={presalePackage.packageId}
                    id={index}
                    name={presalePackage.packageName}
                    price={presalePackage.price / 10}
                    image={presalePackage.packagePictureUrl}
                    isActive={!presalePackage.isPurchaseable}
                    className={cn(`w-full max-w-[400px] flex-1`)}
                  />
                </div>
              </>
            ))}
          </div>
          <div
            className={cn(
              ` scrollable-content relative flex max-w-full items-end space-x-12 overflow-hidden overflow-x-auto  `,
              `lg: gap-4 lg:items-center lg:space-x-0 lg:space-y-8`,
            )}
          >
            {zeroPremiumDailyPackages?.map((presalePackage, index) => (
              <DailyRewardCard
                gameId={ZERO_ETERNAL_LOVE_GAME_ID}
                detail={presalePackage}
                key={presalePackage.packageId}
                id={index}
                name={presalePackage.packageName}
                price={presalePackage.price / 10}
                image={presalePackage.packagePictureUrl}
                isActive={!presalePackage.isPurchaseable}
                className={cn(`w-full max-w-[400px] flex-1`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* <section className={cn(`py-16`, `lg:py-10`)}>
                <h2 className="font-bold mb-10 text-center">
                    Purchase History
                </h2>
                <table className="table-fixed mt-5 w-full text-center">
                    <thead className="">
                        <tr className="mx-auto">
                            <th className=" lg:block"></th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Itemcode</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody className="mt-10">
                        {zeroEternalLoveHistory?.map(item => (
                            <tr className="text-xs overflow-auto my-4" key={`${item.purchaseId}-${item.purchaseTime}`}>
                                <div className="text-center">
                                    <img src={`${item?.packagePictureUrl}`} alt={`${item?.packagePictureUrl}`} className="mx-auto" />
                                </div>
                                <td className="hidden lg:block"><img src={`${item?.packagePictureUrl}`} alt={`${item?.packagePictureUrl}`} className="mx-auto w-8 h-8" /></td>
                                <td className="px-2">{item?.packageName}</td>
                                <td className="px-2">{item?.price}</td>
                                <td className="px-2 blur cursor-pointer hover:blur-0">{item?.itemCode}</td>
                                <td className="px-2">{item?.purchaseTime}</td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </section> */}

      {/* Launch */}
      <section
        className={cn(`relative z-10 pb-4 ${selectedServer?.gameId != RO_ZERO_PC_GAME_ID && `hidden`}`, `lg:pb-10`)}
      >
        <div className={cn(`container`)}>
          <ChainTab disabledSymbol="optimistic" className={cn(`mx-auto mt-8 max-w-[464px]`)} />
          <div className={cn(`mt-16 text-center`)}>
            <h2 className={cn(`text-[64px] font-bold leading-tight text-[#ed6049]`, `lg:text-[32px]`)}>
              Available Package(s)
            </h2>
            {/* <div className={cn(`text-[40px] font-bold`, `lg:text-2xl`)}>for all packages</div> */}
            {/* <div className={cn(`text-[16px] text-center font-semibold text-red-500 my-4`, `lg:text-md`)}>Big Cat Coins Package(s) x2 ( 1 time Monthly, reset on 1st of the month )</div> */}
          </div>

          <div
            className={cn(
              `scrollable-content relative mt-4 flex max-w-full items-end gap-4 space-x-12 overflow-x-auto `,
              `lg:items-center  lg:gap-6 lg:space-x-0 lg:space-y-8`,
            )}
          >
            {/* {zeroPresalePackages?.map((presalePackage, index) => (
                            <TopupCard
                                gameId={ZERO_ETERNAL_LOVE_GAME_ID}
                                detail={presalePackage}
                                key={presalePackage.packageId}
                                id={presalePackage.packageId}
                                name={presalePackage.packageName}
                                price={presalePackage.price / 10}
                                image={presalePackage.packagePictureUrl}
                                // isActive={presalePackage.isPurchaseable}
                                isActive={presalePackage.packageName?.includes(`Lucky`) ? true : false}
                                className={cn(`w-full max-w-[400px] flex-1`)}
                            // closeDate={starterDeadline}
                            />
                        ))} */}

            {/* {zeroPresalePackages?.map((presalePackage, index) =>
              presalePackage?.packageName?.includes(`CASH COIN`) ? (
                <TopupCard
                  gameId={RO_ZERO_PC_GAME_ID}
                  detail={presalePackage}
                  key={presalePackage.packageId}
                  id={presalePackage.packageId}
                  name={presalePackage.packageName}
                  price={presalePackage.price / 10}
                  image={presalePackage.packagePictureUrl}
                  // isActive={presalePackage.isPurchaseable}
                  isActive={presalePackage.packageName?.includes(`Lucky`) ? true : false}
                  className={cn(`w-full max-w-[400px] flex-1`)}
                // closeDate={starterDeadline}
                />
              ) : (
                <></>
              ),
            )} */}

            {/* {topupZeroPackageList.map((presalePackage, index) => (
                            <TopupCard
                                gameId={RO_ZERO_PC_GAME_ID}
                                detail={presalePackage}
                                key={presalePackage.packageId}
                                id={presalePackage.packageId}
                                name={presalePackage.packageName}
                                price={presalePackage.price / 10}
                                image={presalePackage.packagePictureUrl}
                                // isActive={!presalePackage.isPurchaseable}
                                isActive={presalePackage.isFirstTopup ? true : false}

                                className={cn(`w-full max-w-[400px] flex-1`)}
                            />
                        ))} */}
          </div>

          <div
            className={cn(
              `scrollable-content relative mt-2 flex max-w-full items-end gap-4 space-x-12 overflow-x-auto `,
              `lg:items-center  lg:gap-6 lg:space-x-0 lg:space-y-8`,
            )}
          >
            <div className={cn(`mb-[4rem] mt-0 text-center lg:mb-0 lg:mt-[8rem]`)}>
              <h2 className={cn(`text-[64px] font-bold leading-tight text-[#ed6049]`, `lg:text-[32px]`)}>
               Zeny Server
              </h2>
              {/* <div className={cn(`text-[40px] font-bold`, `lg:text-2xl`)}>for all packages</div> */}
              <div className={cn(`my-4 text-center text-[16px] font-semibold`, `lg:text-md`)}>
                ( Zeny Server, NO Cash TOPUP )
              </div>
            </div> 



            {zeroPresalePackages?.map((presalePackage, index) =>
              (presalePackage?.packageName?.includes(`BATTLE PASS`) && !presalePackage?.packageName?.includes(`SS.2`)) && (
                <TopupCard
                  gameId={RO_ZERO_PC_GAME_ID}
                  detail={presalePackage}
                  key={presalePackage.packageId}
                  id={presalePackage.packageId}
                  name={presalePackage.packageName}
                  price={presalePackage.price / 10}
                  image={presalePackage.packagePictureUrl}
                  isActive={presalePackage.isPurchaseable}
                  className={cn(`w-full max-w-[400px] flex-1`)}
                  closeDate={TOZ_BATTLE_PASS_SS3_END}
                />
              )
            )}

            
  {zeroPresalePackages?.map((presalePackage, index) =>
              presalePackage?.packageName.startsWith('Vip Service')
                 ? (
                <TopupCard
                  gameId={RO_ZERO_PC_GAME_ID}
                  detail={presalePackage}
                  key={presalePackage.packageId}
                  id={presalePackage.packageId}
                  name={presalePackage.packageName}
                  price={presalePackage.price / 10}
                  image={presalePackage.packagePictureUrl}
                  // isActive={presalePackage.isPurchaseable}
                  isActive={presalePackage.packageName?.includes(`Racing`) ? true : false}
                  className={cn(`w-full max-w-[400px] flex-1`)}
                // closeDate={luckyPackDeadline}
                />
              ) : (
                <></>
              ),
            )}


            {/* {zeroPresalePackages?.map((presalePackage, index) =>
              presalePackage?.packageName.includes(`SS.3 BATTLE P`)
                 ? (
                <TopupCard
                  gameId={RO_ZERO_PC_GAME_ID}
                  detail={presalePackage}
                  key={presalePackage.packageId}
                  id={presalePackage.packageId}
                  name={presalePackage.packageName}
                  price={presalePackage.price / 10}
                  image={presalePackage.packagePictureUrl}
                  isActive={presalePackage.isPurchaseable}
                  className={cn(`w-full max-w-[400px] flex-1`)}
                // closeDate={luckyPackDeadline}
                />
              ) : (
                <></>
              ),
            )} */}
 
             
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default PackagesList

export const Loading = () => {
  return (
    <>
      {/* <Viva /> */}
      {/* <Aura /> */}
    </>
  )
}
