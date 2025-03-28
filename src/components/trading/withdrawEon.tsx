"use client";

import { useState, type FC } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import Button from '../base/button'
import IconArrow from '../icons/icon-arrow'
import TextOutlinePack from '../text-outline-pack'
import { cn } from '@/utils/styling'
import InputTailwind, { InputState } from '../input/tailwindInput'
import { eonhubApiCreate } from '@/axios';
import UserService from '@/services/user.service';
import { IEonUserDetail } from '@/types/eonhub';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
// import { useEthers } from '@usedapp/core';
import { useWalletSigner } from '@/services/web3.service';
// import { Web3Provider } from "@ethersproject/providers";

interface IWithdrawEon {
  className?: string
}

// const inputTailwind: FC<IinputTailwindProps> = ({ className, id, name, image, price, isActive }) => {
const WithdrawEon: FC<IWithdrawEon> = ({ className }) => {

  const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
  const userCookie: IEonUserDetail = cookie["eonhub-auth"];
  const eonhubAPI = eonhubApiCreate(userCookie?.token);
  const userService = new UserService();


  // const { active, error, activate, chainId, account, setError, library, activateBrowserWallet, deactivate } =
  //   useEthers();

  // const { sign: signWallet } = useWalletSigner(
  //   library as any
  // );

  const [amountEonToWithdraw, setAmountEonToWithdraw] = useState(``);

  const WithdrawEonoffChain = async () => {
    try {
      // const token = await signWallet(); // signWallet is a function from useWalletSigner hook

      // if (!token) return;

      Swal.fire({
        title: `Withdraw ${amountEonToWithdraw} EON Coin`,
        text: `to ${`xxx@gmail.com`}`,
        footer: `( 0% Fee )`,
        showCancelButton: true,
        confirmButtonText: "Confirm",
        showLoaderOnConfirm: true,
        preConfirm: async (amount) => {
          try {
            const id = toast.loading("Pending ...")
            const req = requestWithdrawEonoffChain(`${`token`}`).then((res) => {
              if (res?.status == 200) {
                toast.update(id, { render: `Success Withdraw ${amountEonToWithdraw} EON`, type: "success", isLoading: false, autoClose: 2000 });
                userService.fetchUserInfo(userCookie?.token, setCookie, removeCookie, () => { });
              } else {
                toast.update(id, { render: 'Somethine went wrong.', type: "error", isLoading: false, autoClose: 2000 });
                // console.log("No status");
              }
            }).catch(err => {
              toast.update(id, { render: err.response.data.message, type: "error", isLoading: false, autoClose: 2000 });
            });

          } catch (error) {
            Swal.showValidationMessage(`
                Request failed: ${error}
              `);
          }
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        
      });

    } catch (error) {
      console.log('token error: ', error)

    }
  }

  const requestWithdrawEonoffChain = async (signToken: string) => {
    return await eonhubAPI.post(
      `api/wallet/withdraw`, {
      // destinationWalletAddress: inputWithdrawTarget,
      destinationUserEmail: `inputWithdrawTarget`,
      walletToken: signToken,
      eonAmount: amountEonToWithdraw
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userCookie?.token}`
      }
    },)

  }


  return (
    <>
      <div className="border border-2 w-full p-4">
        <div className="flex justify-center">
          <div className="2">
            <div className="mb-4">
              <InputTailwind label="EON Amount to Withdraw" inputState={InputState.default} defaultValue={amountEonToWithdraw} />
            </div>
            <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
              Withdraw EON
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default WithdrawEon





