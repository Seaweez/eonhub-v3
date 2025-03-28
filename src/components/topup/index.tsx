import { useEthers } from "@usedapp/core";
import { useAtom } from "jotai"; 
import { eonhubApiCreate, googleApiCreate } from "../../axios";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp, faUserAstronaut, faUserLock } from "@fortawesome/free-solid-svg-icons";
import { useCookies } from "react-cookie";
import UserService from "../../services/user.service";
import { JSXElementConstructor, ReactElement, ReactFragment, ReactPortal, useEffect } from "react";
import { providers } from "ethers";
import Swal from "sweetalert2";
import { useWalletSigner } from "../../hooks/useWeb3Token";
import { GoogleAuthUserInfoAtom, eonhubUserDetailAtom, selectedServerAtom } from "@/atoms/eonhub";
import { IEonUserDetail } from "@/types/eonhub";

export interface IPresalePackageHistory {
    itemCode: string;
    packageName: string;
    packagePictureUrl: string;
    packageType: string;
    price: number;
    purchaseId: number;
    purchaseTime: string;
    usedItemCodeCounts: number;
    usedItemCodeMaxCond: number;
}

export const TopupPanel = () => { 

    // { Purchase History }
    // const [presaleHistory, setPresaleHistory] = useAtom(PresalePackageHistoryAtom)
    const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
    const userCookie: IEonUserDetail = cookie["eonhub-auth"];
    const userService = new UserService();
    const eonhubAPI = eonhubApiCreate(userCookie?.token);


    const { active, error, activate, chainId, account, setError, library, activateBrowserWallet, deactivate } =
        useEthers();
    const { sign: signWallet } = useWalletSigner(
        library as providers.Web3Provider
    );


    const fetchPurchaseHistory = async () => {
        const response = await eonhubAPI.get(
            `/api/package/1/history?page=1&packageType=PRE_SALES`,
            {
                // token: codeResponse.access_token,
                // email: userInfoReq.data.email,
                // gameId: SealMetaverseGameID,
                // refererCode: refCode ? refCode : ``,
            }
        );
        
        if (response && response?.data && response?.data?.data) {
            // setPresaleHistory(response?.data?.data || [])
        }
    }
    useEffect(() => {
        if (!userCookie?.token) return
        fetchPurchaseHistory()
    }, [userCookie])



    const redeemItemcode = async () => {
        try {
            // const token = await signWallet(); 
            // if (!token) return;

            Swal.fire({
                title: `Redeem Itemcode`,
                text: `UID: ${userCookie?.userId} - ${userCookie?.email}`,
                footer: `Sent to game-account registered with the same email !`,
                showCancelButton: true,
                confirmButtonText: "Confirm",
                showLoaderOnConfirm: true,
                input: "text",
                inputAttributes: {
                    autocapitalize: "off",
                },
                preConfirm: async (code) => {
                    try {

                        const id = toast.loading("Pending ...")
                        const req = requestRedeemItemcode(code, 'token').then((res) => {
                            if (res?.status == 200) {
                                toast.update(id, {render: `Successfully Redeem '${code}'`, type: "success", isLoading: false, autoClose: 2000});
                                userService.fetchUserInfo(userCookie?.token, setCookie, removeCookie, () => { });
                            } else {
                                toast.update(id, {render: 'Somethine went wrong.', type: "error", isLoading: false, autoClose: 2000});
                            }
                        }).catch(err => {
                            toast.update(id, {render: err.response.data.message, type: "error", isLoading: false, autoClose: 2000});
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
    const [selectedServer, setSelectedServer] = useAtom(selectedServerAtom);
    const requestRedeemItemcode = async (code: string, signToken: string) => {
        return await eonhubAPI.post(
            `api/package/apply`, {
            itemCode: code,
            serverId: selectedServer.serverID
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userCookie?.token}`
            }
        },)

    }

    return (<>
        <div className="text-white text-center mt-32">
            <div> 123123</div>
        </div>
    </>)
}
