import type { FC, SVGProps } from 'react'

interface IIconArrowProps extends SVGProps<SVGSVGElement> {}

const IconArrow: FC<IIconArrowProps> = ({ ...props }) => {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="24" height="24" rx="12" fill="currentColor" />
      <path
        d="M15.7799 11.28C15.9206 11.4205 15.9997 11.6111 15.9999 11.81V12.19C15.9976 12.3884 15.9188 12.5783 15.7799 12.72L10.6399 17.85C10.546 17.9446 10.4182 17.9979 10.2849 17.9979C10.1516 17.9979 10.0238 17.9446 9.92992 17.85L9.21992 17.14C9.12586 17.0478 9.07285 16.9217 9.07285 16.79C9.07285 16.6583 9.12586 16.5321 9.21992 16.44L13.6699 12L9.21992 7.55997C9.12526 7.46609 9.07202 7.33829 9.07202 7.20497C9.07202 7.07166 9.12526 6.94386 9.21992 6.84997L9.92992 6.14997C10.0238 6.05532 10.1516 6.00208 10.2849 6.00208C10.4182 6.00208 10.546 6.05532 10.6399 6.14997L15.7799 11.28Z"
        fill="white"
      />
    </svg>
  )
}

export default IconArrow
