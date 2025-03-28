"use client";

import { useState, type FC, useEffect } from 'react'

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
import Swal from 'sweetalert2';
import useTokenContract from '@/hooks/useTokenContract';
import { utils } from 'ethers';
import { toast } from 'react-toastify';
import { useEthers, useTokenBalance } from '@usedapp/core';

interface IBuyEon {
    className?: string
}

// const inputTailwind: FC<IinputTailwindProps> = ({ className, id, name, image, price, isActive }) => {
export const BuyEon = ({ className }) => {

    const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
    const userCookie: IEonUserDetail = cookie["eonhub-auth"];
    const eonhubAPI = eonhubApiCreate(userCookie?.token);
    const userService = new UserService();

    const [amountEonToTransfer, setAmountEonToBuy] = useState(``);

    const [tokenContract, setTokenContract] = useState<any>(undefined);

    const { active, error, activate, chainId, account, setError, library, activateBrowserWallet, deactivate } =
        useEthers();


    const contract = useTokenContract('0x55d398326f99059fF775485246999027B3197955');


    const handleDepositClick = () => {
        if (!process?.env?.NEXT_PUBLIC_DEV_WALLET_ADDRESS || !process?.env?.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS) return;
        if (!userCookie?.walletAddress) return toast.error(`Please Link your wallet to an account!`);
        depositEON()
    }


    const depositEON = () => {
        if (!userCookie?.walletAddress) return toast.error(`Please link your account to your Wallet!`)
        Swal.fire({
            title: "Swap USDT to EON",
            // text: `${userCookie?.userId}`,
            footer: `1USDT = 10EON`,
            input: "text",
            inputAttributes: {
                autocapitalize: "off"
            },
            showCancelButton: true,
            confirmButtonText: "Swap",
            showLoaderOnConfirm: true,
            preConfirm: async (amount) => {
                try {
                    if (!userCookie.walletAddress || !account) { return toast.error(`Please Link Your Wallet!`) }
                    if (userCookie.walletAddress.toLowerCase() != account.toLowerCase()) { return toast.error(`Incorrect Wallet!`) }
                    const callTransfer = tokenContract?.transfer(process?.env?.NEXT_PUBLIC_DEV_WALLET_ADDRESS || '', `${utils.parseEther(`${amount}`)}`)
                        .then(success => {
                            const tx = success?.wait()
                            toast.promise(tx, {
                                pending: 'Pending ...',
                                success: `Success Deposit ${amount * 10} EON`,
                                error: 'Error when fetching',

                            })
                            tx.then(txOK => {
                                // Success transfer 
                                fetchUsdtBalance();
                                userService.fetchUserInfo(userCookie?.token, setCookie, removeCookie, () => { });
                            }).catch(txFailed => {
                                console.log('txFailed: ', txFailed)
                            })
                        }).catch(error => {
                            console.log('error: ', error)

                        })
                    return amount
                } catch (error) {
                    Swal.showValidationMessage(`
                Request failed: ${error}
              `);
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => { });
    }


    const fetchUsdtBalance = () => {

        if (!tokenContract || !tokenContract?.balanceOf || !account) return;
        const usdt = tokenContract?.balanceOf(account).then(balance => {
            //   setUsdtBalance(utils.formatEther(balance));
        })
    }

    useEffect(() => {
        if (!account) return
        fetchUsdtBalance();
    }, [account])

    return (
        <>

            <div className="border border-2 w-full p-4">
                <div className="flex justify-center">
                    <div className="1">
                        <div className="mb-4">
                            <InputTailwind label="EON Amount to Buy" inputState={InputState.default} defaultValue={amountEonToTransfer} />
                        </div>
                        <button onClick={() => handleDepositClick()} className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                            Buy EON
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default BuyEon
