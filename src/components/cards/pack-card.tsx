import type { FC } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import Button from '../base/button'
import IconArrow from '../icons/icon-arrow'
import TextOutlinePack from '../text-outline-pack'
import { cn } from '@/utils/styling'

interface IPackCardProps {
  className?: string
  id: number
  name: string
  image: string
  price: number
  isActive?: boolean
}

// const pack = {
//   1: SoloPackText,
//   2: DuoPackText,
//   3: KingPackText,
// }

const PackCard: FC<IPackCardProps> = ({ className, id, name, image, price, isActive }) => {
  // _Memo
  // TODO: เป็นแค่ตัวอย่าง
  // const renderLabel = useMemo(() => {
  //   const Text = pack[id] as typeof SoloPackText
  //   return (
  //     <Text
  //       className={cn({
  //         'text-[28px] lg:text-[23px]': isActive,
  //         'text-[23px]': !isActive,
  //       })}
  //       strokeWidth={10}
  //     />
  //   )
  // }, [id, isActive])

  return (
    <div
      className={cn(
        {
          'pt-[100px] lg:pt-[80px]': isActive,
          'pt-[80px]': !isActive,
        },
        className,
      )}
    >
      <div
        className={cn(
          `relative rounded-[40px] border border-secondary p-2`,
          `before:absolute before:inset-2 before:-z-10 before:rounded-[32px] before:shadow-pack`,
          {
            'before:bg-secondary/20': !isActive,
            'before:bg-secondary lg:before:bg-secondary/20': isActive,
          },
        )}
      >
        <Image
          src={image}
          alt=""
          width={250}
          height={250}
          className={cn(`mx-auto drop-shadow-pack `, {
            '-mt-[100px] h-[200px] w-[200px] lg:-mt-[80px] lg:h-[160px] lg:w-[160px]': isActive,
            '-mt-[80px] h-[160px] w-[160px]': !isActive,
          })}
        />

        <div className={cn(`px-8 pb-8 pt-4`)}>
          {/* {renderLabel} */}
          <TextOutlinePack
            text={name}
            className={cn({
              'h-[32px] lg:h-[24px] lg:stroke-width-5  ': isActive,
              'h-[24px] stroke-width-5 ': !isActive,
            })}
          />

          <div className={cn(`mt-6 flex items-center justify-between space-x-3`)}>
            <span
              className={cn(`text-2xl grid font-bold`, {
                'text-white lg:text-foreground': isActive,
              })}
            >
              

                            <span
                                className={cn(`text-2xl font-bold`, {
                                    'text-white lg:text-foreground': isActive,
                                })}
                            >
                                {price}$
                            </span>

                            <span
                            className={cn(`text-sm font-bold`, {
                                'text-white lg:text-foreground': isActive,
                            })}
                        >
                            {price*10} EON
                        </span> 
            </span>
            <Button variant="light" asChild>
              <Link href={`/pack/${id}`}>
                Detail <IconArrow className={cn(`ml-4 text-2xl text-secondary`)} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PackCard
