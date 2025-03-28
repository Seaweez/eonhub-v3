import type { FC } from 'react'

import { cn } from '@/utils/styling'

interface ITextOutlinePackProps {
  text: string
  className?: string
}

const TextOutlinePack: FC<ITextOutlinePackProps> = ({ text, className }) => {
  return (
    <svg
      viewBox="0 0 450 80"
      className={cn(`fill-secondary font-sans text-[64px] font-bold text-white stroke-width-3`, className)}
    >
      <text className="svg-text-stroke" x="10" y="60">
        {text}
      </text>
      <text x="10" y="60">
        {text}
      </text>
    </svg>
  )
}

export default TextOutlinePack
