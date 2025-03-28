"use client";

import { Fragment, useEffect, useState } from 'react'

import Image from 'next/image'

import Button from '@/components/base/button'
import TextOutline from '@/components/text-outline-number'
import { ITEM_DATA, PACK_DATA } from '@/mock/pack'
import { cn } from '@/utils/styling'
import {  isLoadingAtom, presaleZeroEternalLoveAtom, selectedServerAtom } from '@/atoms/eonhub'
import { eonhubApiCreate } from '@/axios'
import UserService from '@/services/user.service'
import { useCookies } from 'react-cookie'
import { useAtom } from 'jotai';
import { IEonUserDetail, IPresalePackage } from '@/types/eonhub';
import MarketService from '@/services/market.service';
import userService from '@/services/user.service';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useWalletSigner } from '@/hooks/useWeb3Token';
import { useWeb3React } from '@web3-react/core';
import { providers } from 'ethers';
import { shortenAddress } from '@usedapp/core';
import { OBT_FIRST_PROMOTION } from '@/constants/rom';

interface IPageProps {
  params: { id: string }
}

const Page = ({ params: { id } }: IPageProps) => {
  // const data = PACK_DATA[id]
  // console.log('PACK_DATA: ',PACK_DATA)

  const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
  const userCookie: IEonUserDetail = cookie["eonhub-auth"];
  // const eonhubAPI = eonhubApiCreate(userCookie?.token);
  // const userService = new UserService();

  // const [presaleZeroEternalLove, setPresaleZeroEternalLove] = useState<IPresalePackage[]>([]);

  // const requestPresale = async () => {
  //   await eonhubAPI.get(
  //     `/api/package/${2}?packageType=CASH`, {
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${userCookie?.token}`
  //     }
  //   },).then((res) => {
  //     if (res.status == 200) {
  //       if (res?.data?.data) {
  //         // settopupPackageList(res?.data?.data)
  //         // setEonhubUserDetail({ ...eonhubUserDetail, ...res.data });
  //       }
  //     } else {
  //       // console.log("No status");
  //     }
  //   })
  // }

  // const requestMallPackage = async () => {
  //   await eonhubAPI.get(
  //     `/api/package/${2}?packageType=PRE_SALES&page=1&perPage=5`, {
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${userCookie?.token}`
  //     }
  //   },).then((res) => {
  //     // console.log('requestMallPackage: ', res)
  //     console.log('requestPresale: ', res)
  //     if (res.status == 200) {
  //       const results: IPresalePackage[] = res?.data?.data
  //       if (results) {
  //         setPresaleZeroEternalLove(results)
  //       }
  //     } else {
  //       // console.log("No status");
  //     }

  //     console.log('fetch ERROR res: ', res)
  //   }).catch(error => {
  //     console.log('fetch ERROR: ', error)
  //     if (error?.response?.status == 401) {
  //       removeCookie("eonhub-auth")
  //     }
  //   })
  // }

  // const provider = new ethers.providers.Web3Provider(window.ethereum);
  const { library, account, chainId, activate, deactivate } = useWeb3React();
  const [isLoading, setisLoading] = useAtom(isLoadingAtom);
  const [selectedServer, setSelectedServer] = useAtom(selectedServerAtom);

  const userService = new UserService();
  
  const { sign: signWallet } = useWalletSigner(
    library as providers.Web3Provider
  );
  const marketService = new MarketService()

  const data = OBT_FIRST_PROMOTION.find(item => item.packageId === Number(id));
  const onBuyPresaleClick = () =>{
    onBuyPresaleConfirm();
  }

  const onBuyPresaleConfirm = async () =>{
    try {
      if(isLoading) return toast.error(`Waiting for response!`);
      
      const token = await signWallet(); // signWallet is a function from useWalletSigner hook

      if (!token) return;

      Swal.fire({
        title: `Purchasing ${data?.packageName} ?`,
        // text: `for this account ${shortenAddress(userCookie?.walletAddress)}`,
        footer: ``,
        showCancelButton: true,
        confirmButtonText: "Confirm",
        confirmButtonColor: '',
        showLoaderOnConfirm: true,
        preConfirm: async (amount) => {
          try {
            // const id = toast.loading("Pending ...")
            const req = marketService.buyPresalePackage(2, userCookie?.token, token, data, selectedServer.serverID)
            userService.fetchUserInfo(userCookie?.token, setCookie, removeCookie, () => { });
            
            // if (req?.status == 200) {
            //   toast.update(data?.packageId, { render: `Success Buying ${packageData?.packageName}`, type: "success", isLoading: false, autoClose: 2000 });
            //   debugger;
            // } else {
            //   toast.update(data?.packageId, { render: 'Somethine went wrong.', type: "error", isLoading: false, autoClose: 2000 });
            // }
     
            
            // .then((res) => {
            //   if (res?.status == 200) {
            //     toast.update(id, { render: `Success Withdraw ${amount} EON`, type: "success", isLoading: false, autoClose: 2000 });
            //   } else {
            //     toast.update(id, { render: 'Somethine went wrong.', type: "error", isLoading: false, autoClose: 2000 });
            //     // console.log("No status");
            //   }
            // }).catch(err => {
            //   toast.update(id, { render: err.response.data.message, type: "error", isLoading: false, autoClose: 2000 });
            // });

          } catch (error) {
            Swal.showValidationMessage(`
            Request failed: ${error}
          `);
          }
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        
      });

    } catch (error) {
      console.log('token error: ', error)

    }
  }
 

  return data && (
    <Fragment>
      <section className={cn(`pb-12 pt-40`, `lg:pb-10`)}>
        <div className={cn(`container`)}>
          <div className={cn(`flex flex-col items-center text-center`)}>
            <div className={cn(`text-2xl font-bold`)}>Ready to Launch</div>
            <div className={cn(`text-[36px] font-bold text-secondary`)}>on December 30th!</div>

            <div className={cn(`mt-6 flex items-center space-x-4`)}>
              <Image src={'/images/chains/bsc.png'} alt="" width={40} height={40} className={cn(`h-10 w-10`)} />
              <strong className={cn(`text-xl`)}>BSC</strong>
            </div>

            <div className={cn(`mt-4 flex items-center space-x-8`, `lg:flex-col lg:space-x-0`)}>
              <div
                className={cn(
                  `relative`,
                  `aspect-square w-[448px] max-w-full`,
                  `bg-[radial-gradient(50%_50%_at_50%_50%,_#FD7876_0%,_rgba(253,_120,_118,_0)_100%)]`,
                  `flex items-center justify-center`,
                  //
                  `after:absolute after:-z-10`,
                  `after:bg-[radial-gradient(50%_50%_at_50%_50%,_rgba(78,_76,_114,_0.5)_0%,_rgba(78,_76,_114,_0)_100%)]`,
                  `after:bottom-0 after:h-[50.74px] after:w-[311.98px] after:mix-blend-multiply`,
                  `sm:w-[320px]`,
                )}
              >
                <Image
                  src={`${data?.packagePictureUrl}`}
                  alt=""
                  width={309}
                  height={309}
                  className={cn(`aspect-square w-[309px]`, `sm:w-[240px]`)}
                />
              </div>
              <div className={cn(`space-y-6 text-left`, `lg:mt-6 lg:w-full`)}>
                <h1 className={cn(`text-[64px] font-bold leading-tight`, `lg:text-[32px]`)}>{data?.packageName}</h1>
                <div className={cn(`text-[36px] font-bold flex gap-1`, `lg:text-2xl`)}>
                  <div className="flex gap-2">
                    <div className="flex-row">
                      {(data?.price / 10).toLocaleString(undefined, { maximumFractionDigits: 0 })}$
                      <div className="text-center my-auto text-xs">
                        {(data?.price).toLocaleString(undefined, { maximumFractionDigits: 0 })} EON
                      </div>
                    </div>
                    <div className="flex">
                      <Image className='' alt="user-eon-coin" src="/images/eonCoin.png" width={65} height={15} />
                    </div>
                  </div>
                </div>
                <Button className={cn(`min-w-[236px] uppercase`, `lg:w-full`)} onClick={onBuyPresaleClick}>Buy</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={cn(`py-16`, `lg:py-10`)}>
        <div className={cn(`container`)}>
          <div
            className={cn(
              `grid grid-cols-6 gap-6`,
              `xl:grid-cols-5`,
              `lg:grid-cols-4`,
              `md:grid-cols-3`,
              `sm:grid-cols-2 sm:gap-5`,
            )}
          >
            {data?.packageDetails.map((item, itemIdx) => item.itemType == 'DISPLAY' && (
              <div
                key={itemIdx}
                className={cn(`rounded-[32px] p-4`, `flex flex-col items-center ิ`, {
                  'bg-secondary/20': item.itemAmount <= 1,
                  'bg-card': item.itemAmount > 1,
                  // 'bg-secondary/20': item.rarity === 'rare',
                  // 'bg-card': item.rarity === 'common',
                })}
              >
                <div className={cn(`aspect-square w-[120px] rounded-2xl bg-white p-2`)}>
                  <Image
                    src={item.itemUrl}
                    alt=""
                    width={120}
                    height={120}
                    className={cn(`h-full w-full object-contain`)}
                  />
                </div>
                <TextOutline number={item.itemAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} className={cn(`-mx-[2px] -mt-4 h-[40px] w-full stroke-width-5`)} />
                <div className={cn(`flex flex-1 items-center`)}>
                  <p
                    dangerouslySetInnerHTML={{ __html: item.itemDescription }}
                    className={cn(`whitespace-pre-line text-center`)}
                  ></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Fragment>
  )
}

export default Page
