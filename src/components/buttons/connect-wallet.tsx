import { useEffect, useState, type FC } from 'react'

import UserService from '@/services/user.service'
import { IEonUserDetail } from '@/types/eonhub'
import { useCookies } from "react-cookie";
import { providers } from 'ethers'
import { useWalletSigner } from '@/services/web3.service'
import { ZeroEternalLoveAccountInfoAtom, eonhubUserDetailAtom, initialZeroEternalLoveAccountData, web3TokenAtom } from '@/atoms/eonhub'
import { eonhubApiCreate } from '@/axios'
import { useAtom } from 'jotai'
import { toast } from 'react-toastify'
import { UserRejectedRequestError } from 'viem'
// import useENSName from '@/hooks/useENSName'
import useMetaMaskOnboarding from '@/hooks/useMetaMaskOnboarding'
import { injected } from '../../../connectors'
import { shortenHex, formatEtherscanLink } from '../../../util'
import { useWeb3React } from '@web3-react/core'
import EONTopupNav from '../navs/EONTopupNav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';

interface IConnectWalletButtonProps {
  className?: string
  buttonClassName?: string
  onClick?: VoidFunction
}

const ConnectWalletButton: FC<IConnectWalletButtonProps> = ({ className, buttonClassName, onClick }) => {
  const [eonhubUserDetail, setEonhubUserDetail] = useAtom(eonhubUserDetailAtom);

  const { active, error, activate, chainId, account, setError, library, deactivate } =
    useWeb3React();

  const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
  const userCookie: IEonUserDetail = cookie["eonhub-auth"];
  const eonhubAPI = eonhubApiCreate(userCookie?.token);
  const userService = new UserService();
  const [web3Token, setWeb3Token] = useAtom(web3TokenAtom);

  const { sign: signWallet } = useWalletSigner(
    library as providers.Web3Provider
  );


  const {
    isMetaMaskInstalled,
    isWeb3Available,
    startOnboarding,
    stopOnboarding,
  } = useMetaMaskOnboarding();


  // manage connecting state for injected connector
  const [connecting, setConnecting] = useState(false);
  useEffect(() => {
    if (active || error) {
      setConnecting(false);
      stopOnboarding();
    }
  }, [active, error, stopOnboarding]);

  const ENSName = (account || ``);


  async function signMessage() {
    const token = await signWallet(); // signWallet is a function from useWalletSigner hook 
    setWeb3Token(token);
    if (token) { bindingWallet(token); }
  }

  // useEffect(() => {
  //   if (web3Token && account) {
  //     bindingWallet(web3Token);
  //   }
  // }, [web3Token])

  async function bindingWallet(token: string) {
    const payload = {
      token: `${token}`,
      walletAddress: account
    }
    await eonhubAPI.post(
      '/api/wallet/binding',
      { ...payload },
    ).then((res) => {
      if (res.status == 200) {
        // console.log("res status: ", res);
        if (res.data?.data) {
          // setEonhubWallet(res.data.data); 

          userService.fetchUserInfo(userCookie?.token, setCookie, removeCookie, setEonhubUserDetail);
          toast("Binding Wallet Success !", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
          // window.location.reload();
        } else {
          toast(res.data?.message);
        }
      } else {
        toast("Please Contact Admin");
      }
      // debugger
    })
    // const [web3Token, setWeb3Token] = useAtom(web3TokenAtom);
  }


  const [zeroEternalLoveAccountInfo, setZeroEternalLoveAccountInfo] = useAtom(ZeroEternalLoveAccountInfoAtom);

  // Prev
  if (!userCookie?.token) {
    return (<>
      {userCookie?.token}
      {/* <GoogleSession /> */}
    </>)
  }

  if (typeof account !== "string") {
    return (<>

      <hr />
      <div className="my-auto  border p-3 px-6 text-black rounded-full truncate lg:border-0">
        <strong className='mr-1 lg:text-rose-600'> {`UID: ${userCookie?.userId}`}</strong>
        {`- ${userCookie?.email}`}
      </div>

      <div className="text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 text-center ">

        {isWeb3Available ? (<div className="my-1">
          <button
            disabled={connecting}
            onClick={() => {
              setConnecting(true);

              activate(injected).catch((error) => {
                // ignore the error if it's a user rejected request
                if (error instanceof UserRejectedRequestError) {
                  setConnecting(false);
                } else {
                  setError(error);
                }
              });
            }}
          >
            {isMetaMaskInstalled ? account ? shortenHex(account, 4) : "Connect to MetaMask" : "Connect to Wallet"}
          </button>
        </div>) : (
          <button onClick={startOnboarding}>Install Metamask</button>
          // <EONTopupNav/>
        )}

      </div>

      {userCookie?.token && (<span
        className="text-sm text-red-500 cursor-pointer my-auto"
        onClick={() => {
          removeCookie("eonhub-auth");
          // setEonhubUserDetail(undefined);
          setZeroEternalLoveAccountInfo(initialZeroEternalLoveAccountData);
          deactivate();
        }}
      >{`LOGOUT`}</span>)}

    </>);
  }

  if (!userCookie?.walletAddress && userCookie?.token) {
    return (
      <>

        {userCookie?.token && (<span
          className="text-sm text-red-500 cursor-pointer mr-4 py-3"
          onClick={() => {
            removeCookie("eonhub-auth");
            // setEonhubUserDetail(undefined);
            setZeroEternalLoveAccountInfo(initialZeroEternalLoveAccountData);
            deactivate();
          }}
        >{`LOGOUT`}</span>)}

        <div className="text-white cursor-pointer bg-rose-600 font-medium rounded-lg text-sm px-4 py-3 hover:text-white">
          <div className="">
            <div
              onClick={() => signMessage()}
            // {...{
            //   href: formatEtherscanLink("Account", [chainId || 0, account]),
            //   target: "_blank",
            //   rel: "noopener noreferrer",
            // }}
            >
              Link <span className="truncate">{`${shortenHex(account, 4)}`}</span> with
              <span className="bg-emerald-800 text-white p-1 px-2 rounded text-sm ml-2">{`UID: ${userCookie?.userId}`}</span>
            </div>
          </div>
        </div>
      </>
    )
  }


  if (userCookie?.walletAddress && userCookie.walletAddress.toLocaleUpperCase() !== account.toLocaleUpperCase()) {
    return (
      <div className="text-red-500 flex">
        <FontAwesomeIcon icon={faLink} className="my-auto mr-2" />
        <button
          disabled={connecting}
          onClick={() => {
            setConnecting(true);

            activate(injected).catch((error) => {
              // ignore the error if it's a user rejected request
              if (error instanceof UserRejectedRequestError) {
                setConnecting(false);
              } else {
                setError(error);
              }
            });
          }}
        >
          {isMetaMaskInstalled ? account ? shortenHex(userCookie?.walletAddress, 4) : "Connect to MetaMask" : "Connect to Wallet"}
        </button>
        <div className="my-auto mx-4 border bg-red-500 text-white  p-3 px-6 rounded-full truncate">
          <strong className='mr-1'> {`UID: ${userCookie?.userId}`}</strong>
          {`- ${userCookie?.email}`}
        </div>


        {userCookie?.token && (<span
          className="text-sm text-red-500 cursor-pointer my-auto"
          onClick={() => {
            removeCookie("eonhub-auth");
            // setEonhubUserDetail(undefined);
            setZeroEternalLoveAccountInfo(initialZeroEternalLoveAccountData);
            deactivate();
          }}
        >{`LOGOUT`}</span>)}

      </div>
    )
  }



  return (
    <div className="text-black mt-2 my-auto flex">


      <a
        {...{
          href: formatEtherscanLink("Account", [chainId || 0, account]),
          target: "_blank",
          rel: "noopener noreferrer",
        }}
        className={`${userCookie?.walletAddress?.toLocaleLowerCase() !== account?.toLocaleLowerCase() && `text-red-500 `} my-auto`}
      >
        {shortenHex(account, 4)}
        {userCookie?.walletAddress?.toLocaleLowerCase() !== account?.toLocaleLowerCase() && ` does not link with `}
      </a>

      <div className="my-auto mx-4 border  p-3 px-6 rounded-full truncate">
        <strong className='mr-1'> {`UID: ${userCookie?.userId}`}</strong>
        {`- ${userCookie?.email}`}
      </div>


      {userCookie?.token && (<span
        className="text-sm text-red-600 cursor-pointer hover:text-red my-auto"
        onClick={() => {
          removeCookie("eonhub-auth");
          // setEonhubUserDetail(undefined);
          setZeroEternalLoveAccountInfo(initialZeroEternalLoveAccountData);
          deactivate();
        }}
      >{`LOGOUT`}</span>)}
    </div>
  );
}

export default ConnectWalletButton
