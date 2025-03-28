'use client'

import { Fragment, useEffect, useState } from 'react'

import { format } from 'date-fns'
import { padStart } from 'lodash-es'
import Image from 'next/image'
import Link from 'next/link'
import { Pagination, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { useAccount } from 'wagmi'

import Button from '@/components/base/button'
import ConnectWalletButton from '@/components/buttons/connect-wallet'
import PackCard from '@/components/cards/pack-card'
import IconArrow from '@/components/icons/icon-arrow'
import IconArrowCircleLeft from '@/components/icons/icon-arrow-circle-left'
import IconArrowCircleRight from '@/components/icons/icon-arrow-circle-right'
import ChainTab from '@/components/tabs/chain-tab'
import { PACK_DATA } from '@/mock/pack'
import { cn } from '@/utils/styling'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { TopHeroSection } from '@/constants/homepage'
import { OBT_DAILY_REWARD, roZeroPcPresaleDeadline } from '@/constants/rom'
import { ZERO_CASH_PACKAGES } from '@/atoms/mock'
import TopupCard from '@/components/cards/topup-card'
import { IEonUserDetail, IVote, RO_ZERO_PC_GAME_ID, ZERO_ETERNAL_LOVE_GAME_ID } from '@/types/eonhub'
import DailyRewardCard from '@/components/cards/daily-reward'
import { useCookies } from 'react-cookie'
import { eonhubApiCreate } from '@/axios'
import { useAtom } from 'jotai'
import {
  topupZeroPackageListAtom,
  zeroEternalLoveDailyRewardAtom,
  zeroPremiumDailyPackagesAtom,
  zeroPresalePackagesAtom,
  zeroVoteCountAtom,
  zeroVotePackagesAtom,
} from '@/atoms/seal'
import Countdown from 'react-countdown'
import PollingPack from '@/components/cards/polling-pack'
import { IngameMarketTax } from '@/components/zero-eternal-love/ingameMarketTax'
import { RecentlySold } from './market/page'
import { marketHistoryZeroAtom, marketZeroTaxAtom, selectedServerAtom } from '@/atoms/eonhub'
import { ZeroSelectServer } from '@/components/zero-eternal-love/inventoryWhitelist'
import MarketService from '@/services/market.service'

import FacebookLive from '../components/steamer/steamer'
import { images } from '../components/steamer/ImgStreamer'
import Footer from './footer'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'
import { toast } from 'react-toastify'
import ZeroPresaleCard from '@/components/cards/zero-pc-presale-card'
import { ZERO_PC_PRESALE_MOCK } from '@/constants/zero-pc-presale'
import useSound from 'use-sound'
export const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 5,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 5,
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

interface IPageProps {}

const Page = ({}: IPageProps) => {
  // const { isConnected, isConnecting } = useAccount()

  const [cookie, setCookie] = useCookies(['eonhub-auth'])
  const userCookie: IEonUserDetail = cookie['eonhub-auth']
  const eonhubAPI = eonhubApiCreate(userCookie?.token)

  const marketService = new MarketService()
  const [zeroPresalePackages, setZeroPresalePackages] = useAtom(zeroPresalePackagesAtom)
  const [zeroVotePackages, setzeroVotePackages] = useAtom(zeroVotePackagesAtom)
  const [zeroVoteCount, setZeroVoteCount] = useAtom(zeroVoteCountAtom)

  const requestZeroPresalePackage = async () => {
    await eonhubAPI
      .get(`/api/package/${RO_ZERO_PC_GAME_ID}?packageType=PRE_SALES`, {
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

  const requestZeroVoteItems = async () => {
    await eonhubAPI
      .get(`/api/package/${ZERO_ETERNAL_LOVE_GAME_ID}?packageType=IN_GAME_PACKAGE`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userCookie?.token}`,
        },
      })
      .then((res) => {
        if (res?.data?.status == 200) {
          if (res?.data?.data) {
            // setZeroPresalePackages(res?.data?.data)
            setzeroVotePackages(res?.data?.data)
          }
        } else {
          // console.log("No status");
        }
      })
  }

  const requestVoteCount = async () => {
    await eonhubAPI
      .get(`/api/package/${ZERO_ETERNAL_LOVE_GAME_ID}/count/history`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userCookie?.token}`,
        },
      })
      .then((res) => {
        if (res?.data?.status == 200) {
          const result: IVote[] = res?.data?.data
          if (result) {
            // setZeroPresalePackages(res?.data?.data)
            setZeroVoteCount(result)
          }
        } else {
          // console.log("No status");
        }
      })
  }

  // const userService = new UserService();
  const requestSealCashPackage = async () => {
    await eonhubAPI
      .get(`/api/package/${1}?packageType=DAILY_REWARD`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userCookie?.token}`,
        },
      })
      .then((res) => {
        if (res.status == 200) {
          if (res?.data?.data) {
            // settopupPackageList(res?.data?.data)
            // setEonhubUserDetail({ ...eonhubUserDetail, ...res.data });
          }
        } else {
          // console.log("No status");
        }
      })
  }

  const [zeroEternalLoveDailyReward, setZeroEternalLoveDailyReward] = useAtom(zeroEternalLoveDailyRewardAtom)
  const requestZeroDailyPackage = async () => {
    await eonhubAPI
      .get(`/api/package/${ZERO_ETERNAL_LOVE_GAME_ID}?packageType=DAILY_REWARD`, {
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

  const [zeroPremiumDailyPackages, setZeroPremiumDailyPackages] = useAtom(zeroPremiumDailyPackagesAtom)
  const requestZeroPremiumDailyPackage = async () => {
    await eonhubAPI
      .get(`/api/package/${ZERO_ETERNAL_LOVE_GAME_ID}?packageType=PREMIUM_DAILY_REWARD`, {
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

  const [topupZeroPackageList, setTopupZeroPackageList] = useAtom(topupZeroPackageListAtom)

  const requestZeroCashPackage = async () => {
    await eonhubAPI
      .get(`/api/package/${2}?packageType=CASH`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userCookie?.token}`,
        },
      })
      .then((res) => {
        if (res.status == 200) {
          if (res?.data?.data) {
            setTopupZeroPackageList(res?.data?.data)
          }
        } else {
          // console.log("No status");
        }
      })
  }

  const [marketZeroTax, setMarketZeroTax] = useAtom(marketZeroTaxAtom)
  const [selectedServer, setSelectedServer] = useAtom(selectedServerAtom)
  const [marketHistoryZero, setMarketHistoryZero] = useAtom(marketHistoryZeroAtom)
  const [isAllowRefreshData, setIsAllowRefreshData] = useState(true)

  useEffect(() => {
    if (!userCookie) return
    // requestZeroPresalePackage()
    // requestZeroDailyPackage()
    // requestSealCashPackage()
    // requestZeroCashPackage()
    // requestZeroPremiumDailyPackage()
    // requestZeroVoteItems()
    // requestVoteCount()
    requestZeroPresalePackage();

    if (isAllowRefreshData) {
      const marketZeroTax = marketService
        .getTotalTaxHistory(ZERO_ETERNAL_LOVE_GAME_ID)
        .then((res) => {
          setMarketZeroTax(res || { totalReferralSystem: 0, totalTax: 0, marketplaceTax: 0 })
          setIsAllowRefreshData(false)
        })
        .catch((err) => {
          console.log('marketZeroInventory: ', err)
        })

      const zeroRecentlySold = marketService
        .getMarketRecentlySold(ZERO_ETERNAL_LOVE_GAME_ID, userCookie?.token)
        .then((res) => {
          const recentlySold = res as any
          setMarketHistoryZero(recentlySold)
          setIsAllowRefreshData(false)
        })
        .catch((err) => {
          console.log('marketZeroInventory: ', err)
        })
    }
  }, [userCookie])

  const [sayHii] = useSound(
    '/images/sound/japanese-hello_D_major.wav',
    { volume: 1.00 }
  );

  const [didWeSayHii, setDidWeSayHii] = useState(false)
  useEffect(()=>{
    // if(!sayHii) return
    // sayHii();
    // setDidWeSayHii(true); 
  },[sayHii])

  const [isHide, setIsHide] = useState(false)
 
  const dataDisplay = zeroEternalLoveDailyReward ? zeroEternalLoveDailyReward : OBT_DAILY_REWARD
  return (
    <Fragment>
      {/* Hero */}
      <section className={cn(` `, `shadow-inner lg:pt-navbar`)}>
        {/* <GameSection/> */}
        <Swiper
          spaceBetween={0}
          slidesPerView={1}
          pagination={{
            clickable: true,
            el: '#hero-bullet-slide',
          }}
          modules={[Pagination]} 
          autoplay={true}
          loop={true} 
        >
          {/* {[...Array(5).keys()].map((n) => ( */}
          {TopHeroSection.map((n,index) => (
            <SwiperSlide
              key={`page-hero-slide-${index}`}
              className={`lg:min-h-screen   shadow-md border-neutral-200   min-h-screen   bg-cover lg:bg-cover   bg-center py-24 bg-blend-lighten transition-all hover:bg-opacity-100 hover:bg-blend-darken`}
            >
                <Image
                        alt={`gift.png`}
                        src={`/images/games/hero-section/${n.bgImg}`}
                        height={1500}
                        width={1500}
                        className={`absolute inset-0 object-cover h-full w-full animate-fade-right animate-delay-300 animate-once`}
                      />

              <div
                className={cn(
                  `max-w-screen container relative flex items-center rounded-xl border-neutral-200 bg-cover  `,
                  `lg:min-h-[auto] lg:flex-col-reverse lg:justify-center`,
                )}
              >
                <div className="">
                  <div
                    className={`z-100 fixed h-fit  ${isHide ? `animate-wiggle  animate-delay-300 animate-infinite  right-1 top-[30%] ` : ` right-2 top-[34%]`}    `}
                    style={{ zIndex: 1000 }}
                  >
                    <div
                      onClick={() => { 
                        setIsHide(!isHide)
                        // sayHii();
                      }}
                      className={`mt-[8.25rem] animate-bounce ${selectedServer.serverID ? `` : `  hover:animate-none`} 
             cursor-pointer bg-none  text-white transition-all hover:scale-110 hover:font-extrabold ${isHide ? ` rounded-full   px-3 pb-4 pt-3 hover:-translate-x-1` : `-translate-x-1 rounded-2xl   px-2 py-1 hover:translate-x-0`}     h-fit `}
                    >
                      {/* {isHide ? (<Image alt={`gift.png`} src={`/images/rom/Community.png`} height={80} width={80} className={``} />) : `>`} */}
                      <Image
                        alt={`gift.png`}
                        src={`/images/rom/Community.png`}
                        height={80}
                        width={80}
                        className={` ${isHide ? `` : ``}`}
                      />
                    </div>
                  </div>
                </div>
                {/* Content */}
{/* Wrapper Container */}
<div
  className={cn(
    `fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-screen-sm md:max-w-[600px] p-4 transition-all duration-300 ${
      isHide ? "translate-y-[150%] opacity-0" : "bg-white opacity-100 scale-100"
    } rounded-xl border-2 bg-opacity-50 border-neutral-100 shadow-2xl`
  )}
>

  {/* Flex Container for Content */}
  <div className="flex flex-col md:flex-row items-center space-y-4 md:space-x-4">
    
    {/* IngameMarketTax Component */}
    <div className="w-full">
      <IngameMarketTax />
    </div>

  </div>

</div>


 
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Bullet */}
        <div id="hero-bullet-slide" className={cn(`container`, `lg:mt-4 lg:flex lg:justify-center`)}></div>
      </section>

      <section className={`bg-transparent  lg:rounded-none  relative z-[10]  `}>
        <div className="pl-12 pr-8 lg:pl-1/2"> 
          <Carousel
            swipeable={true}
            draggable={true}
            showDots={false}
            responsive={responsive}
            ssr={true} // means to render carousel on server-side.
            infinite={true}
            autoPlay={true}
            autoPlaySpeed={500}
            arrows={false}
            keyBoardControl={true}
            customTransition="all .5"
            transitionDuration={1000}
            containerClass="carousel-container min-h-[200px] max-w-[100%] pb- pt-3"
            removeArrowOnDeviceType={['tablet', 'mobile']}
            // deviceType={this.props.deviceType}
            dotListClass="custom-dot-list-style"
            itemClass="carousel-item-padding-40-px "
            className=''
          >
            {images?.map((image, index) => (
              <div key={index} className="relative h-40 w-58 mr-8 opacity-30 transition-all duration-150 hover:opacity-100">
                <img
                  className="inset-0 mt-5    h-full w-full cursor-pointer rounded-2xl shadow-inner border-double border-2  border-neutral-200 object-cover   hover:mt-0 hover:scale-110 hover:rounded-2xl animate-fade-left animate-delay-100 animate-once"
                  src={image.src}
                  alt={image.alt}
                  onClick={() => (window.location.href = image.href)}
                />
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* Games */}
      <section className={cn(` shadow-inner  pb-20 shadow-sm  pt-8 `, `lg:py-10 `)}>
        <div className={cn(`container  `, `lg:!px-0`)}>
          <Swiper
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
                name: 'Eternal Nexus M',
                available: true,
                href: `https://zeroeternalnexus.eonhub.games/`,
                image: '/images/games/02.png',
              },
              {
                name: 'Tales Of ZERO',
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
              <SwiperSlide
                key={`game-slide-${gameIdx}`}
                className={cn(`cursor-pointer self-center overflow-hidden animate-fade-left animate-delay-700 animate-once`, {
                  '!w-[30%] rounded-[48px] border border-border p-[10px] lg:!w-[256px]': game.available,
                  // '!w-[23.3333333333%]   border border-border p-[20px] lg:!w-[256px] ': !game.available,
                  '!w-[23.3333333333%] shadow-xl lg:!w-[220px]': !game.available,
                })}
              >
                <div
                  onClick={() => {
                    game.href && window.open(game.href)
                  }}
                  className={cn(`text-center text-white `, {
                    'rounded-[40px] border-[8px] border-border bg-primary p-2': game.available,
                    'bg-foreground': !game.available && gameIdx === 1,
                    'bg-primary': !game.available && gameIdx === 2,
                    'bg-primary/75': !game.available && gameIdx === 3,
                  })}
                >
                  <Image
                    src={game.image}
                    alt=""
                    width={912}
                    height={1320}
                    className={cn(`aspect-[304/440] w-full object-cover `, {
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
                        <div
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
                        </div>
                      </>
                    ) : (
                      <div className={cn(`text-2xl font-bold`, `lg:text-base`)}>soon</div>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
 
 

      {/* News and Stories */}
      <section className={cn(`mt-12  animate-fade-right animate-delay-1000 animate-once  shadow-md `, `lg:py-10`)}>
        <div className={cn(`container`)}>
          <h2 className={cn(`text-[48px] font-bold leading-tight`, `lg:text-2xl`)}>News and Stories</h2>
        </div>

        <div className={cn(`container mt-14`, `lg:mt-6 lg:!px-0`)}>
          <Swiper
            slidesPerView={'auto'}
            loop={true}
            navigation={{
              prevEl: '#news-navigation-prev',
              nextEl: '#news-navigation-next',
            }}
            modules={[Navigation]}
            className={cn(`[&>.swiper-wrapper]:pb-10`)}
            breakpoints={{
              319: {
                slidesPerView: 1.1125,
                spaceBetween: 20,
                slidesOffsetBefore: 20,
                slidesOffsetAfter: 20,
              },
              641: {
                slidesPerView: 2.5,
                spaceBetween: 20,
                slidesOffsetBefore: 32,
                slidesOffsetAfter: 32,
              },
              1025: {
                slidesPerView: 3,
                spaceBetween: 40,
              },
            }}
          >
            {[
              {
                id: 1,
                title: 'Eon Game Hub - Game Online 2025!',
                description: "Get ready for the future of gaming with Eon Game Hub! As we look ahead to 2025, we're excited to bring you the ultimate online gaming experience. Our platform is designed to connect gamers from around the world, offering a diverse range of games that cater to all interests and skill levels. Whether you're a casual player or a competitive gamer, Eon Game Hub has something for everyone. Stay tuned for more updates as we continue to innovate and push the boundaries of what's possible in the world of online gaming. Join us on this exciting journey and be a part of the next big thing in gaming!",
                image: '/images/news/3.png',
              },
              {
                id: 2,
                title: 'Eon Game Hub Marketplace!',
                description:
                  'Elevate your gaming experience with a seamless, thrilling marketplace where every click brings you closer to endless excitement. Level up and Earn even when you quit!',
                image: '/images/news/2.png',
              },
              {
                id: 3,
                title: 'Global Trading are live!',
                description:
                  "Exciting News: Global Trading is Now Live! 🚀 Explore new horizons and seize opportunities with our cutting-edge Global Trading platform. Connect with a worldwide network of traders, unlock diverse markets, and embark on a journey where every trade propels you towards success. Don't miss out – dive into the dynamic world of Global Trading today!",
                image: '/images/news/3.png',
              },
              {
                id: 4,
                title: 'PvP & MvP Boss Fight!',
                description:
                  "Exciting News: Global Trading is Now Live! 🚀 Explore new horizons and seize opportunities with our cutting-edge Global Trading platform. Connect with a worldwide network of traders, unlock diverse markets, and embark on a journey where every trade propels you towards success. Don't miss out – dive into the dynamic world of Global Trading today!",
                image: '/images/news/4.png',
              },
              {
                id: 5,
                title: 'Global Friendship!',
                description:
                  "Discover the Power of Global Friendship! 🌐🤝 Join a vibrant community that transcends borders and fosters connections around the world. Whether you're making new friends, sharing cultural experiences, or collaborating on exciting projects, Global Friendship is your passport to a diverse and enriching social journey. Embrace the spirit of unity, understanding, and shared adventures as we build bridges across continents. Let's create lasting bonds together in the ever-expanding tapestry of Global Friendship!",
                image: '/images/news/5.jpeg',
              },
            ].map((news, newsIdx) => (
              <SwiperSlide
                key={`news-slide-${newsIdx}`}
                className={cn(
                  `rounded-[40px]`,
                  `[&.swiper-slide-active>div]:bg-pink`,
                  `[&.swiper-slide-active>div]:shadow-news`,
                  `[&.swiper-slide-active]:border`,
                  `[&.swiper-slide-active]:border-pink`,
                  `[&.swiper-slide-active]:p-2`,
                  `[&.swiper-slide-active]:text-white`,
                  `[&:not(.swiper-slide-active)_a]:hidden`,
                )}
              >
                <div className={cn(`space-y-6 rounded-[32px] bg-card p-8`, `lg:space-y-4 lg:p-5`)}>
                  <strong>{padStart(String(newsIdx + 1), 2, '0')}</strong>
                  <Image
                    src={news.image}
                    alt=""
                    width={176}
                    height={176}
                    className={cn(`aspect-[336/224] rounded-2xl border-[6px] border-white`)}
                  />
                  <h4 className={cn(`line-clamp-2 text-[32px] font-bold leading-tight`, `lg:text-2xl`)}>
                    {news.title}
                  </h4>
                  <p className={cn(`line-clamp-3`)}>{news.description}</p>

                  <Button variant="light" asChild>
                    <Link href="#">
                      Read more <IconArrow className={cn(`ml-4 text-2xl text-pink`)} />
                    </Link>
                  </Button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className={cn(`container`)}>
          {/* Navigation */}
          <div className={cn(`relative z-10 -mt-8 flex items-center space-x-4`)}>
            <div className={cn(`h-[2px] w-full bg-card`)}></div>
            <div className={cn(`flex items-center space-x-2`)}>
              <button id="news-navigation-prev">
                <IconArrowCircleLeft className={cn(`text-[56px] text-pink`)} />
              </button>
              <button id="news-navigation-next">
                <IconArrowCircleRight className={cn(`text-[56px] text-pink`)} />
              </button>
            </div>
          </div>
        </div>
      </section>

      
      <section className={cn(`mt-20`, `lg:py-10`)}>
        <div className="mt-">
          <RecentlySold />
        </div>
      </section>

      <section className={cn(`py-10`, `hidden lg:pt-0`)}>
        <div className={cn(`container`)}>
          <h2 className={cn(`text-[64px] font-bold leading-tight`, `lg:text-2xl`)}>Recently Sold</h2>
        </div>

        <div className={cn(`container relative mt-14`, `lg:mt-6 lg:!px-0`)}>
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
                slidesPerView: 4,
                spaceBetween: 8,
              },
            }}
          >
            {[...Array(5).keys()]
              .map((n) => ({
                id: `1072${n}`,
                image: '/images/card.png',
                collection: 'wombatrealms',
                name: 'Roof',
                price: 5.48,
                priceUSD: 3.64,
                createdAt: new Date('2023-11-20T17:06:00'),
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
                    `[&:hover]:before:border`,
                    `[&:hover]:before:border-info`,
                    `[&:hover]:before:inset-0`,
                    `[&:hover]:before:absolute`,
                    `[&:hover]:before:pointer-events-none`,
                    `[&:hover]:before:-z-10`,
                  )}
                >
                  <div className={cn(`rounded-[32px] bg-card p-8`, `transition-all duration-300`, `lg:p-5`)}>
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
                      <div>
                        <div className={cn(`price text-xl font-bold text-success`, `transition-all duration-300`)}>
                          {recently.price} EON
                        </div>
                        <div>{(recently.priceUSD / 10).toFixed(2)} USD</div>
                      </div>
                      <div className={cn(`text-xs`)}>{format(recently.createdAt, 'MMM dd yyyy, HH:mm')}</div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
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

      {/* Partners */}
      {/* <section className={cn(`py-16`, `lg:py-10 hidden`)}>
        <div className={cn(`container flex flex-wrap items-center justify-between gap-4`)}>
          <Image
            src={`/images/partners/01.png`}
            alt=""
            width={100}
            height={33.83}
            className={cn(`h-[48px] w-[141.83px]`, `sm:h-[33.84px] sm:w-[100px]`)}
          />
          <Image
            src={`/images/partners/02.jpeg`}
            alt=""
            width={64}
            height={64}
            className={cn(`h-[80px] w-[80px]`, `sm:h-[64px] sm:w-[64px]`)}
          />
          <Image src={`/images/partners/03.png`} alt="" width={76} height={80} className={cn(`h-[80px] w-[76px]`)} />
          <Image
            src={`/images/partners/04.png`}
            alt=""
            width={100}
            height={44.55}
            className={cn(`h-[56px] w-[125.7px]`, `sm:h-[44.55px] sm:w-[100px]`)}
          />
          <Image src={`/images/partners/05.png`} alt="" width={80} height={79} className={cn(`h-[79px] w-[80px]`)} />
          <Image src={`/images/partners/06.svg`} alt="" width={100} height={56} className={cn(`h-[56px] w-[100px]`)} />
        </div>
      </section> */}
      <Footer />
    </Fragment>
  )
}

export default Page
