import { useEffect, useState } from "react";
// import useMetaMaskOnboarding from "../../hooks/useMetaMaskOnboarding";
// import { providers, utils } from "ethers";
// import { IEonUserDetail, authAtom, eonhubUserDetailAtom, usdtBalanceAtom, web3TokenAtom } from "../../atoms";
import { useAtom } from "jotai";
import { toast } from "react-toastify";
import { ERC20Interface, shortenAddress, useEthers } from "@usedapp/core";
import { useCookies } from "react-cookie";
import { eonhubApiCreate } from "../../axios";
// import { useWalletSigner } from "../../hooks/useWeb3Token";
import UserService from "../../services/user.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faArrowRightArrowLeft, faBars, faCoins, faEnvelope, faMinus, faMoneyBillTransfer, faPlusCircle, faRefresh, faWallet } from "@fortawesome/free-solid-svg-icons";
import Image from 'next/image';
import Swal from "sweetalert2";
import { IEonUserDetail, TOKEN_LIST } from "@/types/eonhub";
import { isHideEonhubPanelAtom, isLoadingAtom, usdtBalanceAtom, usdtContractAtom } from "@/atoms/eonhub";
import { Contract } from "@ethersproject/contracts";
import { ethers, providers, utils } from "ethers";
import { useWalletSigner } from "@/hooks/useWeb3Token";
import useTokenContract from "@/hooks/useTokenContract";
import { useWeb3React } from "@web3-react/core";
import { ZeroSelectServer } from "../zero-eternal-love/inventoryWhitelist";
import EonhubPanel from "../eonhub/eonhub-panel";

const RPC_URL = 'https://bsc-dataseed.binance.org/'

const EONTopupNav = () => {
  const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
  const userCookie: IEonUserDetail = cookie["eonhub-auth"];
  const eonhubAPI = eonhubApiCreate(userCookie?.token);
  const userService = new UserService();
  const [usdtContract, setUsdtContract] = useAtom(usdtContractAtom);
  const [usdtBalance, setUsdtBalance] = useAtom(usdtBalanceAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);


  const [hideTransfer, setHideTransfer] = useState(true);
  const [inputTransferAmount, setTransferAmount] = useState(0);
  const [inputTransferTarget, setTransferTarget] = useState('');

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

  useEffect(() => {
    if (!userCookie?.token) return
    userService.fetchUserInfo(userCookie?.token, setCookie, removeCookie, () => { });
  }, [])

  const fetchUsdtBalance = () => {
    if (!usdtContract || !usdtContract?.balanceOf || !account) return;
    const usdt = usdtContract?.balanceOf(account).then(balance => {
      setUsdtBalance(`${Number(utils.formatEther(balance)).toFixed(2)}`);
    })
  }

  const handleRefreshClick = () => {
    if (!userCookie?.token || !process?.env?.NEXT_PUBLIC_DEV_WALLET_ADDRESS || !process?.env?.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS) return;
    userService.fetchUserInfo(userCookie?.token, setCookie, removeCookie, () => { });
    // if (!contract || !contract?.balanceOf || !account) return;
    fetchUsdtBalance();
  }

  const withdrawEON = async () => {
    try {
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
      console.log('token error: ', error)

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

  const transferEONoffChainBtn = () => {
    setHideTransfer(!hideTransfer)
  }

  const transferEONoffChain = async () => {
    try {
      // const token = await signWallet(); // signWallet is a function from useWalletSigner hook

      // if (!token) return;
      let token = '';
      if (userCookie?.walletAddress) {
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

  const [leftToken, setLeftToken] = useState<TOKEN_LIST>(TOKEN_LIST.USDT)
  const [rightToken, setRightToken] = useState<TOKEN_LIST>(TOKEN_LIST.EON)

  const handleSwapTokenLR = () => {
    setLeftToken(rightToken);
    setRightToken(leftToken);
  }


  const handleExchangeButton = async () => {
    if (chainId != 56) return toast.error(`Currently, Available on BNB Chain only!`) // BSC Chain only

    const token = await signWallet(); // signWallet is a function from useWalletSigner hook

    if (!token) return;

    switch (leftToken) {
      case TOKEN_LIST.USDT:
        onExchangeToken()
        break;
      case TOKEN_LIST.EON:
        withdrawEON()
        break;
      default:
        break;
    }
  }

  const onExchangeToken = () => {

    if (!userCookie?.walletAddress) return toast.error(`Please link your account to your Wallet!`)
    if (userCookie?.walletAddress && userCookie.walletAddress.toLocaleUpperCase() !== account.toLocaleUpperCase()) return toast.error(`${shortenAddress(userCookie?.walletAddress)} is not connected!`)
    if (!usdtContract) return toast.error(`USDT Contract not found!`)

    Swal.fire({
      title: `${leftToken} to ${rightToken}`,
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


  const [isHideEonhubPanel, setIsHideEonhubPanel] = useAtom(isHideEonhubPanelAtom);

  // return (!userCookie?.token) ? (<>
  //   {/* <EONTopupNav /> */}
  // </>) : 
  return (
    <div className={`transition-all ${userCookie?.token ? `translate-y-0` : `translate-y-[150%]`} mt-2 fixed sm:bottom-2 sm:right-2 bottom-4 right-4 z-50 bg-none rounded-2xl py-1 pl-1 pr-2 border-2  bg-white bg-opacity-90 shadow-xl shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]`}>

      <div className="flex justify-end  ">

        {/* <div className="text-black py-3 font-extrabold -ml-">{`>`}</div> */}

        <div className={`group flex relative ${!account ? `hidden` : ``}`}>
          <div className="bg- rounded-lg   flex px-1 py-1">
            <span className="bg-neutral-100 p-1 shadow-md shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]  rounded-lg text-sm text-neutral-800 flex" id="tooltip-default" role="tooltip" >
              <p className="my-auto ml-1 font-bold proportional-nums">{usdtBalance}</p>
              <Image alt="user-eon-coin" src="/images/busdt_32.webp" style={{ padding: '0.15rem' }} width={35} height={20} />
              <div className="absolute bottom-0 right-0 cursor-pointer text-transparent opacity-50 hover:bg-neutral-800 hover:text-white p-1 rounded-lg" onClick={() => { handleRefreshClick() }}>
                <FontAwesomeIcon icon={faRefresh} />
              </div>
            </span>
          </div>
          <span className="group-hover:opacity-100 transition-opacity bg-gray-700 px-1 text-sm text-gray-100 rounded-lg absolute left-1/2 -translate-x-1/2 translate-y-full opacity-0 m-4 mx-auto">
            {`$${usdtBalance}`}
          </span>
        </div>

        <div className={`group flex relative ml-2 ${!account && `hidden`}`}>

          <span className=" border-2  shadow-md text-white dropshadow-xl h-fit my-auto  rounded-lg text-sm text-black flex" id="tooltip-default" role="tooltip" >
            <div className="my-auto cursor-pointer py-1 px-2 hover:bg-primary rounded-lg h-fit bg-primary hover:bg-secondary"
            // onClick={() => { handleSwapTokenLR() }}
            >
              {leftToken === TOKEN_LIST.USDT && (<FontAwesomeIcon icon={faArrowRight} />)}
              {leftToken === TOKEN_LIST.EON && (<FontAwesomeIcon icon={faArrowLeft} />)}
            </div>
          </span>

          <span className="group-hover:opacity-100 transition-opacity bg-gray-700 px-1 text-sm text-gray-100 rounded-lg absolute left-1/2 -translate-x-1/2 translate-y-full opacity-0 m-4 mx-auto">
            Switch
          </span>
        </div>

        {/* <div className="bg-black group flex relative"> */}
        <div className={`group flex relative ml-2 `}>

          <span className=" p-1 rounded-lg text-sm text-neutral-800 flex" id="tooltip-default" role="tooltip" >
            <div className="bg-neutral-100 rounded-lg shadow-md shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px] flex px-2 py-1">
              <p className="my-auto mx-1 font-bold slashed-zero ">
                {Number(userCookie?.eonPoint).toLocaleString('en-US', {})}
              </p>
              <div className="flex relative">
                <Image alt="user-eon-coin" src={`/images/eonCoin.png`} className={`mx-auto`} width={35} height={25} />
                <div className="absolute right-0 bottom-0 cursor-pointer text-transparent opacity-20 hover:opacity-90 px-1 bg-neutral-800 text-white rounded-lg" onClick={() => { handleRefreshClick() }}>
                  <FontAwesomeIcon icon={faRefresh} className="relative z-10" />
                </div>
              </div>
              {/* <span className={`bg-primary hover:bg-secondary ${!account && `hidden`} p-1 hover:shadow-md  rounded-full text-sm   hover:bg-primary text-white border-2  flex sm:ml-0 sm:mr-4 ml-2`} id="tooltip-default" role="tooltip" >

                <div className="my-auto cursor-pointer mx-1 text-xs  h-fit rounded-lg " onClick={() => { handleExchangeButton() }}>
                  <FontAwesomeIcon icon={faMoneyBillTransfer} className="" />
                </div>
              </span> */}
            </div>
          </span>
          <span className={`group-hover:opacity-90 transition-opacity bg-gray-700 px-1 text-sm text-gray-100 rounded-md absolute left-1/2 -translate-x-1/2 translate-y-full opacity-0 m-4 mx-auto`}>
            {leftToken === TOKEN_LIST.USDT ? chainId == 56 ? `Deposit` : `BNB Chain only` : `Withdraw`}
          </span>
        </div>

        {/* </div> */}


        {/* <div className="group flex relative ml-2">

          <span className="bg-white p-1 shadow-md  rounded text-sm text-black flex" id="tooltip-default" role="tooltip" >

            <div className="my-auto cursor-pointer mx-1 hover:bg-neutral-800 hover:text-white p-1 rounded" onClick={() => { handleExchangeButton() }}>
              <FontAwesomeIcon icon={faMoneyBillTransfer} className="" />
            </div>
          </span>
          <span className="group-hover:opacity-100 transition-opacity bg-gray-700 px-1 text-sm text-gray-100 rounded-md absolute left-1/2 -translate-x-1/2 translate-y-full opacity-0 m-4 mx-auto">
            Swap
          </span>
        </div> */}


        <div className="group flex relative ml-2 h-fit my-auto">

          <span className="bg-primary hover:bg-secondary border-2 p-1 shadow-md  rounded-full text-sm text-black hover:bg-primary text-white flex" id="tooltip-default" role="tooltip" >

            <div className="my-auto cursor-pointer mx-1 p-1 rounded"
              // onClick={() => { transferEONoffChainBtn() }}
              onClick={() => { setIsHideEonhubPanel(!isHideEonhubPanel) }}
            >
              <FontAwesomeIcon icon={faBars} className="" />
            </div>
          </span>
          <span className="group-hover:opacity-100 transition-opacity bg-gray-700 px-1 text-sm text-gray-100 rounded-md absolute left-1/2 -translate-x-1/2 translate-y-full opacity-0 m-4 mx-auto">
            Menu
          </span>
        </div>


        <>
          <div className={`w-screen h-screen fixed z-100 top-0 right-0 flex  justify-center items-center text-black transition-all duration-300 ${hideTransfer ? `scale-0 translate-x-full translate-y-full` : `scale-100`}`}  >
            <div
              className={`bg- absolute w-screen z-1 h-screen bg-  opacity-80 duration-300 transition-all top-0 left-0 ${hideTransfer ? `rounded-tl-full` : ``}`}
              onClick={() => { setHideTransfer(!hideTransfer) }}
            ></div>


            <div className="flex bg-white p-10 border-2  rounded-2xl">
              <div className="relative z-10 my-auto mr-4">
                <div className="flex justify-center item-center mb-1  ">
                  <Image alt="user-eon-coin" src="/images/eonCoin.png" className="" width={30} height={25} />
                  <label htmlFor="transfer-eon-amount" className="  mx-2 h-fit my-auto">EON</label>
                </div>
                <input type="text" name="transfer-eon-amount" placeholder="EON Amount" className={` text-center border-2 rounded-2xl mt-2`}
                  value={inputTransferAmount}
                  onChange={e => { setTransferAmount(Number(e?.target?.value) > 0 ? Number(e?.target?.value) : 0) }}
                />
              </div>



              <div className="relative z-10 my-auto">
                <div className="flex justify-center item-center mb-1">
                  <FontAwesomeIcon icon={faWallet} className="  my-auto" />
                  <label htmlFor="transfer-eon-target" className="  mx-2 h-fit my-auto"> Send to Email</label>
                </div>
                <input type="text" name="transfer-eon-target" placeholder="Email" className={`text-center border-2 rounded-2xl mt-2`}
                  value={inputTransferTarget}
                  onChange={e => { setTransferTarget(e?.target?.value || '') }}
                />
              </div>


              <div className="relative z-10 ml-4 mt-6">
                <button className="bg-primary text-white rounded-2xl hover:bg-blue-500   font-semibold py-2 px-4 border hover:border-transparent  "
                  onClick={() => transferEONoffChain()}
                >
                  Confirm Transfer
                </button>
              </div>
            </div>

          </div>
        </>

      </div>

      <div className="1">
        <div className={`fixed top-0 left-0 z-[0] h-screen w-screen ${isHideEonhubPanel ? `scale-y-0` : `scale-y-100`}`} onClick={() => setIsHideEonhubPanel(true)}></div>
        <div className={`transition-all fixed right-0 bottom-0  ${isHideEonhubPanel ? `scale-0 translate-x-full` : `scale-100`}`}>
          <EonhubPanel />
        </div>
      </div>

    </div>
  );
};

export default EONTopupNav;
function useActiveWeb3React(): { library: any; account: any; } {
  throw new Error("Function not implemented.");
}

