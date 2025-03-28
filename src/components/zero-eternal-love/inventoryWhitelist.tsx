import { SealMetaverseAccountInfoAtom, ZeroEternalLoveAccountInfoAtom, inventoryZeroAtom, inventoryInGameWhitelistZeroAtom, selectedServerAtom, isRefreshingAtom, isHideMarketWalletAtom } from "@/atoms/eonhub";
import { eonhubApiCreate } from "@/axios";
import { useWalletSigner } from "@/hooks/useWeb3Token";
import MarketService, { InventoryResponseDTO, ItemDetail, MarketItemResponseDTO } from "@/services/market.service";
import UserService from "@/services/user.service";
import { IEonUserDetail, ZERO_ETERNAL_LOVE_GAME_ID } from "@/types/eonhub";
import { IZeroEternalLoveCharInfo } from "@/types/zero-eternal-love";
import { useWeb3React } from "@web3-react/core";
import { providers } from "ethers";
import { useAtom } from "jotai";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Image from 'next/image'
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export const InventoryInGameZero = ({ data, gameId }: { data: MarketItemResponseDTO, gameId: number }) => {

  const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
  const userCookie: IEonUserDetail = cookie["eonhub-auth"];
  const eonhubAPI = eonhubApiCreate(userCookie?.token);

  const userService = new UserService();
  const marketService = new MarketService()
  const [sealMetaverseAccountInfo, setSealMetaverseAccountInfo] = useAtom(SealMetaverseAccountInfoAtom);
  const [zeroEternalLoveAccountInfo, setZeroEternalLoveAccountInfo] = useAtom(ZeroEternalLoveAccountInfoAtom);

  const { library, account, chainId, activate, deactivate } = useWeb3React();

  const { sign: signWallet } = useWalletSigner(
    library as providers.Web3Provider
  );


  const [inventoryZero, setInventoryZero] = useAtom(inventoryZeroAtom);
  const [inventoryIngameWhitelistZero, setInventoryIngameWhitelistZero] = useAtom(inventoryInGameWhitelistZeroAtom);
  const [isRefreshing, setIsRefreshing] = useAtom(isRefreshingAtom)

  const [selectedServer, setSelectedServer] = useAtom(selectedServerAtom);
  useEffect(() => {
    if (!selectedServer.serverID) return
    onReloadZeroWhitelistInventory()
  }, [selectedServer])

  const onReloadZeroWhitelistInventory = () => {
    if (isRefreshing || !selectedServer.gameId || !selectedServer.serverID) return;
    setIsRefreshing(true);
    const zeroInventoryWhitelist = marketService.getUserWhiteListItem(selectedServer.gameId, userCookie?.token, selectedServer.serverID)
      .then(res => {
        const whitelistItems = res as MarketItemResponseDTO
        setInventoryIngameWhitelistZero(whitelistItems)
      })
      .catch(err => {   })
      .finally(() => { setIsRefreshing(false) })
  }


  const onItemClick = async (item: ItemDetail) => {
    
    if (userCookie?.walletAddress && !account) return toast.error(`Please connect your wallet`);

    const token = await signWallet(); // signWallet is a function from useWalletSigner hook

    if (!token) return;

    // const user = marketService.getUserGameInfo(gameId, token, ()=>{}) 

    userService.fetchZeroInfo(userCookie?.token, setCookie, removeCookie, setZeroEternalLoveAccountInfo, selectedServer.gameId, selectedServer.serverID).then((res: any) => {
      const zeroCharNames = res?.data?.data?.characterNames || []

      Swal.fire({
        title: `Mint ${item.itemName}`,
        inputValue: item.itemAmount,
        footer: `${item.itemId == 901260 ? `Rate: ${(1250000).toLocaleString(undefined, { maximumFractionDigits: 0 })} zeny` : ``}`,
        html: `<div>
        <div>${item.charName}</div>
        <input id="swal-input-number" type="number" class="swal2-input" placeholder="Amount">
        </div>`,
        // html: `
        //   <div id="swal-radio" class="swal2-radio">
        //   ${gameId === ZERO_ETERNAL_LOVE_GAME_ID ? zeroCharNames.map((char, index) =>
        //   `<input type="radio" name="character" id="character${index}" value="${index}">
        //     <label for="character${index}">${char.characterName}</label>`).join('') :
        //     `<input type="radio" name="character" id="character0" value="0">
        //     <label for="character0">${sealMetaverseAccountInfo?.gameUserId}</label>`}
        //   </div>
        //   <input id="swal-input-number" type="number" class="swal2-input" placeholder="Amount">`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Confirm",
        confirmButtonColor: 'rgb(253 120 118 / 1.0)',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          const selectedCharacterElement = document.querySelector('input[name="character"]:checked') as HTMLInputElement;
          const selectedCharacter = selectedCharacterElement ? selectedCharacterElement.value : null;
          const amountElement = document.getElementById('swal-input-number') as HTMLInputElement;
          const amount = amountElement ? amountElement.value : null;

          return new Promise((resolve, reject) => {
            // if (!selectedCharacter) {
            //   reject(gameId === ZERO_ETERNAL_LOVE_GAME_ID ? "Please select a character." : "Please select an account.");
            // } else if (!amount || Number(amount) <= 0) {
            //   reject("You need to enter a valid amount.");
            // } else {

              marketService.addMyInventory(selectedServer?.gameId, userCookie?.token, token, item.charId, item.itemId, item.itemName, item.itemOption, item.refineLevel, item.itemEffectCode, item.itemBag, Number(amount), item.itemType, selectedServer.serverID)
                .finally(() => {
                  marketService.getMyInventory(selectedServer?.gameId, userCookie?.token)
                    .then(res => {

                      setInventoryZero(res)
                    })
                    .catch(err => { console.log('inventoryZero: ', err) })
                })
              resolve({ selectedCharacter, amount: Number(amount) });
            // }
          });
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.value) {
          // console.log('Submitted with:', result.value);
        }
      }).catch(error => {
        Swal.showValidationMessage(`Request failed: ${error}`);
      });

    })

    return
  }

  const [isHideMarketWallet, setIsHideMarketWallet] = useAtom(isHideMarketWalletAtom);

  return (<>
    <div className="relative border-2 h-full  rounded-2xl bg-neutral-100 bg-opacity-90 pt-2">
      <span className={`absolute -top-2 -left-6 bg-secondary text-white px-3 py-1 rounded ${isHideMarketWallet ? `hidden` : ``}`}>In-Game
        <FontAwesomeIcon className={`cursor-pointer hover:animate-spin ml-2 ${isRefreshing && `animate-spin`}`} icon={faRefresh} onClick={() => { onReloadZeroWhitelistInventory() }} />
      </span>
      {/* <FontAwesomeIcon icon={faRefresh} onClick={() => { onReloadZeroWhitelistInventory() }} /> */}


      <div className="grid grid-cols-5 px-4 py-6 gap-10">
        {data?.characterBag?.map(item => (<>
          <div className="text-black">
            <div className="flex justify-center transition-all">
              <div className="relative">
                <div className="text-center">
                  {/* <div className="absolute -top-1 -left-0 bg-white bg- rounded-lg text-md font-bold px-1">{item.charName}xxxxxxx</div> */}
                  <Image alt='' src={`${item.itemPictureUrl}`} className={`cursor-pointer hover:scale-105 min-h-12 min-w-12`} height={100} width={100} onClick={() => onItemClick(item)} />
                  <div className="absolute -bottom-1 -right-1 bg-white bg-opacity-10 rounded-lg text-md font-bold px-1">{item.itemAmount}</div>
                </div>
              </div>
            </div>
          </div>
        </>))}
      </div>

      {/* <div className=" absolute top-0 -right-4">
        <ZeroSelectServer />
      </div> */}
    </div>
  </>)
}

export const ROM_SERVERS = [
  { gameId: 2,serverID: 10002, serverName: `New World` },
  // { gameId: 2,serverID: 10003, serverName: `Ayothaya` },
  // { gameId: 2,serverID: 10004, serverName: `Poseidon` }
]

export const RO_PC_SERVERS = [
  { gameId: 3, serverID: 1, serverName: `Tales Of ZERO` }
]
export const ZeroSelectServer = ({ className }: { className?: string }) => {

  const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
  const userCookie: IEonUserDetail = cookie["eonhub-auth"];
  const eonhubAPI = eonhubApiCreate(userCookie?.token);
  const userService = new UserService();
  const [zeroEternalLoveAccountInfo, setZeroEternalLoveAccountInfo] = useAtom(ZeroEternalLoveAccountInfoAtom);

  const activeClass = `translate-x-1/2   text-[1.5rem]  font-medium me-2 px-2.5 py-0.5 rounded bg-secondary text-white`
  const deactiveClass = `   text-[1.3rem]  font-medium me-2 px-2.5 py-0.5 rounded bg-white hover:bg-secondary ${className ? `${className}` : `text-neutral-500`} hover:text-white  shadow-md  rounded-md border-neutral-100  `
  const [selectedServer, setSelectedServer] = useAtom(selectedServerAtom);
  const [isToggle, setIsToggle] = useState(false);
  const [isRefreshing, setIsRefreshing] = useAtom(isRefreshingAtom);

  useEffect(() => {
    if (!selectedServer) return
    userService.fetchGameCharactersInfo(userCookie?.token, setCookie, removeCookie, setZeroEternalLoveAccountInfo, selectedServer.gameId,selectedServer.serverID);
  }, [selectedServer])

  return (<>

    <div className=" px-10  w-fit float-right     ">
      {/* <button onClick={() => setIsToggle(!isToggle)} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800" type="button">Dropdown button <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
      </svg>
      </button> */}
      {/* <button onClick={() => setIsToggle(!isToggle)} >
        BBB
      </button> */}
      <div className={`z-10 text-white transition-all ${isToggle ? `scale-y-100` : `scale-y-100`}     rounded-lg   min-w-44  `}>
        {/* <div className={`text-black`} onClick={() => setSelectedServer(`New World`)}>New World</div>
        <div className={`text-black`} onClick={() => setSelectedServer(`New World`)}>ASIA012</div> */}
        <span className={`cursor-pointer transition-all  ${selectedServer?.serverID == ROM_SERVERS[0]?.serverID ? activeClass : deactiveClass}`} onClick={() => {
          if (isRefreshing) return
          setSelectedServer(ROM_SERVERS[0])
        }}>{ROM_SERVERS[0]?.serverName}</span>
        {/* <span className={`cursor-pointer transition-all  ${selectedServer?.serverID == ROM_SERVERS[1]?.serverID ? activeClass : deactiveClass}`} onClick={() => {
          if (isRefreshing) return
          setSelectedServer(ROM_SERVERS[1])
        }}>{ROM_SERVERS[1].serverName}</span>
        <span className={`cursor-pointer transition-all  ${selectedServer?.serverID == ROM_SERVERS[2]?.serverID ? activeClass : deactiveClass}`} onClick={() => {
          if (isRefreshing) return
          setSelectedServer(ROM_SERVERS[2])
        }}>{ROM_SERVERS[2].serverName}</span> */}

      </div>

    </div>

  </>)
}