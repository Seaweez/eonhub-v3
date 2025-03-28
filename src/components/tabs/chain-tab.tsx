import { useState, type FC } from 'react'

import Image from 'next/image'

import { cn } from '@/utils/styling'

interface IChainTabProps {
  className?: string
  onSelect?: (val: string) => void
  disabledSymbol?: string
}

interface IOption {
  icon: string
  symbol: string
  label: string
}

const options: IOption[] = [
  {
    icon: '/images/chains/bsc.png',
    symbol: 'bsc',
    label: 'BSC',
  },
  {
    icon: '/images/chains/optimistic.png',
    symbol: 'optimistic',
    label: 'Optimistic',
  },
]

const ChainTab: FC<IChainTabProps> = ({ className, onSelect, disabledSymbol }) => {
  // _State
  const [selcted, setSelected] = useState<string>(options[0].symbol)

  return (
    <div className={cn(`mt-6 flex rounded-full border border-border p-2 shadow`, className)}>
      {options.map((option) => {
        const isSelected = selcted === option.symbol
        const isDisabled = disabledSymbol === option.symbol

        return (
          <div
            key={option.symbol}
            className={cn(
              `flex h-14 flex-1 items-center justify-center space-x-4 rounded-full text-xl font-bold`,
              `lg:h-12 lg:space-x-2 lg:text-lg`,
              {
                'bg-secondary text-white': isSelected && !isDisabled,
                'opacity-30': isDisabled,
              },
            )}
            onClick={() => {
              if (!isDisabled) {
                setSelected(option.symbol)
                onSelect?.(option.symbol)
              }
            }}
          >
            <Image src={option.icon} alt="" width={40} height={40} className={cn(`lg:h-[32px] lg:w-[32px]`)} />
            <span>{option.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default ChainTab
