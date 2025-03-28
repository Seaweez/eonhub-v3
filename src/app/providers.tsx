'use client'

import type { FC, PropsWithChildren } from 'react'

import { RainbowKitProvider, getDefaultWallets, connectorsForWallets, lightTheme } from '@rainbow-me/rainbowkit'
import { argentWallet, trustWallet, ledgerWallet } from '@rainbow-me/rainbowkit/wallets'
import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import { bsc, optimism } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'

import '@rainbow-me/rainbowkit/styles.css'
import { APP_NAME } from '@/constants/config'

interface IProvidersProps extends PropsWithChildren {}

const { chains, publicClient, webSocketPublicClient } = configureChains([bsc, optimism], [publicProvider()])

// TODO: you can projectId from `WalletConnect Cloud`.
// https://cloud.walletconnect.com/
const projectId = 'YOUR_PROJECT_ID'

const { wallets } = getDefaultWallets({
  appName: APP_NAME,
  projectId,
  chains,
})

const appInfo = {
  appName: APP_NAME,
}

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Other',
    wallets: [
      argentWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
    ],
  },
])

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

const Providers: FC<IProvidersProps> = ({ children }) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider appInfo={appInfo} chains={chains}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default Providers
