import { SealMetaverseAccountInfoAtom, ZeroEternalLoveAccountInfoAtom, marketZeroAtom, inventoryZeroAtom, marketZeroInventoryAtom, userMarketListZeroAtom, selectedServerAtom } from "@/atoms/eonhub";
import { eonhubApiCreate } from "@/axios";
import { useWalletSigner } from "@/hooks/useWeb3Token";
import MarketService, { InventoryResponseDTO, MarketList } from "@/services/market.service";
import UserService from "@/services/user.service";
import { IEonUserDetail, ZERO_ETERNAL_LOVE_GAME_ID } from "@/types/eonhub";
import { IZeroEternalLoveCharInfo } from "@/types/zero-eternal-love";
import { useWeb3React } from "@web3-react/core";
import { providers } from "ethers";
import { useAtom } from "jotai";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Image from 'next/image'
import { cn } from "@/utils/styling";
import { format } from "date-fns";
import { Pagination, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import IconArrowCircleLeft from "../icons/icon-arrow-circle-left";
import IconArrowCircleRight from "../icons/icon-arrow-circle-right";
import { useEffect } from "react";

export const MarketplaceZeroUserListingItems = () => {

  const { library, account, chainId, activate, deactivate } = useWeb3React();

  const [sealMetaverseAccountInfo, setSealMetaverseAccountInfo] = useAtom(SealMetaverseAccountInfoAtom);
  const [zeroEternalLoveAccountInfo, setZeroEternalLoveAccountInfo] = useAtom(ZeroEternalLoveAccountInfoAtom);

  const marketService = new MarketService()
  const [marketZero, setMarketZeroAtom] = useAtom(marketZeroAtom);


  const { sign: signWallet } = useWalletSigner(
    library as providers.Web3Provider
  );


  const [cookie, setCookie] = useCookies(["eonhub-auth"]);
  const userCookie: IEonUserDetail = cookie["eonhub-auth"];
  const eonhubAPI = eonhubApiCreate(userCookie?.token);

  const [marketZeroInventory, setmarketZeroInventory] = useAtom(marketZeroInventoryAtom);
  const [inventoryZero, setInventoryZero] = useAtom(inventoryZeroAtom);
  const [userMarketListZero, setUserMarketListZero] = useAtom(userMarketListZeroAtom);

  const [selectedServer, setSelectedServer] = useAtom(selectedServerAtom);
  
  const onBuyMarketItemClick = async (item: MarketList) => {
    
    if (userCookie?.walletAddress && !account) return toast.error(`Please connect your wallet`);

    // const token = await signWallet(); // signWallet is a function from useWalletSigner hook

    // if (!token) return;

    // const user = marketService.getUserGameInfo(gameId, token, ()=>{}) 

    Swal.fire({
      title: `Cancel listing ${item.itemName}`,
      input: "radio",
      // inputOptions: 2 === ZERO_ETERNAL_LOVE_GAME_ID ? zeroEternalLoveAccountInfo?.characterNames.map(char => char.characterName) :
      //   [sealMetaverseAccountInfo?.gameUserId],
      showCancelButton: true,
      confirmButtonText: "Confirm",
      confirmButtonColor: 'rgb(253 120 118 / 1.0)',
      showLoaderOnConfirm: true,
      inputValidator: (value) => {
        // const result = gameId === ZERO_ETERNAL_LOVE_GAME_ID ? zeroEternalLoveAccountInfo?.characterNames[value] : sealMetaverseAccountInfo?.characterNames[value]
        // const result: IZeroEternalLoveCharInfo = zeroEternalLoveAccountInfo?.characterNames[value];
        return new Promise((resolve) => {
 
          resolve()
        });
      },
      preConfirm: async (amount) => {
        try {
          // After Confirm 
          const req = marketService?.cancelItem(selectedServer.gameId, userCookie?.token, item.marketItemId)
            .finally(() => {
              refrestData()
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


  const refrestData = () => {

    if (!userCookie || !userCookie?.token) return 

    const zeroUserMarketList = marketService.getMyMarketItemList(selectedServer.gameId, userCookie?.token)
      .then(res => {
        const userMarketList = res as MarketList[]
        setUserMarketListZero(userMarketList)
      })
      .catch(err => { console.log('marketZeroInventory: ', err) })

  }

  useEffect(()=>{
    refrestData();
  },[selectedServer])

  return !userMarketListZero || userMarketListZero.length <= 0 ? (<></>) : (<>
    {/* Recently Sold */}
    <section className={cn(`py-10`, `lg:pt-0`)}>
      <div className={cn(`container`)}>
        <h4 className={cn(`text-[32px] font-bold text-secondary leading-tight`, `lg:text-2xl`)}>My Listing Item(s)</h4>
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
          {userMarketListZero
            .map((item, n) => ({
              id: `${item?.marketItemId}`,
              image: item?.itemPictureUrl || '/images/zenyCoin.jpeg',
              collection: `${item?.itemType}`,
              name: item?.itemName || ``,
              price: item?.eonPriceForEach,
              priceUSD: (item?.eonPriceForEach / 10),
              createdAt: new Date(item?.createdTime),
              chain: {
                symbol: 'bsc',
              },
              item: item
            }))
            .map((recently, recentlyIdx) => (
              <SwiperSlide
                onClick={async () => await onBuyMarketItemClick(recently.item)}
                key={`recently-slide-${recentlyIdx}`}
                className={cn(
                  `relative p-2 scale-50`,
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
                  `border-secondary border rounded-[40px]`
                )}
              >
                <div className={cn(`rounded-[32px] bg-secondary p-8`, `transition-all duration-300`, `lg:p-5`)}>
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
                    <h5 className={cn(`text-[32px] font-bold`)}>{recently.name}</h5>
                    <div>Quantity: {recently.item.itemAmount.toLocaleString('en-US', {})}</div>
                    <div>
                      <div className={cn(`price text-xl font-bold `, `transition-all duration-300`)}>
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
