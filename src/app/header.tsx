'use client'

import type { FC } from 'react'
import { useEffect, useState } from 'react'

import { useConnectModal } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { TiThMenu, TiTimes } from 'react-icons/ti'
// import { useAccount, useDisconnect } from 'wagmi'

import ConnectWalletButton from '@/components/buttons/connect-wallet'
import Logo from '@/components/logo'
import { NAVBAR_MENUS } from '@/constants/config'
import { cn } from '@/utils/styling'

import axios from "axios";
import { useAtom } from "jotai";
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";
import { GoogleAuthUserInfoAtom, SealMetaverseAccountInfoAtom, ZeroEternalLoveAccountInfoAtom, googleAuthTokenAtom, userRefcodeSealAtom, userRefcodeZeroAtom } from '@/atoms/eonhub'

import { useCookies } from "react-cookie";
import { IEonUserDetail } from '@/types/eonhub'
import UserService from '@/services/user.service'
import { useEthers } from '@usedapp/core'
import { useSearchParams } from 'next/navigation'
// import ProtectedContent from '@/permission/check_user_party'

interface IHeaderProps { }

const Header: FC<IHeaderProps> = () => {
  
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  // cont { isConnected, isConnecting } = useAccount()
  // const { disconnect } = useDisconnect()
  // const { openConnectModal } = useConnectModal()
  const [googleOAuthToken, setGoogleOAuthToken] = useAtom(googleAuthTokenAtom);
  const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
  const userCookie: IEonUserDetail = cookie["eonhub-auth"];
  const userService = new UserService();


  const [sealMetaverseAccountInfo, setSealMetaverseAccountInfo] = useAtom(SealMetaverseAccountInfoAtom);
  const [zeroEternalLoveAccountInfo, setZeroEternalLoveAccountInfo] = useAtom(ZeroEternalLoveAccountInfoAtom);

  const [userRefcodeZero, setUserRefcodeZero] = useAtom(userRefcodeZeroAtom)
  const [userRefcodeSeal, setUserRefcodeSeal] = useAtom(userRefcodeSealAtom)

  const [inputRef, setInputRef] = useState(``);
  // const param = window?.location?.search?.split('?')[1] || '';
  // const refCode = param?.split('&')[1] ? param?.split('&')[0] : param;
  const { deactivate } =
    useEthers();

  // _State
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isScrolled, setIsScrolled] = useState<boolean>(false)

  // _Event
  const onScrolling = () => {
    setIsScrolled(window.scrollY > 50)
  }

  // _Effect
  useEffect(() => {
    onScrolling()
    window.addEventListener('scroll', onScrolling)

    return () => {
      window.removeEventListener('scroll', onScrolling)
    }
  }, [])


  useEffect(() => {
    }, [userCookie])


  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const key = searchParams?.[0];
    const val = searchParams?.[1];
    if (key === `promo` && !inputRef) {
      setInputRef(val)
    }
  }, [searchParams])

  const googleSignin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (codeResponse) => {
      const userInfoReq = await axios.get(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${codeResponse.access_token}`,);
      // setIsLoading(true);
      if (userInfoReq.data && userInfoReq.data.email) {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_EONHUB_API_URL}api/auth/verify`, {
          token: codeResponse.access_token,
          email: userInfoReq.data.email,
          gameId: 2,
          refererCode: inputRef ? inputRef : ``,
        });
        if (response.status == 200 && response.data?.token) {
          // setGoogleOAuth({ token: response.data?.token, email: userInfoReq.data.email, username: '' });
          setGoogleOAuthToken(codeResponse.access_token)
          setCookie(
            "eonhub-auth",
            JSON.stringify(
              // { token: response?.data?.token, email: response?.data?.email, username: '' }
              { ...response?.data }
            ),
            {
              path: "/",
              maxAge: 3600 * 1000, // Expires after 1hr
              sameSite: true,
              expires: new Date(Date.now() + 3600 * 1000)
            }
          );

          userService.fetchUserInfo(response?.data?.token, setCookie, removeCookie, () => { });
          toast.success("Login Success !", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            // theme: "colored",
          });
          // setHideWeb3PanelUI(false);
        }
        // debugger;
      }
      // setIsLoading(false);
    },
    onError: errorResponse => {

    },
  });
 

  return (
    <header
      className={cn(`fixed left-0 top-0 z-50 flex h-navbar w-screen items-center`, `transition-colors`, {
        'bg-white  ': isScrolled,
        'text-whiteX': !isScrolled && currentPath === '/', 
      })}
    >
         <link rel="shortcut icon" sizes="16x16 24x24 32x32 48x48" href="/images/EonGameHub.png" />
        <link rel="icon" href="/images/EonGameHub.png" sizes="any" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/EonGameHub.png" />
        {/* <!-- Primary Meta Tags --> */}
        <title>EON Game Hub: Play-to-Earn Game Streamers Service in Gamefi Crypto World</title>
        <meta name="title" content="EON Game Hub: Play-to-Earn Game streamer Service in Gamefi Crypto World" />
        <meta name="description" content="Eon Game Hub, where Gamefi Crypto Play-to-Earn elevates your gaming experiences. Join the community, conquer challenges, and reap the rewards. Dive in now!" />

        {/* <!-- Open Graph / Facebook --> */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://eonhub.net/" />
        <meta property="og:title" content="EON Game Hub: Play-to-Earn Game Streamer Service in Gamefi Crypto World" />
        <meta property="og:description" content="Eon Game Hub, where Gamefi Crypto Play-to-Earn elevates your gaming experiences. Join the community, conquer challenges, and reap the rewards. Dive in now! เกมออนไลน์ 2025 เกมมือถือ 2025" />
        <meta property="og:image" content="/images/EonGameHub.png" />

        {/* <!-- Twitter --> */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://eonhub.net/" />
        <meta property="twitter:title" content="EON Game Hub: Play-to-Earn Game Streamer Services in Gamefi Crypto World" />
        <meta property="twitter:description" content="Eon Game Hub, where Gamefi Crypto Play-to-Earn elevates your gaming experiences. Join the community, conquer challenges, and reap the rewards. Dive in now! เกมออนไลน์ 2025 เกมมือถือ 2025" />
        <meta property="twitter:image" content="/images/EonGameHub.png" />


      <div className={cn(`container flex items-center justify-between`)}>

        <Link href="/" className={cn(`z-50`)}>
          <Logo className={cn(`text-[78px]`)} />
        </Link>

        <button onClick={() => setIsOpen((e) => !e)} className={cn(`z-50 hidden`, `lg:block`)}>
          {isOpen ? (
            <TiTimes className={cn(`h-10 w-10 text-primary`)} />
          ) : (
            <TiThMenu className={cn(`h-10 w-10 text-primary`)} />
          )}
        </button>

        <div
          className={cn(
            `flex flex-1 items-center justify-between`,
            `lg:fixed lg:inset-0 lg:flex-col lg:bg-white lg:pb-14 lg:pt-navbar`,
            `lg:transition-opacity`,
            {
              'lg:pointer-events-none lg:invisible lg:opacity-0': !isOpen,
            },
          )}
        >
          <div></div>
          <nav>
            <ul className={cn(`flex items-center space-x-8`, `lg:flex-col lg:space-x-0 lg:space-y-6`)}>
              {NAVBAR_MENUS.map((menu, menuIdx) => (
                <li key={menuIdx}>
                  <Link
                    href={menu.href}
                    className={cn(`font-bold hover:opacity-70`, `lg:text-xl`)}
                    onClick={() => setIsOpen(false)}
                  >
                    {menu.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={cn(`flex items-center space-x-3`, `lg:flex-col lg:space-x-0 lg:space-y-6`)}>
            {/* {!isConnected && !isConnecting && (
              <button
                className={cn(`font-semibold uppercase drop-shadow`, `hover:opacity-70`, `lg:text-xl`)}
                onClick={() => {
                  openConnectModal()
                  setIsOpen(false)
                }}
              >
                Login
              </button>
            )} */}


            {inputRef || userRefcodeZero?.referrer ? (<>
              <div className="referral-activate">
                <span className={`inline-block ${`bg-green-400 text-white`} rounded-full px-3 py-1 text-sm font-semibold mx-auto`}>
                Discount +5%
                </span>
              </div>
            </>) : (<></>)}

            {!userCookie && (
              <button
                className={cn(`font-semibold uppercase drop-shadow  border-red-600 border-2 bg-none text-red-600 py-2 px-6 rounded-full`, `hover:bg-red-600 hover:text-white`, `lg:text-xl`)}
                onClick={() => {
                  // openConnectModal()
                  // setIsOpen(false)
                  googleSignin();
                }}
              >
                Login with Google
              </button>
            )}


            {userCookie && <ConnectWalletButton onClick={() => setIsOpen(false)} />}


          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
