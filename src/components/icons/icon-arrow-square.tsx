import type { FC, SVGProps } from 'react'

interface IIconArrowSquareProps extends SVGProps<SVGSVGElement> {}

const IconArrowSquare: FC<IIconArrowSquareProps> = ({ ...props }) => {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clipPath="url(#clip0_61_231)">
        <rect y="0.5" width="24" height="24" rx="8" fill="white" />
        <path
          d="M15.7802 11.7801C15.9209 11.9206 16 12.1113 16.0002 12.3101V12.6901C15.9979 12.8885 15.919 13.0784 15.7802 13.2201L10.6402 18.3501C10.5463 18.4448 10.4185 18.498 10.2852 18.498C10.1518 18.498 10.024 18.4448 9.93016 18.3501L9.22016 17.6401C9.1261 17.5479 9.07309 17.4218 9.07309 17.2901C9.07309 17.1584 9.1261 17.0323 9.22016 16.9401L13.6702 12.5001L9.22016 8.0601C9.12551 7.96621 9.07227 7.83842 9.07227 7.7051C9.07227 7.57178 9.12551 7.44398 9.22016 7.3501L9.93016 6.6501C10.024 6.55544 10.1518 6.5022 10.2852 6.5022C10.4185 6.5022 10.5463 6.55544 10.6402 6.6501L15.7802 11.7801Z"
          fill="#6373F7"
        />
      </g>
      <defs>
        <clipPath id="clip0_61_231">
          <rect y="0.5" width="24" height="24" rx="8" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default IconArrowSquare
