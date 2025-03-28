import type { FC } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import Button from '@/components/base/button'
import IconArrowSquare from '@/components/icons/icon-arrow-square'
import Logo from '@/components/logo'
import { NAVBAR_MENUS } from '@/constants/config'
import { cn } from '@/utils/styling'

interface IFooterProps {}

const Footer: FC<IFooterProps> = () => {
  return (
    <footer className={cn(`pt-10`)}>
      <div className={cn(`container`)}>
        <div className={cn(`relative`)}>
          <div className={cn(`absolute -inset-4 rounded-[48px] bg-white`, `md:-inset-2`)}></div>
          <div
            className={cn(
              `relative z-10 rounded-[40px] bg-[#ffd664]`,
              `flex items-center space-x-4 p-10`,
              `md:flex-col md:items-start md:space-x-0 md:px-4 md:py-6`,
            )}
          >
            <div className={cn(`w-[420px] text-[36px] font-bold leading-tight text-white`, `lg:w-auto`, `md:hidden`)}>
              SUBSCRIBE
              <br />
              TO OUR
              <br />
              NEWSLETTER
            </div>
            <div className={cn(`hidden text-2xl font-bold text-white`, `md:block`)}>
              SUBSCRIBE TO
              <br />
              OUR NEWSLETTER
            </div>
            <form className={cn(`flex-1`, `md:mt-6 md:w-full`)}>
              <div className={cn(`text-2xl font-bold`, `md:text-base`)}>Keep up to date our latest news!</div>
              <div
                className={cn(
                  `mt-6 flex items-center space-x-3 rounded-full border border-white p-2`,
                  `md:mt-4 md:flex-col md:space-x-0 md:space-y-3 md:rounded-[32px]`,
                )}
              >
                <div className={cn(`flex-1 overflow-hidden rounded-full bg-white px-6 shadow`, `md:w-full`)}>
                  <input
                    type="email"
                    className={cn(`h-14 w-full font-semibold text-foreground focus:outline-none`)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary-outline"
                  className={cn(`uppercase`, `md:w-full md:justify-between`)}
                >
                  Subscribe <IconArrowSquare className={cn(`ml-4 text-2xl`)} />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className={cn(`-mt-20 bg-primary pt-20`)}>
        <div className={cn(`container flex items-center justify-between py-10`, `lg:flex-col-reverse`)}>
          <Link href="https://www.facebook.com/eonhub.gamefi/" className={cn(`lg:mt-8`)}>
            <Logo className={cn(`text-[78px]`)} />
          </Link>

          <nav className={cn(`lg:hidden`)}>
            <ul className={cn(`flex items-center space-x-8`, `lg:flex-col lg:space-x-0 lg:space-y-6`)}>
              {NAVBAR_MENUS.map((menu, menuIdx) => (
                <li key={menuIdx}>
                  <Link href={menu.href} className={cn(`font-bold text-white hover:opacity-70`, `lg:text-xl`)}>
                    {menu.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={cn(`flex items-center space-x-4`)}>
            <Link href="https://www.facebook.com/zeroeternallovenft/">
              <Image src="/images/facebook.png" alt="" width={56} height={56} />
            </Link>
            {/* <Link href="#">
              <Image src="/images/twitter.png" alt="" width={56} height={56} />
            </Link> */}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
