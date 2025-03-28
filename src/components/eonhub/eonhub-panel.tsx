"use client";
import React, { useEffect, useState } from "react";
import "./eonhub-panel.scss";
import { useAtom } from "jotai";
import { inventoryInGameWhitelistZeroAtom, inventoryZeroAtom, isHideEonhubPanelAtom, isLoadingAtom, marketHistoryZeroAtom, marketZeroAtom, marketZeroInventoryAtom, marketZeroTaxAtom, selectedServerAtom, usdtBalanceAtom, usdtContractAtom, userMarketHistoryZeroAtom, userMarketListZeroAtom, userWalletHistoryAtom } from "@/atoms/eonhub";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleDown, faArrowAltCircleUp, faGifts, faMoneyCheckAlt, faPaperPlane, faStoreAlt, faUpload, faWallet } from "@fortawesome/free-solid-svg-icons";
import { eonhubApiCreate } from "@/axios";
import UserService from "@/services/user.service";
import { IEonUserDetail, TOKEN_LIST, ZERO_ETERNAL_LOVE_GAME_ID } from "@/types/eonhub";
import { useCookies } from "react-cookie";
import { Contract, ethers, providers, utils } from "ethers";
import { useWalletSigner } from "@/hooks/useWeb3Token";
import { ERC20Interface, shortenAddress } from "@usedapp/core";
import { useWeb3React } from "@web3-react/core"
import Image from 'next/image';
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import MarketService, { MarketHistoryResponse, MarketList } from "@/services/market.service";

const EonhubPanel = () => {
    const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
    const userCookie: IEonUserDetail = cookie["eonhub-auth"];
    const eonhubAPI = eonhubApiCreate(userCookie?.token);
    const userService = new UserService();
    const [usdtContract, setUsdtContract] = useAtom(usdtContractAtom);
    const [usdtBalance, setUsdtBalance] = useAtom(usdtBalanceAtom);
    const [isLoading, setIsLoading] = useAtom(isLoadingAtom);

    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { library, account, chainId, activate, deactivate } = useWeb3React();

    const { sign: signWallet } = useWalletSigner(
        library as providers.Web3Provider
    );

    useEffect(() => {
        if (!account) return
        const contract = new Contract(process?.env?.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS, ERC20Interface, library.getSigner(account));
        setUsdtContract(contract)
    }, [account])

    useEffect(() => {
        fetchUsdtBalance();
    }, [usdtContract])

    const fetchUsdtBalance = () => {
        if (!usdtContract || !usdtContract?.balanceOf || !account) return;
        const usdt = usdtContract?.balanceOf(account).then(balance => {
            setUsdtBalance(`${Number(utils.formatEther(balance)).toFixed(2)}`);
        })
    }

    const [isHideEonhubPanel, setIsHideEonhubPanel] = useAtom(isHideEonhubPanelAtom);
    const onEonhubPanelToggle = () => {
        setIsHideEonhubPanel(!isHideEonhubPanel);
    }
    // ===== XXXXX =====
    const marketService = new MarketService();
    const [marketZeroInventory, setmarketZeroInventory] = useAtom(marketZeroInventoryAtom);
    const [inventoryZero, setInventoryZero] = useAtom(inventoryZeroAtom);
    const [marketZero, setMarketZeroAtom] = useAtom(marketZeroAtom);
    const [inventoryIngameWhitelistZero, setInventoryIngameWhitelistZero] = useAtom(inventoryInGameWhitelistZeroAtom);
    const [userMarketListZero, setUserMarketListZero] = useAtom(userMarketListZeroAtom);
    const [userMarketHistoryZero, setUserMarketHistoryZero] = useAtom(userMarketHistoryZeroAtom);
    const [marketHistoryZero, setMarketHistoryZero] = useAtom(marketHistoryZeroAtom);
    const [marketZeroTax, setMarketZeroTax] = useAtom(marketZeroTaxAtom);
    const [historyType, setHistoryType] = useState(`SELL`)
    const [userWalletHistory, setUserWalletHistory] = useAtom(userWalletHistoryAtom);
    const [isAllowRefreshData, setAllowRefreshData] = useState(true);
    const [selectedServer, setSelectedServer] = useAtom(selectedServerAtom);
    const refreshData = () => {
        if(!userCookie?.token) return
        
        const userWalletHistory = marketService.getUserWalletHistory(userCookie?.token)
        .then(res => {
            setUserWalletHistory(res)
        })
        .catch(err => {  })
    setAllowRefreshData(false);
        if(selectedDisplayHistory == `wallet-history`) {
            const zeroUserMarketHistory = marketService.getMarketHistory(selectedServer.gameId, userCookie?.token, true, historyType)
            .then(res => {
                const userMarketHistory = res as MarketHistoryResponse[]
                setUserMarketHistoryZero(userMarketHistory)
            })
            .catch(err => { console.log('marketZeroInventory: ', err) })
        const zeroRecentlySold = marketService.getMarketRecentlySold(selectedServer?.gameId, userCookie?.token)
            .then(res => {
                const recentlySold = res as any
                setMarketHistoryZero(recentlySold)
            })
            .catch(err => { console.log('marketZeroInventory: ', err) })
        } else {
 
        }
 
    }

    useEffect(() => {
        if (!userCookie || !userCookie?.token || isHideEonhubPanel) return
        if (isAllowRefreshData) refreshData();
    }, [userCookie,isHideEonhubPanel, selectedServer])

    useEffect(() => {
        if(!userCookie || !userCookie?.token) return
        const zeroUserMarketHistory = marketService.getMarketHistory(ZERO_ETERNAL_LOVE_GAME_ID, userCookie?.token, true, historyType)
            .then(res => {
                const userMarketHistory = res as MarketHistoryResponse[]
                setUserMarketHistoryZero(userMarketHistory)
            })
            .catch(err => {   })
    }, [historyType])
    // ===== EXCHANGE - TOKENS | OnTopupEON =====
    const onTopupEON = () => {

        if (!userCookie?.walletAddress) return toast.error(`Please link your account to your Wallet!`)
        if (userCookie?.walletAddress && userCookie.walletAddress.toLocaleUpperCase() !== account.toLocaleUpperCase()) return toast.error(`${shortenAddress(userCookie?.walletAddress)} is not connected!`)
        if (!usdtContract) return toast.error(`USDT Contract not found!`)
        if (chainId !== 56) return toast.error(`Please connect to Binance Smart Chain!`)
        Swal.fire({
            title: `USDT to EON`,
            // text: `${userCookie?.userId}`,
            footer: `1USDT = 10EON`,
            input: "text",
            inputAttributes: {
                autocapitalize: "off"
            },
            showCancelButton: true,
            confirmButtonText: "Swap",
            confirmButtonColor: '',
            showLoaderOnConfirm: true,
            preConfirm: async (amount) => {
                try {
                    const callTransfer = usdtContract?.transfer(process?.env?.NEXT_PUBLIC_DEV_WALLET_ADDRESS || '', `${(`${ethers.utils.parseEther(amount)}`)}`)
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
                            console.log('callTransfer error: ', error)

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


    // ===== EXCHANGE - TOKENS | onWithdrawEON =====
    const [hideTransfer, setHideTransfer] = useState(true);
    const [inputTransferAmount, setTransferAmount] = useState(0);
    const [inputTransferTarget, setTransferTarget] = useState('');

    const withdrawEON = async () => {
        try {

            if (userCookie?.walletAddress && userCookie.walletAddress.toLocaleUpperCase() !== account.toLocaleUpperCase()) return toast.error(`${shortenAddress(userCookie?.walletAddress)} is not connected!`)

            const token = await signWallet(); // signWallet is a function from useWalletSigner hook

            if (!token || isLoading) return;
            setIsLoading(true);
            Swal.fire({
                title: `Withdraw EON`,
                text: `${userCookie?.walletAddress}`,
                footer: `min 300EON 3% fee`,
                showCancelButton: true,
                confirmButtonText: "Confirm",
                confirmButtonColor: '',
                showLoaderOnConfirm: true,
                input: "text",
                inputAttributes: {
                    autocapitalize: "off",
                },
                preConfirm: async (amount) => {
                    try {

                        const id = toast.loading("Pending ...")
                        const req = requestWithdrawEON(amount, token).then((res) => {
                            if (res?.status == 200) {
                                toast.update(id, { render: `Success Withdraw ${amount} EON`, type: "success", isLoading: false, autoClose: 2000 });
                                userService.fetchUserInfo(userCookie?.token, setCookie, removeCookie, () => { });
                                fetchUsdtBalance();
                            } else {
                                toast.update(id, { render: 'Somethine went wrong.', type: "error", isLoading: false, autoClose: 2000 });
                                // console.log("No status");
                            }
                            setIsLoading(false)
                        }).catch(err => {
                            toast.update(id, { render: err.response.data.message, type: "error", isLoading: false, autoClose: 2000 });
                            setIsLoading(false)
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

        }
    }

    const requestWithdrawEON = async (amount: number, signToken: string) => {
        return await eonhubAPI.post(
            `api/wallet/withdraw`, {
            walletToken: signToken,
            eonPoint: amount
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userCookie?.token}`
            }
        },)

    }

    //   ===== Transfer EON ======
    const transferEONoffChainBtn = () => {
   
        setHideTransfer(!hideTransfer)
    }

    const transferEONoffChain = async () => {
        try {
            // const token = await signWallet(); // signWallet is a function from useWalletSigner hook
        
            // if (!token) return;
            let token = '';
            if (userCookie?.walletAddress) {
                if (userCookie?.walletAddress && userCookie.walletAddress.toLocaleUpperCase() !== account.toLocaleUpperCase()) return toast.error(`${shortenAddress(userCookie?.walletAddress)} is not connected!`)

                token = await signWallet(); // signWallet is a function from useWalletSigner hook
            }

            Swal.fire({
                title: `Transfer ${inputTransferAmount} EON Coin`,
                text: `to ${inputTransferTarget}`,
                footer: `( 0% Fee )`,
                showCancelButton: true,
                confirmButtonText: "Confirm",
                confirmButtonColor: '',
                showLoaderOnConfirm: true,
                preConfirm: async (amount) => {
                    try {
                        const id = toast.loading("Pending ...")
                        const req = requestTransferEONoffChain(token).then((res) => {
                            if (res?.status == 200) {
                                toast.update(id, { render: `Success Transfer ${inputTransferAmount} EON`, type: "success", isLoading: false, autoClose: 2000 });
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

    const requestTransferEONoffChain = async (walletToken: string) => {

        const payload = walletToken ? {
            destinationUserEmail: inputTransferTarget,
            walletToken,
            eonAmount: inputTransferAmount
        } : {
            destinationUserEmail: inputTransferTarget,
            eonAmount: inputTransferAmount
        }

        return await eonhubAPI.post(
            `api/wallet/transfer`, {
            // destinationWalletAddress: inputTransferTarget,
            destinationUserEmail: inputTransferTarget,
            walletToken,
            eonAmount: inputTransferAmount
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userCookie?.token}`
            }
        },)

    }

    const isNegative = (txnType: string) => {
        return txnType == `WITHDRAW` || txnType == `TRANSFER` || txnType.includes(`BUY`);
    }

    const [selectedDisplayHistory, setSelectedDisplayHistory] = useState(`wallet-history`)

    const isFailedTransaction = (txStatus: string) => {
        return txStatus == `FAILED` || txStatus == `REJECTED` || txStatus == `CANCELED`;
    }

    return (<>
        <div className={`eonhub-panel-container transition-all duration-300 ${isHideEonhubPanel ? `translate-x-16 hidden` : `-translate-y-[100%] translate-x-16`}`}>
            <div className="wallet-body">
                <div className="container">
                    <div className="iphone">
                        <div className={`close-btn duration-100 animate-pulse hover:animate-none   ${isHideEonhubPanel ? `-translate-y-1 hover:-translate-y-2 -translate-x-[10rem]` : `-translate-y-1  hover:translate-y-1`}`}>
                            <div className="X" onClick={onEonhubPanelToggle}>
                                {isHideEonhubPanel ? (<>
                                    <FontAwesomeIcon className=" " icon={faArrowAltCircleUp} />
                                </>) : (<>
                                    <FontAwesomeIcon className=" " icon={faArrowAltCircleDown} />
                                </>)}
                            </div>
                        </div>
                        <div className={`header bg-primary ${isHideEonhubPanel ? `header-hide` : ``}`}>
                            <div className="header-summary">
                                <div className="summary-text">
                                    My Balance
                                </div>
                                <div className="summary-balance">
                                    $ {((Number(userCookie?.eonPoint)/10) + Number(usdtBalance)).toLocaleString('en-US', {}) || `0.00`}
                                </div>
                                <div className="summary-text-2">
                                    +&nbsp;  {(Number(userCookie?.eonPoint) + Number(usdtBalance)).toLocaleString('en-US', {}) || `0.00`}
                                </div>
                            </div>
                            <div className="user-profile shadow-md rounded-full">
                                <img src="/images/rom/big-cat-red-hat.png" alt="big-cat-red-hat profile" className="user-photo w-10 h-10" />
                            </div>
                        </div>
                        <div className="content">
                            <div className="card">
                                <div className="upper-row">
                                    <div className="card-item">
                                        <div className="flex">
                                            {/* <Image alt="user-eon-coin" src={`/images/eonCoin.png`} className={`mr-[0.175rem] `} width={29} height={20} /> */}
                                            <span className="mt-2 balance-header">EON Balance</span>
                                        </div>
                                        <span className="balance-number">
                                            &nbsp;{Number(userCookie?.eonPoint).toLocaleString('en-US', {})}
                                        </span>
                                    </div>
                                    <div className="card-item">
                                        {/* <span>BSC USDT</span>
                                        <span />$&nbsp;{usdtBalance || ` 0.00`}
                                        <Image alt="user-bscUsdt-coin" src={`/images/busdt_32.webp`} className={`mx-auto mt-1`} width={32} height={22.5} /> */}
                                        {/* <span className="dollar">&#8377;</span> */}

                                        <div className="flex">
                                            {/* <Image alt="user-eon-coin" src={`/images/busdt_32.webp`} className={`mr-[.1rem] `} width={29} height={20} /> */}
                                            <span className="mt-2 balance-header">BSC USDT</span>
                                        </div>
                                        <span className="balance-number">
                                            &nbsp;{Number(usdtBalance).toLocaleString('en-US', {})}
                                        </span>
                                    </div>
                                </div>
                                <div className="lower-row">
                                    <div className="icon-item">
                                        <div className="icon">
                                            <FontAwesomeIcon icon={faUpload} onClick={onTopupEON} />
                                        </div>
                                        <div className="icon-text">Top-up EON</div>
                                    </div>
                                    <div className="icon-item">
                                        <div className="icon">
                                            <FontAwesomeIcon icon={faMoneyCheckAlt} onClick={withdrawEON} />
                                        </div>
                                        <div className="icon-text">Withdraw</div>
                                    </div>
                                    <div className="icon-item">
                                        <div className="icon">
                                            <FontAwesomeIcon icon={faPaperPlane} onClick={transferEONoffChainBtn} />
                                        </div>
                                        <div className="icon-text">Send</div>
                                    </div>
                                    <div className="icon-item">
                                        <div className="icon">
                                            <FontAwesomeIcon className="  hover:scale-130 pointer" onClick={() => window.location.href = `/redeem`} icon={faGifts} />
                                        </div>
                                        <div className="icon-text">Itemcode</div>
                                    </div>
                                </div>
                            </div>
                            <div className="transactions h-80 overflow-y-auto"><span className="t-desc">Recent Transactions</span>

                                <div className={`flex rounded-xl mb-3 bg-primary text-sm border-2 pt-4 w-full text-white rounded-tr-2xl transition-all ${userWalletHistory?.length || userWalletHistory?.length ? `scale-100` : `scale-0`}`}>
                                    <div className="relative">
                                        <h2 className={`text-center mb-4   mx-4 cursor-pointer ${selectedDisplayHistory == `wallet-history` ? `font-semibold` : `font-thin`}`}
                                            onClick={() => setSelectedDisplayHistory(`wallet-history`)}>Wallet</h2>
                                    </div>
                                    <div className="flex">
                                        <h2 className={`text-center   mx-4 cursor-pointer ${selectedDisplayHistory == `market-history` ? `font-semibold` : `font-thin`}`}
                                            onClick={() => setSelectedDisplayHistory(`market-history`)}>Market</h2>

                                        <div className={`text-sm font-medium text-center   border- border-gray-200 transition-all ${selectedDisplayHistory == `market-history` ? `scale-100` : `-translate-x-full scale-x-0`}`}>
                                            <ul className="flex flex-wrap justify-center -mb-px -mb-4">
                                                <li className="me-2">
                                                    <div onClick={() => { setHistoryType(`BUY`) }} className={`cursor-pointer inline-block px-4  border-2 rounded-full hover:text-white hover:font-bold hover:border-white pb-[2px] ${historyType === `BUY` ? `active text-white  border-white   shadow-md` : ` border-transparent`}`}>Buy</div>
                                                </li>
                                                <li className="me-2">
                                                    <div onClick={() => { setHistoryType(`SELL`) }} className={`cursor-pointer inline-block px-4  border-2 rounded-full hover:text-white hover:font-bold hover:border-white  pb-[2px] ${historyType === `SELL` ? `active text-white  border-white   shadow-md` : ` border-transparent`}`} aria-current="page">Sell</div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* <div className="transaction">
                                    <div className="t-icon-container"><img src="https://99designs.ca/og-image.png?utm_source=google&utm_medium=cpc&utm_network=g&utm_creative=323294316363&utm_term=99designs&utm_placement=&utm_device=c&utm_campaign=CA%20-%2099designs%20Branded&utm_content=99designs%20-%20exact&gclid=Cj0KCQjw4qvlBRDiARIsAHme6ouhXyscC85e3wUS5loKQ1rgpHSs2IyrD4Z_DwuWQLNXgClEeEebi48aAujREALw_wcB"
                                        className="t-icon" /></div>
                                    <div className="t-details">
                                        <div className="t-title">99 designs</div>
                                        <div className="t-time">03.45PM
                                        </div>
                                    </div>
                                    <div className="t-amount">+&nbsp;750&#8377;
                                    </div>
                                </div> */}

                                {selectedDisplayHistory == `wallet-history` && userWalletHistory?.map((history, index) => (<>
                                    <div className={`transaction ${isFailedTransaction(history?.status) ? `bg-red-500 text-white`:`bg-white`}`}>
                                        <div className="t-icon-container"><img src="/images/eonCoin.png"
                                            className="t-icon" /></div>
                                        <div className="t-details">
                                            <div className="t-title truncate">{history?.txnType}</div>
                                            <div className="t-time truncate">{history?.updatedTime?.toString()}
                                            </div>
                                        </div>
                                        <div className={`t-amount ${isNegative(history?.txnType) ? `text-red-500` : `text-green-500`}`}>{isNegative(history?.txnType) ? `-${history?.eonAmount}` : `+${history?.eonAmount}`}
                                        </div>
                                    </div>
                                </>))}

                                {/* MARKET HISTORY */}
                                {selectedDisplayHistory == `market-history` && userMarketHistoryZero?.map((history, index) => (<>
                                    <div className="transaction">
                                        <div className="t-icon-container"><img src={`${history.itemPictureUrl || `/images/eonCoin.png`}`}
                                            className="t-icon" /></div>
                                        <div className="t-details">
                                            <div className="t-title truncate">{history?.historyType}</div>
                                            <div className="t-time truncate">{history?.actionTime?.toString()}
                                            </div>
                                        </div>
                                        <div className={`t-amount ${isNegative(history?.historyType) ? `text-red-500` : `text-green-500`}`}>{isNegative(history?.historyType) ? `-${history?.price}` : `+${history?.price}`}
                                        </div>
                                    </div>
                                </>))}
                                {/* {userMarketHistoryZero && userMarketHistoryZero.length && selectedDisplayHistory == `market-history` ? (<>

                                    {userMarketHistoryZero && userMarketHistoryZero.map(history => (
                                        <div className="transaction">
                                            <div className="t-icon-container"><img src="/images/eonCoin.png"
                                                className="t-icon" /></div>
                                            <div className="t-details">
                                                <div className="t-title truncate">{history?.historyType}</div>
                                                <div className="t-time">03.45PM
                                                </div>
                                            </div>
                                            <div className={`t-amount ${isNegative(history?.historyType) ? `text-red-500` : `text-green-500`}`}>{isNegative(history?.historyType) ? `-${history?.price}` : `+${history?.price}`}
                                            </div>
                                        </div>
                                    ))}

                                </>) : (<></>)} */}


                            </div>
                            <div className="absolute w-full  flex justify-center gap-14   -bottom-[3%]    transition-all duration-300">
                                <div className={`w-fit py-2   rounded-full opacity-70 hover:opacity-100 hover:text-[#ffc168]   cursor-pointer ${selectedDisplayHistory == `wallet-history` ? `text-ylw` : `text-neutral-400`}`}>
                                    <FontAwesomeIcon icon={faWallet} className={`hover:scale-125`} onClick={() => setSelectedDisplayHistory(`wallet-history`)} />
                                </div>
                                <div className={`w-fit py-2   text-center rounded-full opacity-70 hover:opacity-100 hover:text-[#ffc168]   cursor-pointer ${selectedDisplayHistory == `market-history` ? `text-ylw` : `text-neutral-400`}`}>
                                    <FontAwesomeIcon icon={faStoreAlt} className={`hover:scale-125`} onClick={() => setSelectedDisplayHistory(`market-history`)} />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                {/* <div className="footer">made with ❤️ by <a href="https://www.twitter.com/surendharnagraj" target="_blank">Surendhar Nagarajan</a><br /><small>-- based on dribble by <a href="https://surendharnagarajan.tk/" target="_blank">Surendhar Nagarajan</a></small></div> */}
            </div>



            {/* Transfer Overlay */}
            <>
                <div className={`flex w-screen h-screen fixed z-100 top-0 right-0 flex  justify-center items-center text-black transition-all duration-300 ${hideTransfer ? `scale-0 translate-x-full translate-y-full` : `scale-100`}`}  >
                    <div
                        className={`bg- fixed w-screen z-1 h-screen bg-  opacity-80 duration-300 transition-all top-0 left-0 ${hideTransfer ? `rounded-tl-full` : ``}`}
                        onClick={() => { setHideTransfer(!hideTransfer) }}
                    ></div>


                    <div className="fixed top-[20%]  bg-white p-8 pr-6 border-2  rounded-lg">
                        <div className="relative z-10 my-auto mr-4">
                            <div className="flex justify-center item-center  ">
                                <Image alt="user-eon-coin" src="/images/eonCoin.png" className="" width={30} height={25} />
                                <label htmlFor="transfer-eon-amount" className="  mx-2 h-fit my-auto">EON</label>
                            </div>
                            <input type="text" name="transfer-eon-amount" placeholder="EON Amount" className={` text-center border-2 rounded-md mt-1`}
                                value={inputTransferAmount}
                                onChange={e => { setTransferAmount(Number(e?.target?.value) > 0 ? Number(e?.target?.value) : 0) }}
                            />
                        </div>



                        <div className="relative z-10 my-auto">
                            <div className="flex justify-center item-center mb-1 mt-4">
                                {!hideTransfer && <FontAwesomeIcon icon={faWallet} className="  my-auto" />}
                                <label htmlFor="transfer-eon-target" className="  mx-2 h-fit my-auto"> Send to Email</label>
                            </div>
                            <input type="text" name="transfer-eon-target" placeholder="Email" className={`text-center border-2 rounded-md`}
                                value={inputTransferTarget}
                                onChange={e => { setTransferTarget(e?.target?.value || '') }}
                            />
                        </div>


                        <div className="relative z-10 flex justify-center mt-6">
                            <button className="bg-primary text-white rounded-2xl hover:bg-blue-500   font-semibold py-2 px-4 border hover:border-transparent  "
                                onClick={() => transferEONoffChain()}
                            >
                                Confirm Transfer
                            </button>
                        </div>
                    </div>

                </div>
            </>
            {/* ------------ END of Transfer Overlay ------------ */}

        </div>
    </>);
};

export default EonhubPanel;
