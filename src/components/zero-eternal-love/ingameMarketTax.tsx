import { SealMetaverseAccountInfoAtom, ZeroEternalLoveAccountInfoAtom, marketZeroAtom, marketZeroInventoryAtom, inventoryZeroAtom, marketZeroTaxAtom, asia011IngameTaxAtom, asia012IngameTaxAtom, asia013IngameTaxAtom } from "@/atoms/eonhub";
import { eonhubApiCreate } from "@/axios";
import { useWalletSigner } from "@/hooks/useWeb3Token";
import MarketService, { MarketList } from "@/services/market.service";
import UserService from "@/services/user.service";
import { IEonUserDetail, ZERO_ETERNAL_LOVE_GAME_ID } from "@/types/eonhub";
import { cn } from "@/utils/styling";
import { useWeb3React } from "@web3-react/core";
import { format } from "date-fns";
import { providers } from "ethers";
import { useAtom } from "jotai";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { SwiperSlide } from "swiper/react";
import Image from 'next/image'
import { faArrowDownWideShort, faArrowUpWideShort } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins, faBank, faChartLine } from "@fortawesome/free-solid-svg-icons";

export const IngameMarketTax = () => {

    const { library, account, chainId, activate, deactivate } = useWeb3React();

    const [sealMetaverseAccountInfo, setSealMetaverseAccountInfo] = useAtom(SealMetaverseAccountInfoAtom);
    const [zeroEternalLoveAccountInfo, setZeroEternalLoveAccountInfo] = useAtom(ZeroEternalLoveAccountInfoAtom);

    const marketService = new MarketService()
    const [marketZero, setMarketZeroAtom] = useAtom(marketZeroAtom);


    const { sign: signWallet } = useWalletSigner(
        library as providers.Web3Provider
    );


    const [cookie, setCookie, removeCookie] = useCookies(["eonhub-auth"]);
    const userCookie: IEonUserDetail = cookie["eonhub-auth"];
    const eonhubAPI = eonhubApiCreate(userCookie?.token);

    const [asia011IngameTax, setAsia011IngameTax] = useAtom(asia011IngameTaxAtom)
    const [asia012IngameTax, setAsia012IngameTax] = useAtom(asia012IngameTaxAtom)
    const [asia013IngameTax, setAsia013IngameTax] = useAtom(asia013IngameTaxAtom)

    const [allowRefetch, setAllowRefetch] = useState(true);

    const userService = new UserService();
    const refrestData = () => {

        // if (!userCookie || !userCookie?.token) return
        if (!asia011IngameTax.prviousTax || !asia011IngameTax.currentTax) {
            if (!allowRefetch) return
            const marketZeroIngameTaxASIA011 = marketService.getIngameMarketTaxV2(10002, userCookie?.token)
                .then(res => {
                    setAsia011IngameTax({ prviousTax: Number(res?.prviousTax), currentTax: Number(res?.currentTax), last_update: Date.now()}) 
                    // localStorage.setItem("asia011IngameTax", JSON.stringify({ prviousTax: Number(res?.prviousTax), currentTax: Number(res?.currentTax) }))
                    // localStorage.setItem("asia011IngameTaxDate", JSON.stringify(Date.now()))
                })
                .catch(err => { console.log('marketZeroIngameTaxASIA011: ', err) })

        }
        if (!asia012IngameTax.prviousTax || !asia012IngameTax.currentTax) {
            const marketZeroIngameTaxASIA012 = marketService.getIngameMarketTaxV2(10003, userCookie?.token)
                .then(res => {
                    setAsia012IngameTax({ prviousTax: Number(res?.prviousTax), currentTax: Number(res?.currentTax), last_update: Date.now() })
                    // localStorage.setItem("asia012IngameTax", JSON.stringify({ prviousTax: Number(res?.prviousTax), currentTax: Number(res?.currentTax) }))
                    // localStorage.setItem("asia012IngameTaxDate", JSON.stringify(Date.now()))
                })
                .catch(err => { console.log('marketZeroIngameTaxASIA012: ', err) })

        }
        if (!asia013IngameTax.prviousTax || !asia013IngameTax.currentTax) {
            const marketZeroIngameTaxASIA013 = marketService.getIngameMarketTaxV2(10004, userCookie?.token)
                .then(res => {
                    setAsia013IngameTax({ prviousTax: Number(res?.prviousTax), currentTax: Number(res?.currentTax), last_update: Date.now() })
                    // localStorage.setItem("asia012IngameTax", JSON.stringify({ prviousTax: Number(res?.prviousTax), currentTax: Number(res?.currentTax) }))
                    // localStorage.setItem("asia012IngameTaxDate", JSON.stringify(Date.now()))
                })
                .catch(err => { console.log('marketZeroIngameTaxASIA014: ', err) })

        }
    }
 

    // let value = localStorage.getItem("favoriteNumber") || ""

      
  const [taxTreasuryData, setTaxTreasuryData] = useState({
    currentTax: 0,
    prviousTax: 0,
  });

  const fetchZeroPCTaxData = async () => {
    try {
      const response = await fetch(
        `${process?.env?.NEXT_PUBLIC_ZERO_PC_API_URL}/treasury/tax`
      );
      const data = await response.json(); 
      if (data?.data && data?.data?.currentTax) {
        setTaxTreasuryData(data?.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

    useEffect(() => {

        let now = +new Date();
        const oneDay = 60 * 60 * 24;
        // const last011fetch = localStorage.getItem("asia011IngameTax");
        // const last012fetch =localStorage.getItem("asia012IngameTax");
        // const last011fetchDate = Date.parse(localStorage.getItem("asia011IngameTaxDate"));
        // const last012fetchDate = Date.parse(localStorage.getItem("asia012IngameTaxDate"));
        const last011fetchOneDayPast = (now - asia011IngameTax.last_update) > oneDay;
        const last012fetchOneDayPast = (now - asia012IngameTax.last_update) > oneDay;
        // debugger
        // console.log('last011fetch: ',last011fetch)
        if ((!last011fetchOneDayPast && asia011IngameTax?.currentTax)){
            // return setAsia011IngameTax(JSON.parse(last011fetch))
            // return
        }
        if ((!last012fetchOneDayPast && asia012IngameTax?.currentTax)){
            // return setAsia012IngameTax(JSON.parse(last012fetch))
            // return
        }

        refrestData();
        fetchZeroPCTaxData();

        // refrestData()

        // localStorage.getItem("asia011IngameTax") || localStorage.getItem("asia012IngameTax") ? setAllowRefetch(false) : setAllowRefetch(true)

        // localStorage.setItem("asia011IngameTax", JSON.stringify(now))
        // localStorage.setItem("asia012IngameTax", JSON.stringify(now))
    }, [])

    const [displayHistoratASIA011, setDisplayHistoratASIA011] = useState(false);
    const [displayHistoratASIA012, setDisplayHistoratASIA012] = useState(false);

    return (<>
         
        <section 
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-[90%] md:max-w-[600px] bg-white shadow-lg p-4 rounded-xl border border-gray-300 z-[9999] transition-all duration-300">
            
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
                
                {/* Zero New World */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-md  ">
                    <h2 className="text-lg font-bold text-gray-800 text-center">🌍 Zero New World</h2>
                    <div className="text-sm text-gray-600 flex justify-between">
                        <span>💰 Trading Volume:</span>
                        <span className="font-semibold text-yellow-600">
                            {(asia011IngameTax?.currentTax * 5 || 0).toLocaleString()}z
                        </span>
                    </div>
                    <div className="text-sm text-gray-600 flex justify-between">
                        <span>🏦 Treasury:</span>
                        <span className="font-semibold text-blue-600">
                            {(asia011IngameTax?.currentTax || 0).toLocaleString()}z
                        </span>
                    </div>
                    <div className="text-sm text-gray-600 flex justify-between">
                        <span>📊 Previous Week Tax:</span>
                        <span className="font-semibold text-red-600">
                            {(asia011IngameTax?.prviousTax || 0).toLocaleString()}z
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">Reset: Wed 19:00 (GMT+8)</p>
                </div>


                {/* Zero New World */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-bold text-gray-800 text-center">🌍 WANO</h2>
                    <div className="text-sm text-gray-600 flex justify-between">
                        <span>💰 Trading Volume:</span>
                        <span className="font-semibold text-yellow-600">
                            {(asia012IngameTax?.currentTax * 5 || 0).toLocaleString()}z
                        </span>
                    </div>
                    <div className="text-sm text-gray-600 flex justify-between">
                        <span>🏦 Treasury:</span>
                        <span className="font-semibold text-blue-600">
                            {(asia012IngameTax?.currentTax || 0).toLocaleString()}z
                        </span>
                    </div>
                    <div className="text-sm text-gray-600 flex justify-between">
                        <span>📊 Previous Week Tax:</span>
                        <span className="font-semibold text-red-600">
                            {(asia012IngameTax?.prviousTax || 0).toLocaleString()}z
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">Reset: Wed 19:00 (GMT+8)</p>
                </div>

                {/* Tales Of ZERO */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-bold text-gray-800 text-center">📖 Tales Of ZERO</h2>
                    <div className="text-sm text-gray-600 flex justify-between">
                        <span>💰 Trading Volume:</span>
                        <span className="font-semibold text-yellow-600">
                            ~{(taxTreasuryData.currentTax * 6.6 || 0).toLocaleString()}z
                        </span>
                    </div>
                    <div className="text-sm text-gray-600 flex justify-between">
                        <span>🏦 Treasury:</span>
                        <span className="font-semibold text-blue-600">
                            {(taxTreasuryData.currentTax || 0).toLocaleString()}z
                        </span>
                    </div>
                </div>

            </div>
        </section>
    </>)
}