import type { FC, SVGProps } from 'react'

interface IIconArrowCircleRightProps extends SVGProps<SVGSVGElement> {}

const IconArrowCircleRight: FC<IIconArrowCircleRightProps> = ({ ...props }) => {
  return (
    <svg width="1em" height="1em" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M27.9998 51.3332C40.8865 51.3332 51.3332 40.8865 51.3332 27.9998C51.3332 15.1132 40.8865 4.6665 27.9998 4.6665C15.1132 4.6665 4.6665 15.1132 4.6665 27.9998C4.6665 40.8865 15.1132 51.3332 27.9998 51.3332Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25.0601 36.2365L33.2734 27.9999L25.0601 19.7632"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default IconArrowCircleRight
