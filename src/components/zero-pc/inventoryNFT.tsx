import { SealMetaverseAccountInfoAtom, ZeroEternalLoveAccountInfoAtom, marketZeroAtom, inventoryZeroAtom, userMarketHistoryZeroAtom, userMarketListZeroAtom, selectedServerAtom } from "@/atoms/eonhub";
import { eonhubApiCreate } from "@/axios";
import { useWalletSigner } from "@/hooks/useWeb3Token";
import MarketService, { InventoryResponseDTO, MarketHistoryResponse, MarketList } from "@/services/market.service";
import UserService from "@/services/user.service";
import { IEonUserDetail, RO_ZERO_PC_GAME_ID, ZERO_ETERNAL_LOVE_GAME_ID } from "@/types/eonhub";
import { IZeroEternalLoveCharInfo } from "@/types/zero-eternal-love";
import { useWeb3React } from "@web3-react/core";
import { providers } from "ethers";
import { useAtom } from "jotai";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Image from 'next/image'
import { useEffect } from "react";

export const InventoryNftZeroPC = ({ data, gameId }: { data: InventoryResponseDTO[], gameId: number }) => {

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


  const [marketZero, setMarketZeroAtom] = useAtom(marketZeroAtom);
  const [inventoryZero, setInventoryZero] = useAtom(inventoryZeroAtom);
  const [userMarketHistoryZero, setUserMarketHistoryZero] = useAtom(userMarketHistoryZeroAtom);
  const [userMarketListZero, setUserMarketListZero] = useAtom(userMarketListZeroAtom);

  const [selectedServer, setSelectedServer] = useAtom(selectedServerAtom);

  const refreshInventory = () => {
    const inventoryZero = marketService.getMyInventory(selectedServer?.gameId, userCookie?.token)
      .then(res => {

        setInventoryZero(res)
      })
      .catch(err => { console.log('inventoryZero: ', err) })
  }
  useEffect(() => {
    refreshInventory()
  },[selectedServer])

  const onItemClick = async (item: InventoryResponseDTO) => {
 
    Swal.fire({
      title: `${item.itemName}`,
      input: "radio",
      inputOptions: [ `SELL`,`SEND TO GAME`],
      showCancelButton: true,
      confirmButtonText: "Confirm",
      confirmButtonColor: 'rgb(253 80 78 / 1.0)',
      cancelButtonText: "Cancel",
      cancelButtonColor: 'rgb(253 120 118 / 1.0)',
      showLoaderOnConfirm: true,
      inputValidator: (value) => {
        // const result: IZeroEternalLoveCharInfo = zeroEternalLoveAccountInfo?.characterNames[value];
        return new Promise((resolve) => {
          if (value === null) {
            resolve("Please select an option.")
          } else {
            resolve();
          }
        });
      },
      preConfirm: async (option) => {
        try {
          // After Confirm  
          if (option == 0) { onSellItem(item); }
          if (option == 1) { onSendToGame(item); }
          // if (option == 2) { onExchangeItem(item); }
          
          return option
        } catch (error) {
          Swal.showValidationMessage(`
                    Request failed: ${error}
                  `);
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => { });
    // })

  }


  const onSendToGame = async (item: InventoryResponseDTO) => { 
    userService.fetchZeroInfo(userCookie?.token, setCookie, removeCookie, setZeroEternalLoveAccountInfo, selectedServer.gameId, selectedServer.serverID).then(async (res: any) => {
      const zeroCharNames = res?.data?.data?.characterNames || []

      // const token = await signWallet(); // signWallet is a function from useWalletSigner hook
      // if (!token) return;


      if (userCookie.walletAddress && !account) return toast.error(`Please connect your wallet !`);
      let token = null;
      if (userCookie?.walletAddress) {
        
        if (account.toLowerCase() == userCookie?.walletAddress?.toLowerCase()) {
          token = await signWallet(); // signWallet is a function from useWalletSigner hook 
        }
        if (!token) return;
      }


      Swal.fire({
        title: `Sending to Game`,
        text: `${item.itemName}`,
        inputValue: item.itemAmount,
        html: `
          <div id="swal-radio" class="swal2-radio">${zeroCharNames.map((char, index) =>
          `<input type="radio" name="character" id="character${index}" value="${index}">
            <label for="character${index}">${char.characterName}</label>`).join('')}
          </div>
          <input id="swal-input-number" type="number" class="swal2-input" placeholder="Amount">`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Confirm",
        confirmButtonColor: 'rgb(253 120 118 / 1.0)',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          const selectedCharacterElement = document.querySelector('input[name="character"]:checked') as HTMLInputElement;
          const selectedCharacter = selectedCharacterElement ? selectedCharacterElement.value : null;
          const amountElement = document.getElementById('swal-input-number') as HTMLInputElement;
          const amountToSend = amountElement ? amountElement.value : null;
          const sendingToChar: IZeroEternalLoveCharInfo = zeroCharNames[selectedCharacterElement?.value]
          return new Promise((resolve, reject) => {
            if (!selectedCharacter) {
              reject(gameId === selectedServer.gameId ? "Please select a character." : "Please select an account.");
            } else if (!amountToSend || Number(amountToSend) <= 0) {
              reject("You need to enter a valid amount.");
            } else {
              marketService.addItemToGame(selectedServer?.gameId, userCookie?.token, item.inventoryId, sendingToChar.characterId, Number(amountToSend), selectedServer.serverID, token)
                .then(res => {
                  marketService.getMyInventory(selectedServer?.gameId, userCookie?.token)
                    .then(res => {

                      setInventoryZero(res)
                    })
                    .catch(err => { console.log('inventoryZero: ', err) })
                })

              resolve({ selectedCharacter, amount: Number(amountToSend) });
            }
          });
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.value) {
          console.log('Submitted with:', result.value);
        }
      }).catch(error => {
        Swal.showValidationMessage(`Request failed: ${error}`);
      });

    })
  }

  const onExchangeItem = async (item: InventoryResponseDTO) => {
    
    if (userCookie?.walletAddress && !account) return toast.error(`Please connect your wallet`);

    const token = await signWallet(); // signWallet is a function from useWalletSigner hook

    if (!token) return;

    Swal.fire({
      title: `Selling item`,
      text: `${item.itemName}`,
      inputValue: item.itemAmount,
      html: `
          
          <input id="swal-input-number" type="number" class="swal2-input" placeholder="Amount">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Confirm",
      confirmButtonColor: 'rgb(253 120 118 / 1.0)',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        const selectedCharacterElement = document.querySelector('input[name="character"]:checked') as HTMLInputElement;
        const selectedCharacter = selectedCharacterElement ? selectedCharacterElement.value : null;
        const amountElement = document.getElementById('swal-input-number') as HTMLInputElement;
        const amountToSend = amountElement ? amountElement.value : null;
        const priceElement = document.getElementById('swal-input-price') as HTMLInputElement;
        const sendingToChar: IZeroEternalLoveCharInfo = zeroEternalLoveAccountInfo?.characterNames[selectedCharacterElement?.value]
        return new Promise<void>((resolve, reject) => {
          // if (!selectedCharacter) {
          //   reject(gameId === ZERO_ETERNAL_LOVE_GAME_ID ? "Please select a character." : "Please select an account.");
          // } else 
          if (!amountToSend || Number(amountToSend) <= 0) {
            reject("You need to enter a valid amount.");
          // } else if (!priceToSell || Number(priceToSell) <= 0) {
          //   reject("You need to enter a valid price.");
          } else {
            marketService.useZenCoin(RO_ZERO_PC_GAME_ID, userCookie?.token, item.inventoryId, Number(amountToSend), selectedServer.gameId, 0).finally(() => {
              marketService.getMyInventory(RO_ZERO_PC_GAME_ID, userCookie?.token)
                .then(res => {
                  setInventoryZero(res)
                  const marketZeroInventory2 = marketService.getMarketItemList(selectedServer.gameId, userCookie?.token)
                    .then(res => {
                      const marketItem = res as MarketList[] || [];
                      setMarketZeroAtom(marketItem)
                      // setmarketZeroInventory(res)

                      const marketZeroHistory = marketService.getMarketHistory(selectedServer.gameId, userCookie?.token, true, "SELL")
                        .then(res => {
                          const marketHistory = res as MarketHistoryResponse[] || [];
                          setUserMarketHistoryZero(marketHistory)
                          // setUserMarketHistoryZero(marketHistory)
                          // setMarketZeroAtom(marketItem)
                          // setmarketZeroInventory(res)
                          const zeroUserMarketList = marketService.getMyMarketItemList(selectedServer?.gameId, userCookie?.token)
                            .then(res => {
                              const userMarketList = res as MarketList[]
                              setUserMarketListZero(userMarketList)
                            })
                            .catch(err => { console.log('marketZeroInventory: ', err) })
                        })
                        .catch(err => { console.log('marketZeroInventory: ', err) })
                    })
                    .catch(err => { console.log('marketZeroInventory: ', err) })
                })
                .catch(err => { console.log('inventoryZero: ', err) })
            })
            resolve();
          }
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        console.log('Submitted with:', result.value);
      }
    }).catch(error => {
      Swal.showValidationMessage(`Request failed: ${error}`);
    });
  }
  
  
  const onSellItem = async (item: InventoryResponseDTO) => {
    
    if (userCookie?.walletAddress && !account) return toast.error(`Please connect your wallet`);

    const token = await signWallet(); // signWallet is a function from useWalletSigner hook

    if (!token) return;

    Swal.fire({
      title: `Selling item`,
      text: `${item.itemName}`,
      inputValue: item.itemAmount,
      html: `
          
          <input id="swal-input-price" type="number" class="swal2-input" placeholder="Price">
          <input id="swal-input-number" type="number" class="swal2-input" placeholder="Amount">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Confirm",
      confirmButtonColor: 'rgb(253 120 118 / 1.0)',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        const selectedCharacterElement = document.querySelector('input[name="character"]:checked') as HTMLInputElement;
        const selectedCharacter = selectedCharacterElement ? selectedCharacterElement.value : null;
        const amountElement = document.getElementById('swal-input-number') as HTMLInputElement;
        const amountToSend = amountElement ? amountElement.value : null;
        const priceElement = document.getElementById('swal-input-price') as HTMLInputElement;
        const priceToSell = priceElement ? priceElement.value : null;
        const sendingToChar: IZeroEternalLoveCharInfo = zeroEternalLoveAccountInfo?.characterNames[selectedCharacterElement?.value]
        return new Promise<void>((resolve, reject) => { 
          if (!amountToSend || Number(amountToSend) <= 0) {
            reject("You need to enter a valid amount.");
          } else if (!priceToSell || Number(priceToSell) <= 0) {
            reject("You need to enter a valid price.");
          } else {
            marketService.sellItem(selectedServer.gameId, userCookie?.token, item.inventoryId, Number(priceToSell), Number(amountToSend), selectedServer.serverID).finally(() => {
              marketService.getMyInventory(selectedServer.gameId, userCookie?.token)
                .then(res => {
                  setInventoryZero(res)
                  const marketZeroInventory2 = marketService.getMarketItemList(selectedServer.gameId, userCookie?.token)
                    .then(res => {
                      const marketItem = res as MarketList[] || [];
                      setMarketZeroAtom(marketItem)
                      // setmarketZeroInventory(res)

                      const marketZeroHistory = marketService.getMarketHistory(selectedServer.gameId, userCookie?.token, true, "SELL")
                        .then(res => {
                          const marketHistory = res as MarketHistoryResponse[] || [];
                          setUserMarketHistoryZero(marketHistory)
                          // setUserMarketHistoryZero(marketHistory)
                          // setMarketZeroAtom(marketItem)
                          // setmarketZeroInventory(res)
                          const zeroUserMarketList = marketService.getMyMarketItemList(selectedServer?.gameId, userCookie?.token)
                            .then(res => {
                              const userMarketList = res as MarketList[]
                              setUserMarketListZero(userMarketList)
                            })
                            .catch(err => { console.log('marketZeroInventory: ', err) })
                        })
                        .catch(err => { console.log('marketZeroInventory: ', err) })
                    })
                    .catch(err => { console.log('marketZeroInventory: ', err) })
                })
                .catch(err => { console.log('inventoryZero: ', err) })
            })
            resolve();
          }
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value) {
        console.log('Submitted with:', result.value);
      }
    }).catch(error => {
      Swal.showValidationMessage(`Request failed: ${error}`);
    });
  }

  // white left tab
  return data && (<>
    <div className="relative border-2 h-full rounded-2xl bg-neutral-600 bg-opacity-95">
      <span className="absolute -top-2 -left-6 bg-primary text-white px-3 py-1 rounded">NFT Inventory</span>
      <div className="grid grid-cols-5 pl-4 pr-10 py-6 gap-10">
        {data?.map(item => (<>
          <div className="text-black">
            <div className="flex justify-center transition-all">
              <div className="relative">
                <div className="text-center">
                  <Image alt='' src={`${item.itemPictureUrl}`} className={`cursor-pointer hover:scale-105 min-h-12 min-w-12`} height={100} width={100} onClick={() => onItemClick(item)} />
                  <div className="absolute -bottom-2 -right-4 text-white bg-white bg-opacity-10 rounded-lg text-md font-bold px-2">{item.itemAmount}</div>
                </div>
              </div>
            </div>
          </div>
        </>))}
      </div>
    </div>
  </>)
}