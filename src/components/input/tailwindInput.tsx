



import type { FC } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import Button from '../base/button'
import IconArrow from '../icons/icon-arrow'
import TextOutlinePack from '../text-outline-pack'
import { cn } from '@/utils/styling'

interface IinputTailwindProps {
    placeHolder?: string
    className?: string
    inputState: InputState
    label: string
    defaultValue: string
    // message: string
    // name: string
    // image: string
    // price: number
    // isActive?: boolean
}

export enum InputState {
    default,
    success,
    error
}


// const pack = {
//   1: SoloPackText,
//   2: DuoPackText,
//   3: KingPackText,
// }

// const inputTailwind: FC<IinputTailwindProps> = ({ className, id, name, image, price, isActive }) => {
const InputTailwind: FC<IinputTailwindProps> = ({ className, inputState, label, placeHolder, defaultValue }) => {
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

    const placeholder = placeHolder || `...`;

    {/* Input-Default */ }
    if (inputState === InputState.default) return (<>
        <div className={className}>
            <label htmlFor="default" className="block mb-2 text-sm font-medium ">{label}</label>
            <input type="text" id="success" defaultValue={defaultValue} className="bg-neutral-50 border border-neutral-500 text-neutral-900   placeholder-neutral-700   text-sm rounded-lg focus:ring-neutral-500 focus:border-neutral-500 block w-full p-2.5 " placeholder={placeholder} />
            {/* <p className="mt-2 text-sm text-neutral-600 "><span className="font-medium">Well done!</span> Some success message.</p> */}
        </div>
    </>)

    {/* Input-Success */ }
    if (inputState === InputState.success) return (<>
        <div className={className}>
            <label htmlFor="success" className="block mb-2 text-sm font-medium text-green-700">{label}</label>
            <input type="text" id="success" defaultValue={defaultValue} className="bg-green-50 border border-green-500 text-green-900   placeholder-green-700   text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 " placeholder={placeholder} />
            {/* <p className="mt-2 text-sm text-green-600 "><span className="font-medium">Well done!</span> Some success message.</p> */}
        </div>
    </>)

    {/* Input-Error */ }
    if (inputState === InputState.error) return (<>
        <div className={className}>
            <label htmlFor="error" className="block mb-2 text-sm font-medium text-red-700 ">{label}</label>
            <input type="text" id="error" defaultValue={defaultValue} className="bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5 " placeholder={placeholder} />
            {/* <p className="mt-2 text-sm text-red-600"><span className="font-medium">Oh, snapp!</span> Some error message.</p> */}
        </div>
    </>)
 
}

export default InputTailwind


