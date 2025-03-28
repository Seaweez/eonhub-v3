import type { FC } from 'react'

import { cn } from '@/utils/styling'

interface ITextOutlineNumberProps {
  number: string | number
  className?: string
}

const TextOutlineNumber: FC<ITextOutlineNumberProps> = ({ number, className }) => {
  return (
    <svg
      viewBox="0 0 230 80"
      className={cn(`fill-white font-sans text-[60px] font-bold italic text-secondary stroke-width-4`, className)}
    >
      <text className="svg-text-stroke" x="50%" y="50%" dominantBaseline="middle" textAnchor="middle">
        x{number}
      </text>
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle">
        x{number}
      </text>
    </svg>
  )
}

export default TextOutlineNumber
