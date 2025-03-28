import Image from 'next/image';
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { eonhubApiCreate } from "../../axios";

import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useEthers } from "@usedapp/core";
import { providers } from "ethers";
import { useWalletSigner } from "../../hooks/useWeb3Token";
import UserService from "../../services/user.service";
import { IEonUserDetail, IPackageDetail, IPresalePackage } from "@/types/eonhub";
import { selectedTopupPackageAtom, topupPackageListAtom } from '@/atoms/seal';
import AlertDialog from "./dialog";

export function TopupPackage(topupPackage: IPresalePackage) {
    const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
    const userCookie: IEonUserDetail = cookie["eonhub-auth"];
    const eonhubAPI = eonhubApiCreate(userCookie?.token);
    const [purchasing, setPurchasing] = useState(false);

    const [topupPackageList, setTopupPackageList] = useAtom(topupPackageListAtom);
    const [selectedTopupPackage, setSelectedTopupPackage] = useAtom(selectedTopupPackageAtom);

    const userService = new UserService();

    const { active, error, activate, chainId, account, setError, library, activateBrowserWallet, deactivate } = useEthers();

    const { sign: signWallet } = useWalletSigner(
        library as providers.Web3Provider
    );




    useEffect(() => {
        if (topupPackageList && topupPackageList.length && topupPackageList.find(e => Number(e.packageId) == 3)) {
            setSelectedTopupPackage(topupPackageList.find(e => Number(e.packageId) == 3));
        }
    }, [topupPackageList])

    const handlePurchase = async (purchaseItem: IPresalePackage) => {

        try {
            const token = await signWallet(); // signWallet is a function from useWalletSigner hook

            if (!token) return;

            Swal.fire({
                title: `Buying Package ${purchaseItem?.packageName}`,
                showCancelButton: true,
                confirmButtonText: "Confirm",
                showLoaderOnConfirm: true,
                preConfirm: async (amount) => {
                    try {
                        const id = toast.loading("Pending ...")
                        const req = purchasePackage(purchaseItem, token).then((res) => {
                            if (res?.status == 200) {
                                toast.update(id, { render: `Success purchase ${purchaseItem?.packageName}`, type: "success", isLoading: false, autoClose: 2000 });
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

    const purchasePackage = async (purchaseItem: IPresalePackage, signToken: string) => {
        return await eonhubAPI.post(
            `/api/package/${2}/purchase/${purchaseItem?.packageId}`, {
            walletToken: signToken
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userCookie?.token}`
            }
        },)

    }

    return (
        <div className={`PresalePackage text-white pt-8  flex justify-center `} onClick={() => setSelectedTopupPackage(topupPackage?.packageId === selectedTopupPackage?.packageId ? undefined : topupPackage)} >

            <div className={`relative lg:top-0 justify-center transition-opacity opacity-50 hover:opacity-100 ${selectedTopupPackage?.packageId && selectedTopupPackage?.packageId !== topupPackage.packageId && `  `}`} >
                <img src={`${topupPackage?.packagePictureUrl}`} alt={`${topupPackage?.packagePictureUrl}`} className="h-32 transition-all mx-auto hover:scale-110 cursor-pointer" />

                <div className="text-center mt-3 font-extrabold">{`Shiltz Metaverse TOPUP`}</div>
                <div className="text-center">{topupPackage.packageName}</div>
                <div className="mt-2 mx-auto text-center font-extrabold bg-gray-700 hover:text-white py-2 hover:bg-violet-900 rounded w-fit py-1 px-4 hover:bg-gray-800 cursor-pointer"
                    onClick={(e: any) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handlePurchase(topupPackage);
                        // setPurchasing(true);
                    }}>
                    <div className="flex justify-center ">
                        <div className="my-auto mr-1">
                            {topupPackage.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                        <Image alt="user-eon-coin" src="/images/eonCoin.png" className="" width={30} height={25} />
                    </div>
                </div>
                <div className="flex justify-center mt-2">
                    <div className="text-sm mt-1">

                        {`( ~${Math.floor(topupPackage.price / 10).toLocaleString(undefined, { maximumFractionDigits: 0 })}$ )`}
                    </div>
                </div>
                {purchasing && <AlertDialog />}
            </div>
            <div className="fixed z-10 top-1/2 left-2/4 h-auto" style={{ minWidth: `75%`, marginLeft: `-5%` }}>
                {<div className={`grid ${topupPackage.packageDetails.length > 1 ? `grid-cols-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10` : `p-8`} gap-6 mt-10 w-fit transition-all p-4 border-2 border-emerald-400 rounded-3xl ${selectedTopupPackage?.packageId === topupPackage?.packageId ? `scale-x-0 ` : `scale-x-0 h-0 `}`}>
                    <div className="bg-gradient-to-r from-teal-500 to-emerald-500 opacity-20 z-0 w-full h-full absolute rounded-3xl top-0 left-0"></div>

                    {/* {topupPackage?.packageId == 1 && <TopupPromoDetail {...{ itemId: `888`, itemAmount: 1, itemUrl: `/assets/packs/cos-c.png`, itemDescription: `Random Costume All +5` }} />}
                    {topupPackage?.packageId == 2 && <TopupPromoDetail {...{ itemId: `888`, itemAmount: 1, itemUrl: `/assets/packs/cos-uc.png`, itemDescription: `Random Costume All +25` }} />}
                    {topupPackage?.packageId == 3 && <TopupPromoDetail {...{ itemId: `888`, itemAmount: 1, itemUrl: `/assets/packs/cos-r.png`, itemDescription: `Random Costume All +50` }} />} */}

                    {topupPackage.packageDetails.map(item => (<>
                        <TopupPackageDetail {...item} />
                    </>))}
                </div>}
            </div>
        </div>
    );
}


function TopupPackageDetail(packageDetail: IPackageDetail) {
    return (
        <div className="group flex relative justify-center">
            <span className="rounded text-sm text-black flex cursor-pointer p-3" id="tooltip-default" role="tooltip" >
                <div className="bg-gray-900 opacity-20 z-0 w-full h-full absolute rounded-2xl top-0 left-0"></div>
                <div className="text-center relative z-10 my-auto ">
                    <div className="flex justify-center">
                        <img alt="item-img" src={packageDetail?.itemUrl && `${packageDetail?.itemUrl}`} className="h-12 w-auto mb-3 object-fit" />
                    </div>

                    <p className="text-white">   {packageDetail?.itemDescription}</p>
                    
                </div>
            </span>
            <span className="z-20 cursor-pointer transition-opacity bg-gray-700 px-1 text-sm text-gray-100 rounded-md absolute left-1/2 -translate-x-1/2 translate-y-full opacity-0 m-4 mx-auto">
                {packageDetail?.itemDescription}
            </span>
        </div>
    );
}

function TopupPromoDetail(packageDetail: IPackageDetail) {
    return (
        <div className="group flex relative justify-center">
            <span className="rounded text-sm text-black flex cursor-pointer p-3" id="tooltip-default" role="tooltip" >
                <div className="bg-emerald-400   z-0 w-full h-full absolute rounded-2xl top-0 left-0"></div>
                <div className=" absolute bg-emerald-600 text-white rounded px-2 font-bold border-2 border-emerald-500 -top-2 -right-4" > Before OBT</div>
                <div className="text-center relative z-10 my-auto ">
                    <div className="flex justify-center">
                        <img alt="item-img" src={packageDetail?.itemUrl && `${packageDetail?.itemUrl}`} className="h-12 w-auto mb-3 object-fit" />
                    </div>

                    <p className="text-white">   {packageDetail?.itemDescription}</p>

                    <h3 className="my-auto mr-2 ml-2 font-bold text-white">x{packageDetail?.itemAmount}</h3> 
                </div>
            </span>
            <span className="z-20 cursor-pointer transition-opacity bg-gray-700 px-1 text-sm text-gray-100 rounded-md absolute left-1/2 -translate-x-1/2 translate-y-full opacity-0 m-4 mx-auto">
                {packageDetail?.itemDescription}
            </span>
        </div>
    );
}


function BuyModal(topupPackage: IPresalePackage) { 
    return (
        <div className="group flex relative justify-center">
            <span className="rounded text-sm text-black flex cursor-pointer p-3" id="tooltip-default" role="tooltip" >
                <div className="bg-gray-900 opacity-0 hover:opacity-100 z-0 w-full h-full absolute rounded-2xl top-0 left-0"></div>
                <div className="text-center relative z-10 my-auto">
                    <div className="flex justify-center">
                        X
                        {/* <img alt="item-img" src={presalePackage?.itemUrl && `${presalePackage?.itemUrl}`} className="h-16 w-16" /> */}
                    </div>
                    XXXX
                    {/* <h3 className="my-auto mr-2 ml-2 font-bold text-white">x{presalePackage?.itemAmount}</h3> */}
                    {/* <p className="my-auto mr-2 ml-2 font-bold">{packageDetail?.itemDescription}</p> */}
                </div>
            </span>
            <span className="group-hover:opacity-100 z-20 cursor-pointer transition-opacity bg-gray-700 px-1 text-sm text-gray-100 rounded-md absolute left-1/2 -translate-x-1/2 translate-y-full opacity-0 m-4 mx-auto">
                {/* {packageDetail?.itemDescription} */}
            </span>
        </div>
    );
}

const mockItemImage = [
    { itemId: 19, itemName: "Cashpoint", itemImage: '/assets/gamefi/items/cashpoint.png' },
    { itemId: 0, itemName: "Green Seed", itemImage: '/assets/gamefi/items/GreenSeed.png' },
    { itemId: 0, itemName: "Tiger", itemImage: '/assets/gamefi/items/tiger.png' },
    { itemId: 0, itemName: "รถขี่", itemImage: '/assets/gamefi/items/tiger.png' },
    { itemId: 0, itemName: 'BOT', itemImage: '/assets/gamefi/items/bot.png' },
    { itemId: 0, itemName: 'กล่องสุ่ม คอสตูม Common', itemImage: '/assets/gamefi/items/box1.png' },
    { itemId: 0, itemName: 'กล่องสุ่ม คอสตูม UnCommon', itemImage: '/assets/gamefi/items/box1.png' },
    { itemId: 0, itemName: 'กล่องสุ่ม คอสตูม Rare', itemImage: '/assets/gamefi/items/box1.png' },
    { itemId: 0, itemName: 'XXXXX', itemImage: undefined },
    { itemId: 0, itemName: 'XXXXX', itemImage: undefined }
]