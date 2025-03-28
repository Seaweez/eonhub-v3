"use client";


import { Inter } from 'next/font/google'

import Footer from './footer'
import Header from './header'
import { APP_NAME } from '@/constants/config'
import { cn } from '@/utils/styling'
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Analytics } from '@vercel/analytics/react';

// import {
//   BSC,
//   BSCTestnet,
//   DAppProvider,
//   DEFAULT_SUPPORTED_CHAINS,
// } from "@usedapp/core";
import getLibrary from "./getLibrary";

// import { Mainnet, DAppProvider, useEtherBalance, useEthers, Config, Goerli } from '@usedapp/core'
// import { formatEther } from '@ethersproject/units'
import { getDefaultProvider } from 'ethers'

import {
  BSC,
  BSCTestnet,
  DAppProvider,
  DEFAULT_SUPPORTED_CHAINS,
  Mainnet,
  useEthers,
  useTokenBalance,
} from "@usedapp/core";

import 'sweetalert2/src/sweetalert2.scss'
import '@/styles/custom.css'
import '@/styles/globals.scss'
import { Web3ReactProvider } from "@web3-react/core";
import EONTopupNav from '@/components/navs/EONTopupNav';
import useTokenContract from '@/hooks/useTokenContract';
import { Suspense, useEffect } from 'react';
import { Provider } from 'jotai';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EonhubPanel from '@/components/eonhub/eonhub-panel';
import SupportTicket from '@/components/support-ticket';
// import { DAppProvider } from '@usedapp/core/dist/esm/src/providers/DAppProvider'

const config = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: 'https://mainnet.infura.io/v3/62687d1a985d4508b2b7a24827551934',
  },
}

export const rpcConfig = {
  readOnlyChainId: BSCTestnet.chainId,
  readOnlyUrls: {
    [BSC.chainId]: `https://bsc-dataseed.binance.org/`,
    [BSCTestnet.chainId]: `https://nd-101-497-997.p2pify.com/73da70ee18fa3f4b0d0275cc41da36b7`,
  },
  networks: [...DEFAULT_SUPPORTED_CHAINS],
};
// import { Mainnet, DAppProvider, useEtherBalance, useEthers, Config, Goerli } from '@usedapp/core'
// import { formatEther } from '@ethersproject/units'
// import { getDefaultProvider } from 'ethers'

// const config: Config = {
//   readOnlyChainId: Mainnet.chainId,
//   readOnlyUrls: {
//     [Mainnet.chainId]: `getDefaultProvider('mainnet')`,
//     [Goerli.chainId]: `getDefaultProvider('goerli')`,
//   },
// }



const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '600', '700', '800'], variable: '--font-sans' })

// export const metadata: any = {
//   title: APP_NAME,
//   description: 'The leading gaming NFT hub',
// }

const RootLayout = ({ children }: { children: React.ReactNode }) => {


  const { active, error, activate, chainId, account, setError, library, activateBrowserWallet, deactivate } =
    useEthers();


  const tokenContract = useTokenContract('0x55d398326f99059fF775485246999027B3197955');

  const bl = useTokenBalance(process?.env?.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS, account)
  useEffect(() => {
    if (!account) return
  }, [account, bl])

  return (
    <html lang="en" className={inter.variable}>
      <head>
      <meta name="keywords" content="Game Online 2025, Mobile Game 2025, เกมส์ออนไลน์ 2025, เกมส์มือถือ 2025" />
      </head>
      <body>
      <Suspense fallback={<LoadingSuspend />}> 
        <GoogleOAuthProvider clientId={"182638295661-dlod164lv3qsl2hfaihd26vhi424p7sf.apps.googleusercontent.com"}>

        {/* <Web3ReactProvider children={''} connectors={getLibrary} > */}
        <DAppProvider config={rpcConfig}>

          <Web3ReactProvider getLibrary={getLibrary}>
          <Provider>
            <Analytics />
            <Header />
            {/* <div className="fixed top-0 lg:h-screen w-screen overflow-hidden z-0">
            <div className="flex justify-center items-center h-full">
              <img
              src="/images/games/05.06.2024.png"
              alt=""
              className="object-cover object-center h-full lg:opacity-80"
              style={{ objectPosition: '50% 50%' }}
              />
            </div>
            </div> */}

            <EONTopupNav />
            <ToastContainer limit={1} />                  
  {/* <SupportTicket/> */}

            <main className={cn(`min-h-screen`)}>{children}</main>
   
            {/* {window?.location?.pathname == `/zero-village-member` ? (<></>) : <Footer />} */}
          </Provider>
          </Web3ReactProvider>

        </DAppProvider>
        </GoogleOAuthProvider>
      </Suspense>
      </body>
    </html>
  )
}

export default RootLayout


export const LoadingSuspend = () => {
  return (<>
    <div className="flex">
      <div className="1">
        <span className="loading loading-ring loading-xs"></span>
        <span className="loading loading-ring loading-sm"></span>
        <span className="loading loading-ring loading-md"></span>
        <span className="loading loading-ring loading-lg"></span>
      </div>
    </div>
  </>)
}