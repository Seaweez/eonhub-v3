"use client";

import { Fragment } from 'react'
import { cn } from '@/utils/styling'
// import InputTailwind, { InputState } from '@/components/input/tailwindInput'
import BuyEon from '@/components/trading/buyEon'
import TransferEon from '@/components/trading/transferEon'
import WithdrawEon from '@/components/trading/withdrawEon'
import EONTopupNav from '@/components/navs/EONTopupNav'

interface ITradingPageProps { }

const TradingPage = ({ }: ITradingPageProps) => (
  <Fragment>
    <section className={cn(`pt-32`)}>
      <div className={cn(`container`)}>
        <h1 className={cn(`text-center text-[64px] font-bold mb-10`)}>Trading</h1>
        {/* <EONTopupNav /> */}
        <div className="flex justify-between gap-4">
         
          <BuyEon className={undefined} />
          <TransferEon />
          <WithdrawEon />
        
        </div>
      </div>
    </section>
  </Fragment>
)

export default TradingPage
